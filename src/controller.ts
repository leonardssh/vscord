import { type Disposable, type WindowState, debug, languages, window, workspace, commands } from "vscode";
import { type SetActivity, type SetActivityResponse, Client } from "@xhayper/discord-rpc";
import { getApplicationId } from "./helpers/getApplicationId";
import { activity, onDiagnosticsChange } from "./activity";
import { StatusBarMode, editor } from "./editor";
import { throttle } from "./helpers/throttle";
import { logError, logInfo } from "./logger";
import { CONFIG_KEYS } from "./constants";
import { getConfig } from "./config";
import { dataClass } from "./data";

export class RPCController {
    listeners: Disposable[] = [];
    enabled = true;
    canSendActivity = true;
    manualIdleMode = false;
    manualIdling = false;
    state: SetActivity = {};
    debug = false;
    client: Client;

    private idleTimeout: NodeJS.Timeout | undefined;
    private iconTimeout: NodeJS.Timeout | undefined;
    private activityThrottle = throttle(
        (isViewing?: boolean, isIdling?: boolean) => this.sendActivity(isViewing, isIdling),
        2000,
        true
    );

    constructor(clientId: string, debug = false) {
        const config = getConfig();
        this.client = new Client({ clientId });
        this.debug = debug;
        this.manualIdleMode = config.get(CONFIG_KEYS.Status.Idle.Check) === false;

        editor.setStatusBarItem(StatusBarMode.Pending);

        this.client.login().catch(async (error: Error) => {
            const config = getConfig();

            logError("Encountered following error while trying to login:", error);
            editor.setStatusBarItem(StatusBarMode.Disconnected);
            editor.errorMessageFailedToConnect(config, error);
            await this.client?.destroy();
            logInfo("[002] Destroyed Discord RPC client");
        });

        this.client.on("debug", (...data) => {
            if (!this.debug) return;
            logInfo("[003] Debug:", ...data);
        });

        this.client.on("ready", this.onReady.bind(this));
        this.client.on("disconnected", this.onDisconnected.bind(this));
    }

    private onReady() {
        logInfo("Successfully connected to Discord");
        this.cleanUp();

        if (this.enabled) void this.enable();
        editor.setStatusBarItem(StatusBarMode.Succeeded);
    }

    private onDisconnected() {
        this.cleanUp();
        editor.setStatusBarItem(StatusBarMode.Disconnected);
    }

    private listen() {
        const config = getConfig();

        const sendActivity = (isViewing = false, isIdling = false) => {
            this.activityThrottle.reset();
            void this.sendActivity(isViewing, isIdling);
        };

        const fileSwitch = window.onDidChangeActiveTextEditor(() => sendActivity(true));
        const fileEdit = workspace.onDidChangeTextDocument((e) => {
            if (e.document !== window.activeTextEditor?.document) return;
            dataClass.updateGitInfo();
            void this.activityThrottle.callable();
        });
        const fileSelectionChanged = window.onDidChangeTextEditorSelection((e) => {
            if (e.textEditor !== window.activeTextEditor) return;
            dataClass.updateGitInfo();
            void this.activityThrottle.callable();
        });
        const debugStart = debug.onDidStartDebugSession(() => sendActivity());
        const debugEnd = debug.onDidTerminateDebugSession(() => sendActivity());
        const diagnosticsChange = languages.onDidChangeDiagnostics(() => onDiagnosticsChange());
        const changeWindowState = window.onDidChangeWindowState((e: WindowState) => this.checkIdle(e));

        // fire checkIdle at least once after loading
        this.checkIdle(window.state);

        if (config.get(CONFIG_KEYS.Status.Problems.Enabled)) this.listeners.push(diagnosticsChange);
        if (config.get(CONFIG_KEYS.Status.Idle.Check)) this.listeners.push(changeWindowState);

        this.listeners.push(fileSwitch, fileEdit, fileSelectionChanged, debugStart, debugEnd);
    }

