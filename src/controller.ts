import { debug, Disposable, languages, StatusBarAlignment, window, WindowState, workspace } from "vscode";
import { Client, type SetActivity, type SetActivityResponse } from "@xhayper/discord-rpc";
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
    enabled: boolean = true;
    state: SetActivity = {};
    debug: boolean = false;
    rpcClient: Client;

    private idleTimeout: NodeJS.Timer | undefined;
    private iconTimeout: NodeJS.Timer | undefined;

    constructor(clientId: string, debug: boolean = false) {
        this.rpcClient = new Client({ clientId, debug });
        this.debug = debug;

        this.statusBarIcon.text = "$(pulse) Connecting to Discord Gateway...";

        this.rpcClient
            .login()
            .catch(async (error) => {
                const config = getConfig();

                logError("Encountered following error while trying to login:", error);

                await this.rpcClient?.destroy();
                logInfo("[002] Destroyed Discord RPC client");

                if (!config.get(CONFIG_KEYS.Behaviour.SuppressNotifications)) {
                    error?.message?.includes("ENOENT")
                        ? void window.showErrorMessage("No Discord client detected")
                        : void window.showErrorMessage("Couldn't connect to Discord via RPC:", error);
                }

                this.statusBarIcon.text = "$(search-refresh) Reconnect to Discord Gateway";
                this.statusBarIcon.command = "vscord.reconnect";
                this.statusBarIcon.tooltip = "Reconnect to Discord Gateway";
            })
            .then(() => void logInfo(`Successfully logged in to Discord with client ID ${clientId}`));

        this.rpcClient.on("ready", this.onReady.bind(this));
        this.rpcClient.on("disconnected", this.onDisconnected.bind(this));
    }

    private async onReady() {
        logInfo("Successfully connected to Discord");
        this.cleanUp();

        this.statusBarIcon.text = "$(globe) Connected to Discord";
        this.statusBarIcon.tooltip = "Connected to Discord";
        this.statusBarIcon.show();

        if (this.enabled) this.enable();
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

        const fileSwitch = window.onDidChangeActiveTextEditor(() => this.sendActivity(true));
        const fileEdit = workspace.onDidChangeTextDocument(throttle(() => this.sendActivity(), 2000));
        const debugStart = debug.onDidStartDebugSession(() => this.sendActivity());
        const debugEnd = debug.onDidTerminateDebugSession(() => this.sendActivity());
        const diagnosticsChange = languages.onDidChangeDiagnostics(() => onDiagnosticsChange());
        const changeWindowState = window.onDidChangeWindowState((e: WindowState) => this.checkIdle(e));
        const gitListener = dataClass.onUpdate(throttle(() => this.sendActivity(), 2000));

        if (config.get(CONFIG_KEYS.Status.Problems.Enabled)) this.listeners.push(diagnosticsChange);
        if (config.get(CONFIG_KEYS.Status.Idle.Check)) this.listeners.push(changeWindowState);

        this.listeners.push(fileSwitch, fileEdit, debugStart, debugEnd, gitListener);
    }

    private async checkIdle(windowState: WindowState) {
        if (!this.enabled) return;

        const config = getConfig();

        if (config.get(CONFIG_KEYS.Status.Idle.Timeout) !== 0) {
            if (windowState.focused) {
                if (this.idleTimeout) clearTimeout(this.idleTimeout);

                await this.sendActivity();
            } else {
                this.idleTimeout = setTimeout(async () => {
                    if (config.get(CONFIG_KEYS.Status.Idle.DisconnectOnIdle)) {
                        await this.disable();
                        if (config.get(CONFIG_KEYS.Status.Idle.ResetElapsedTime)) this.state.startTimestamp = undefined;
                        return;
                    }

                    if (!this.enabled) return;

                    this.state = activity(this.state, false, true);

                    await this.rpcClient?.user?.setActivity(this.state);
                }, config.get(CONFIG_KEYS.Status.Idle.Timeout) * 1000);
            }
        }
    }

    async login() {
        const config = getConfig();
        const { clientId } = getApplicationId(config);

        if (this.rpcClient.isConnected && this.rpcClient.clientId === clientId) return;

        this.statusBarIcon.text = "$(search-refresh) Connecting to Discord Gateway...";
        this.statusBarIcon.tooltip = "Connecting to Discord Gateway...";

        if (this.rpcClient.clientId != clientId) await this.updateClientId(clientId);
        if (!this.rpcClient.isConnected) await this.rpcClient.login();
    }

    async sendActivity(isViewing: boolean = false): Promise<SetActivityResponse | undefined> {
        if (!this.enabled) return;
        this.state = activity(this.state, isViewing);
        return this.rpcClient.user?.setActivity(this.state);
    }

    async disable() {
        this.enabled = false;

        this.cleanUp();
        if (this.idleTimeout) clearTimeout(this.idleTimeout);
        if (this.iconTimeout) clearTimeout(this.iconTimeout);

        await this.rpcClient.user?.clearActivity();
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
        if (this.rpcClient.clientId === clientId) return;
        await this.rpcClient.destroy();
        this.rpcClient.clientId = clientId;
        await this.rpcClient.login();
        if (this.enabled) await this.sendActivity();
    }

    cleanUp() {
        for (const listener of this.listeners) listener.dispose();
        this.listeners = [];
    }

    async destroy() {
        await this.disable();
        await this.rpcClient.destroy();
    }
}
