import { Command, StatusBarAlignment, StatusBarItem, window } from "vscode";
import { ExtensionConfiguration, ExtensionConfigurationType, getConfig } from "./config";
import { CONFIG_KEYS } from "./constants";

export enum StatusBarMode {
    Disabled,
    Disconnected,
    Pending,
    Succeeded
}

class EditorController {
    statusBarItem = window.createStatusBarItem(this.#getAlignmentFromConfig());

    #getAlignmentFromConfig(config?: ExtensionConfiguration) {
        const value = (config ?? getConfig()).get(CONFIG_KEYS.Behaviour.StatusBarAlignment);
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
        const alignment = onLeft ?? config.get(cfgKey) === "Right" ? "Left" : "Right";

        config.update(cfgKey, alignment satisfies ExtensionConfigurationType[typeof cfgKey]);
        return alignment;
    }

    updateStatusBarFromConfig() {
        const config = getConfig();
        const alignment = this.#getAlignmentFromConfig(config);
        const priority = undefined
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
}

export const editor = new EditorController();
