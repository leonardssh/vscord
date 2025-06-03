import { StatusBarAlignment, StatusBarItem, window, commands, ConfigurationTarget, l10n, type Disposable, MessageItem, } from "vscode";
import { ExtensionConfiguration, ExtensionConfigurationType, getConfig } from "./config";
import { CONFIG_KEYS } from "./constants";
import { outputChannel } from "./logger";

export enum StatusBarMode {
    Disabled,
    Disconnected,
    Pending,
    Succeeded
}

class EditorController implements Disposable {
    statusBarItem = window.createStatusBarItem(this.#getAlignmentFromConfig(getConfig()));

    #getAlignmentFromConfig(config: ExtensionConfiguration) {
        const value = config.get(CONFIG_KEYS.Behaviour.StatusBarAlignment);
        const isRight = value === "Right";
        return isRight ? StatusBarAlignment.Right : StatusBarAlignment.Left;
    }

    setStatusBarItem(mode: StatusBarMode) {
        const { statusBarItem } = this;
        if (mode === StatusBarMode.Disabled) {
            statusBarItem.hide();
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

        Object.assign(statusBarItem, statusBarItemByMode[mode]);
        statusBarItem.show();
    }

    toggleStatusBarAlignment(onLeft?: boolean) {
        const config = getConfig();
        const cfgKey = CONFIG_KEYS.Behaviour.StatusBarAlignment;
        const alignment = (onLeft ?? config.get(cfgKey) === "Right") ? "Left" : "Right";

        config.update(cfgKey, alignment satisfies ExtensionConfigurationType[typeof cfgKey]);
        return alignment;
    }

    updateStatusBarFromConfig() {
        const config = getConfig();
        const alignment = this.#getAlignmentFromConfig(config);
        const priority = undefined;
        const old = editor.statusBarItem;

        if (editor.statusBarItem.alignment === alignment) {
            return;
        }

        // Change unchangable: alignment/priority
        editor.statusBarItem = window.createStatusBarItem(alignment, priority);
        //#region copy
        editor.statusBarItem.accessibilityInformation = old.accessibilityInformation;
        editor.statusBarItem.backgroundColor = old.backgroundColor;
        editor.statusBarItem.color = old.color;
        editor.statusBarItem.command = old.command;
        editor.statusBarItem.name = old.name;
        editor.statusBarItem.text = old.text;
        editor.statusBarItem.tooltip = old.tooltip;
        //#endregion

        editor.statusBarItem.show();
        old.dispose();
    }

    #errorMessageFailedToConnectSelect(config: ExtensionConfiguration, key: string, selection?: string) {
        if (selection === "Reconnect") {
            commands.executeCommand("vscord.reconnect");
        } else if (selection === "Show output") {
            outputChannel.show(true)
        } else if (selection === "Don't show again") {
            config.update(
                key,
                true,
                ConfigurationTarget.Global
            );
        }
    }
    errorMessageFailedToConnect(config: ExtensionConfiguration, error?: Error) {
        if (config.get(CONFIG_KEYS.Behaviour.SuppressNotifications)) {
            return;
        }

        const buttons = ["Reconnect", "Show output"];
        if (!(error instanceof Error)) {
            const message = l10n.t("Failed to connect to {0}.", "Discord Gateway");
            window
                .showErrorMessage(message, ...buttons)
                .then(selection => this.#errorMessageFailedToConnectSelect(config, "", selection));
            return;
        }

        const configKeyPairs = {
            "RPC_COULD_NOT_CONNECT": CONFIG_KEYS.Behaviour.SuppressRpcCouldNotConnect,
        } as const

        const errorName = error.name
        const suppressConfigKey: string | undefined = configKeyPairs[errorName as keyof typeof configKeyPairs]
        if (suppressConfigKey) {
            const suppressed = config.get(suppressConfigKey)
            if (suppressed) {
                return;
            }

            buttons.push("Don't show again");
        }

        const message = l10n.t("Failed to connect to {0}: {1}.", "Discord Gateway", error.name);
        window
            .showErrorMessage(message, ...buttons)
            .then(selection => this.#errorMessageFailedToConnectSelect(config, suppressConfigKey, selection));
        return;
    }

    public dispose(): void {
        this.statusBarItem.hide()
        this.statusBarItem.dispose()
    }
}

export const editor = new EditorController();
