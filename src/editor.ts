import type { ExtensionConfigGenerated } from "./@types/configtypes.d.ts";
import { Disposable, ConfigurationTarget, StatusBarAlignment, StatusBarItem, window, commands } from "vscode";
import { type ExtensionConfiguration, getConfig } from "./config";
import { logInfo, outputChannel } from "./logger";

export enum StatusBarMode {
    Disabled,
    Disconnected,
    Pending,
    Succeeded
}

class EditorController implements Disposable {
    statusBarItem: StatusBarItem | undefined;
    statusBarItemMode: StatusBarMode = StatusBarMode.Disabled;

    #getAlignmentFromConfig(config: ExtensionConfiguration): StatusBarAlignment {
        const value = config.get("vscord.behaviour.statusBarAlignment");
        return StatusBarAlignment[value ?? "Right"];
    }

    setStatusBarItem(mode: StatusBarMode) {
        this.statusBarItemMode = mode;
        const config = getConfig();
        if (!config.get("vscord.enable")) {
            mode = StatusBarMode.Disabled;
        }
        if (!this.statusBarItem) {
            logInfo("setStatusBarItem: status bar item is undefined");
            this.statusBarItem = window.createStatusBarItem(this.#getAlignmentFromConfig(getConfig()));
        }
        if (mode === StatusBarMode.Disabled) {
            this.statusBarItem.hide();
            return;
        }

        const whenDisconnected: Partial<StatusBarItem> = {
            text: "$(warning) Discord RPC",
            tooltip: "Disconnected. Click to reconnect",
            command: "vscord.reconnect"
        };
        const whenPending: Partial<StatusBarItem> = {
            text: "$(pulse) Discord RPC",
            tooltip: "Please, wait. Connecting to Discord Gateway..."
        };
        const whenSucceeded: Partial<StatusBarItem> = {
            text: "Discord RPC",
            tooltip: "Connected to Discord Gateway. Click to disconnect",
            command: "vscord.disconnect"
        };
        const statusBarItemByMode = {
            [StatusBarMode.Disconnected]: whenDisconnected,
            [StatusBarMode.Pending]: whenPending,
            [StatusBarMode.Succeeded]: whenSucceeded
        };

        Object.assign(this.statusBarItem, statusBarItemByMode[mode]);
        this.statusBarItem.show();
    }

    toggleStatusBarAlignment(align: StatusBarAlignment = StatusBarAlignment.Right): StatusBarAlignment {
        const config = getConfig();
        const cfgKey = "vscord.behaviour.statusBarAlignment" as const satisfies keyof ExtensionConfigGenerated;
        const literalAlign = (
            align === StatusBarAlignment.Right ? "Right" : "Left"
        ) satisfies ExtensionConfigGenerated[typeof cfgKey];

        config.update(cfgKey, literalAlign);
        // updateStatusBarFromConfig() // called from config listener
        return align;
    }

    updateStatusBarFromConfig() {
        const config = getConfig();

        const alignment = this.#getAlignmentFromConfig(config);
        const priority = undefined;
        if (!this.statusBarItem) {
            logInfo("updateStatusBarFromConfig: status bar item is undefined");
            this.statusBarItem = window.createStatusBarItem(this.#getAlignmentFromConfig(getConfig()));
        }

        const old = this.statusBarItem;
        this.setStatusBarItem(this.statusBarItemMode);
        if (this.statusBarItem.alignment === alignment) {
            return;
        }

        // Change unchangable: alignment/priority
        this.statusBarItem = window.createStatusBarItem(alignment, priority);
        //#region copy
        this.statusBarItem.text = old.text;
        this.statusBarItem.tooltip = old.tooltip;
        this.statusBarItem.color = old.color;
        this.statusBarItem.command = old.command;
        this.statusBarItem.accessibilityInformation = old.accessibilityInformation;
        //#endregion

        this.statusBarItem.show();
        old.dispose();
    }

    #errorMessageFailedToConnectSelect(config: ExtensionConfiguration, key: string, selection?: string) {
        if (selection === "Reconnect") {
            commands.executeCommand("vscord.reconnect");
        } else if (selection === "Show output") {
            outputChannel.show(true);
        } else if (selection === "Don't show again") {
            config.update(key, true, ConfigurationTarget.Global);
        }
    }
    errorMessageFailedToConnect(config: ExtensionConfiguration, error?: Error) {
        if (config.get("vscord.behaviour.suppressNotifications")) {
            return;
        }

        const buttons = ["Reconnect", "Show output"];
        if (!(error instanceof Error)) {
            const message = "Failed to connect to Discord Gateway.";
            window
                .showErrorMessage(message, ...buttons)
                .then((selection) => this.#errorMessageFailedToConnectSelect(config, "", selection));
            return;
        }

        const configKeyPairs = {
            RPC_COULD_NOT_CONNECT:
                "vscord.behaviour.suppressRpcCouldNotConnect" satisfies keyof ExtensionConfigGenerated
        } as const;

        const errorName = error.name;
        const suppressConfigKey: string | undefined = configKeyPairs[errorName as keyof typeof configKeyPairs];
        if (suppressConfigKey) {
            const suppressed = config.get(suppressConfigKey);
            if (suppressed) {
                return;
            }

            buttons.push("Don't show again");
        }

        const message = `Failed to connect to Discord Gateway: ${error.name}.`;
        window
            .showErrorMessage(message, ...buttons)
            .then((selection) => this.#errorMessageFailedToConnectSelect(config, suppressConfigKey, selection));
        return;
    }

    public dispose(): void {
        this.statusBarItem?.dispose();
        this.statusBarItem = undefined;
    }
}

export const editor = new EditorController();