    private checkCanSend(isIdling: boolean): boolean {
        const config = getConfig();
        let userId = this.client.user?.id;
        if (!userId) return false;
        if (isIdling && config.get(CONFIG_KEYS.Status.Idle.DisconnectOnIdle)) return (this.canSendActivity = false);
        let whitelistEnabled = config.get(CONFIG_KEYS.App.WhitelistEnabled);
        if (whitelistEnabled) {
            let whitelist = config.get(CONFIG_KEYS.App.Whitelist);
            if (config.get(CONFIG_KEYS.App.whitelistIsBlacklist))
                if (whitelist!.includes(userId)) return (this.canSendActivity = false);
                else return (this.canSendActivity = true);
            else if (!whitelist!.includes(userId)) return (this.canSendActivity = false);
        }
        return (this.canSendActivity = true);
    }

    private async checkIdle(windowState: WindowState) {
        if (!this.enabled) return;

        const config = getConfig();

        if (config.get(CONFIG_KEYS.Status.Idle.Timeout) !== 0) {
            if (windowState.focused && this.idleTimeout) {
                clearTimeout(this.idleTimeout);
                await this.sendActivity();
            } else if (config.get(CONFIG_KEYS.Status.Idle.Check)) {
                this.idleTimeout = setTimeout(
                    async () => {
                        if (!config.get(CONFIG_KEYS.Status.Idle.Check)) return;

                        if (
                            config.get(CONFIG_KEYS.Status.Idle.DisconnectOnIdle) &&
                            config.get(CONFIG_KEYS.Status.Idle.ResetElapsedTime)
                        ) {
                            delete this.state.startTimestamp;
                        }

                        if (!this.enabled) return;

                        this.activityThrottle.reset();
                        await this.sendActivity(false, true);
                    },
                    config.get(CONFIG_KEYS.Status.Idle.Timeout)! * 1000
                );
            }
        }
    }

    async login() {
        const { clientId } = getApplicationId(getConfig());
        logInfo("[004] Debug:", `Logging in with client ID "${clientId}"`);
        logInfo("[004] Debug:", "Login - isConnected", this.client.isConnected, "isReady", this.client.clientId);
        logInfo("[004] Debug:", `Login - ${this.client}`);

        if (this.client.isConnected && this.client.clientId === clientId) return;

        editor.setStatusBarItem(StatusBarMode.Pending);

        if (this.client.clientId !== clientId) await this.updateClientId(clientId);
        else if (!this.client.isConnected) await this.client.login();
    }

    async sendActivity(isViewing = false, isIdling = false): Promise<SetActivityResponse | undefined> {
        if (!this.enabled) return;
        if (this.manualIdleMode) isIdling = this.manualIdling;
        this.checkCanSend(isIdling);
        this.state = await activity(this.state, isViewing, isIdling);
        this.state.instance = true;
        if (!this.state || Object.keys(this.state).length === 0 || !this.canSendActivity)
            return void this.client.user?.clearActivity(process.pid);
        return this.client.user?.setActivity(this.state, process.pid);
    }

    async disable() {
        this.enabled = false;

        this.cleanUp();
        if (this.idleTimeout) clearTimeout(this.idleTimeout);
        if (this.iconTimeout) clearTimeout(this.iconTimeout);

        await this.client.user?.clearActivity(process.pid);
    }

    async enable() {
        logInfo("[004] Debug:", "Enabling Discord Rich Presence");

        this.enabled = true;

        await this.login();
        logInfo("[004] Debug:", "Client Should be logged in");
        logInfo("[004] Debug:", `Enable - ${this.client}`);

        editor.setStatusBarItem(StatusBarMode.Succeeded);

        logInfo("[004] Debug:", "Enabled - isConnected", this.client.isConnected, "isReady", this.client.clientId);
        await this.sendActivity();
        this.cleanUp();
        this.listen();

        if (this.iconTimeout) clearTimeout(this.iconTimeout);
    }

    async updateClientId(clientId: string) {
        if (this.client.clientId === clientId) return;
        await this.client.destroy();
        this.client.clientId = clientId;
        await this.client.login();
        if (this.enabled) await this.sendActivity();
    }

    cleanUp() {
        for (const listener of this.listeners) listener.dispose();
        this.listeners = [];
    }

    async destroy() {
        await this.disable();
        await this.client.destroy();
    }
}
