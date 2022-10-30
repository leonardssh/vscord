import { type Disposable, type WindowState, debug, languages, StatusBarAlignment, window, workspace } from "vscode";
import { type SetActivity, type SetActivityResponse, Client } from "@xhayper/discord-rpc";
import { getApplicationId } from "./helpers/getApplicationId";
import { activity, onDiagnosticsChange } from "./activity";
import { throttle } from "./helpers/throttle";
import { logError, logInfo } from "./logger";
import { CONFIG_KEYS } from "./constants";
import { getConfig } from "./config";
import { dataClass } from "./data";

export class RPCController {
    statusBarIcon = window.createStatusBarItem(StatusBarAlignment.Left);
    listeners: Disposable[] = [];
    enabled = true;
    state: SetActivity = {};
    debug = false;
    client: Client;

    private idleTimeout: NodeJS.Timer | undefined;
    private iconTimeout: NodeJS.Timer | undefined;
    private activityThrottle = throttle(
        (isViewing?: boolean, isIdling?: boolean) => this.sendActivity(isViewing, isIdling),
        2000,
        true
    );

    constructor(clientId: string, debug = false) {
        this.client = new Client({ clientId });
        this.debug = debug;

        this.statusBarIcon.text = "$(pulse) Connecting to Discord Gateway...";

        void this.client
            .login()
            .catch(async (error: Error) => {
                const config = getConfig();

                logError("Encountered following error while trying to login:", error);

                await this.client?.destroy();
                logInfo("[002] Destroyed Discord RPC client");

                if (!config.get(CONFIG_KEYS.Behaviour.SuppressNotifications)) {
                    error?.message?.includes("ENOENT")
                        ? void window.showErrorMessage("No Discord client detected")
                        : void window.showErrorMessage(
                              "Couldn't connect to Discord via RPC:",
                              error.stack ?? error.message
                          );
                }

                this.statusBarIcon.text = "$(search-refresh) Reconnect to Discord Gateway";
                this.statusBarIcon.command = "vscord.reconnect";
                this.statusBarIcon.tooltip = "Reconnect to Discord Gateway";
            })
            .then(() => logInfo(`Successfully logged in to Discord with client ID ${clientId}`));

        this.client.on("debug", (...data) => {
            if (!this.debug) return;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            logInfo("[003] Debug:", ...data);
        });

        this.client.on("ready", this.onReady.bind(this));
        this.client.on("disconnected", this.onDisconnected.bind(this));
    }

    private onReady() {
        logInfo("Successfully connected to Discord");
        this.cleanUp();

        this.statusBarIcon.text = "$(globe) Connected to Discord";
        this.statusBarIcon.tooltip = "Connected to Discord";
        this.statusBarIcon.show();

        if (this.enabled) void this.enable();
    }

    private onDisconnected() {
        this.cleanUp();
        this.statusBarIcon.text = "$(search-refresh) Reconnect to Discord Gateway";
        this.statusBarIcon.command = "vscord.reconnect";
        this.statusBarIcon.tooltip = "Reconnect to Discord Gateway";
        this.statusBarIcon.show();
    }

    private listen() {
        const config = getConfig();

        const sendActivity = (isViewing = false, isIdling = false) => {
            this.activityThrottle.reset();
            void this.sendActivity(isViewing, isIdling);
        };

        const fileSwitch = window.onDidChangeActiveTextEditor(() => sendActivity(true));
        const fileEdit = workspace.onDidChangeTextDocument((e) => {
            if (e.document !== dataClass.editor?.document) return;
            void this.activityThrottle.callable();
        });
        const fileSelectionChanged = window.onDidChangeTextEditorSelection((e) => {
            if (e.textEditor !== dataClass.editor) return;
            void this.activityThrottle.callable();
        });
        const debugStart = debug.onDidStartDebugSession(() => sendActivity());
        const debugEnd = debug.onDidTerminateDebugSession(() => sendActivity());
        const diagnosticsChange = languages.onDidChangeDiagnostics(() => onDiagnosticsChange());
        const changeWindowState = window.onDidChangeWindowState((e: WindowState) => this.checkIdle(e));
        const gitListener = dataClass.onUpdate(() => this.activityThrottle.callable());

        if (config.get(CONFIG_KEYS.Status.Problems.Enabled)) this.listeners.push(diagnosticsChange);
        if (config.get(CONFIG_KEYS.Status.Idle.Check)) this.listeners.push(changeWindowState);

        this.listeners.push(fileSwitch, fileEdit, fileSelectionChanged, debugStart, debugEnd, gitListener);
    }

    private async checkIdle(windowState: WindowState) {
        if (!this.enabled) return;

        const config = getConfig();

        if (config.get(CONFIG_KEYS.Status.Idle.Timeout) !== 0) {
            if (windowState.focused) {
                clearTimeout(this.idleTimeout);
                await this.sendActivity();
            } else {
                this.idleTimeout = setTimeout(() => {
                    void (async () => {
                        if (config.get(CONFIG_KEYS.Status.Idle.DisconnectOnIdle)) {
                            await this.disable();
                            if (config.get(CONFIG_KEYS.Status.Idle.ResetElapsedTime))
                                this.state.startTimestamp = undefined;
                            return;
                        }

                        if (!this.enabled) return;

                        this.activityThrottle.reset();
                        await this.sendActivity(false, true);
                    })();
                }, config.get(CONFIG_KEYS.Status.Idle.Timeout) * 1000);
            }
        }
    }

    async login() {
        const { clientId } = getApplicationId(getConfig());

        if (this.client.isConnected && this.client.clientId === clientId) return;

        this.statusBarIcon.text = "$(search-refresh) Connecting to Discord Gateway...";
        this.statusBarIcon.tooltip = "Connecting to Discord Gateway...";

        if (this.client.clientId != clientId) await this.updateClientId(clientId);
        else if (!this.client.isConnected) await this.client.login();
    }

    async sendActivity(isViewing = false, isIdling = false): Promise<SetActivityResponse | undefined> {
        if (!this.enabled) return;
        this.state = await activity(this.state, isViewing, isIdling);
        return this.client.user?.setActivity(this.state);
    }

    async disable() {
        this.enabled = false;

        this.cleanUp();
        if (this.idleTimeout) clearTimeout(this.idleTimeout);
        if (this.iconTimeout) clearTimeout(this.iconTimeout);

        await this.client.user?.clearActivity();
    }

    async enable() {
        this.enabled = true;

        await this.login();
        await this.sendActivity();
        this.cleanUp();
        this.listen();

        if (this.iconTimeout) clearTimeout(this.iconTimeout);
        this.iconTimeout = setTimeout(() => (this.statusBarIcon.text = "$(smiley)"), 5000);
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
