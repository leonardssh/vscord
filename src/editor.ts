import { StatusBarAlignment, window } from "vscode";
import { ExtensionConfigurationType, getConfig } from "./config";
import { CONFIG_KEYS } from "./constants";

class EditorController {
    statusBarItem = window.createStatusBarItem(this.#getAlignmentFromConfig());
    #getAlignmentFromConfig() {
        return getConfig().get(CONFIG_KEYS.Behaviour.StatusBarAlignment) === "Right"
            ? StatusBarAlignment.Right
            : StatusBarAlignment.Left;
    }
    toggleStatusBarAlignment(onLeft?: boolean) {
        const config = getConfig();
        const cfgKey = CONFIG_KEYS.Behaviour.StatusBarAlignment;
        const alignment = onLeft ?? config.get(cfgKey) === "Right" ? "Left" : "Right";

        config.update(cfgKey, alignment satisfies ExtensionConfigurationType[typeof cfgKey]);
        return alignment;
    }
    updateStatusBarFromConfig() {
        const alignment = this.#getAlignmentFromConfig();
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
