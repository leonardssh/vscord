import { Command, StatusBarAlignment, window } from "vscode";
import { ExtensionConfiguration, ExtensionConfigurationType, getConfig } from "./config";
import { CONFIG_KEYS } from "./constants";

export enum StatusBarMode {
    Disabled,
    Failed,
    Pending,
    Succeeded
}

class EditorController {
    statusBarItem = window.createStatusBarItem(this.#getAlignmentFromConfig());

    #getAlignmentFromConfig(config?: ExtensionConfiguration) {
        return (config ?? getConfig()).get(CONFIG_KEYS.Behaviour.StatusBarAlignment) === "Right"
            ? StatusBarAlignment.Right
            : StatusBarAlignment.Left;
    }
    setStatusBarItem(mode: StatusBarMode) {
        const { statusBarItem } = this;
        if (mode === StatusBarMode.Disabled) {
            statusBarItem.hide();
            return;
        }

        type ArrMode = [text: string, tooltip: string, command: Command | string | undefined];
        const statusBarNewParams = (
            {
                [StatusBarMode.Failed]: [
                    "$(refresh) Reconnect to Discord RPC",
                    "Failed to connect to Discord RPC",
                    "vscord.reconnect"
                ],
                [StatusBarMode.Pending]: ["$(pulse) Connecting to Discord RPC...", "Please, wait...", undefined],
                [StatusBarMode.Succeeded]: [
                    "$(smiley) Discord RPC",
                    "Click to disconnect from Discord RPC",
                    "vscord.disconnect"
                ]
            } as Exclude<Record<StatusBarMode, ArrMode>, StatusBarMode.Disabled>
        )[mode];

        const [text, tooltip, command] = statusBarNewParams;
        [statusBarItem.text, statusBarItem.tooltip, statusBarItem.command] = [text, tooltip, command];
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
        const old = editor.statusBarItem;

        // Change unchangable (alignment and priority)
        if (editor.statusBarItem.alignment !== alignment) {
            editor.statusBarItem = window.createStatusBarItem(alignment);
            // copy
            editor.statusBarItem.accessibilityInformation = old.accessibilityInformation;
            editor.statusBarItem.backgroundColor = old.backgroundColor;
            editor.statusBarItem.color = old.color;
            editor.statusBarItem.command = old.command;
            editor.statusBarItem.name = old.name;
            editor.statusBarItem.text = old.text;
            editor.statusBarItem.tooltip = old.tooltip;
            // copyend

            editor.statusBarItem.show();
            old.dispose();
        }
    }
}

export const editor = new EditorController();
