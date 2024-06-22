import "source-map-support/register";

import { commands, window, workspace, type ExtensionContext } from "vscode";
import { getApplicationId } from "./helpers/getApplicationId";
import { RPCController } from "./controller";
import { CONFIG_KEYS } from "./constants";
import { getConfig } from "./config";
import { logInfo } from "./logger";
import { dataClass } from "./data";
import { StatusBarMode, editor } from "./editor";

const controller = new RPCController(
    getApplicationId(getConfig()).clientId,
    getConfig().get(CONFIG_KEYS.Behaviour.Debug)
);

export const registerListeners = (ctx: ExtensionContext) => {
    const onConfigurationChanged = workspace.onDidChangeConfiguration(async () => {
        const config = getConfig();
        const clientId = getApplicationId(config).clientId;
        const isEnabled = config.get(CONFIG_KEYS.Enabled);

        controller.debug = config.get(CONFIG_KEYS.Behaviour.Debug) ?? false;
        editor.updateStatusBarFromConfig();

        if (controller.client.clientId !== clientId) {
            if (!isEnabled) await controller.disable();
            await controller.login();
            if (isEnabled) await controller.enable();
        }
    });

    ctx.subscriptions.push(onConfigurationChanged);
};

export const registerCommands = (ctx: ExtensionContext) => {
    const config = getConfig();

    const enable = async (update = true) => {
        if (update)
            try {
                await config.update(CONFIG_KEYS.Enabled, true);
            } catch {}

        await controller.enable();
    };

    const disable = async (update = true) => {
        if (update)
            try {
                await config.update(CONFIG_KEYS.Enabled, false);
            } catch {}

        await controller.disable();

        logInfo("[003] Destroyed Discord RPC client");
        editor.setStatusBarItem(StatusBarMode.Disabled);
    };

    const togglePrivacyMode = async (activate: boolean) => {
        try {
            await config.update(CONFIG_KEYS.App.PrivacyMode, activate);
        } catch {}

        await controller.sendActivity(dataClass.editor != null);
    };

    const enableCommand = commands.registerCommand("vscord.enable", async () => {
        await disable(false);
        await enable(false);

        logInfo("Enabled Discord Rich Presence.");

        if (!config.get(CONFIG_KEYS.Behaviour.SuppressNotifications))
            await window.showInformationMessage("Enabled Discord Rich Presence");
    });

    const disableCommand = commands.registerCommand("vscord.disable", async () => {
        logInfo("Disabled Discord Rich Presence");

        await disable(false);

        if (!config.get(CONFIG_KEYS.Behaviour.SuppressNotifications))
            await window.showInformationMessage("Disabled Discord Rich Presence");
    });

    const enableWorkspaceCommand = commands.registerCommand("vscord.workspace.enable", async () => {
        logInfo("Enabled Discord Rich Presence");

        await disable();
        await enable();

        if (!config.get(CONFIG_KEYS.Behaviour.SuppressNotifications))
            await window.showInformationMessage("Enabled Discord Rich Presence for this workspace");
    });

    const disableWorkspaceCommand = commands.registerCommand("vscord.workspace.disable", async () => {
        logInfo("Disabled Discord Rich Presence");

        await disable();

        if (!config.get(CONFIG_KEYS.Behaviour.SuppressNotifications))
            await window.showInformationMessage("Disabled Discord Rich Presence for this workspace");
    });

    const reconnectCommand = commands.registerCommand("vscord.reconnect", async () => {
        logInfo("Reconnecting to Discord Gateway...");

        editor.setStatusBarItem(StatusBarMode.Pending);

        await controller
            .login()
            .then(async () => await controller.enable())
            .catch(() => {
                if (!config.get(CONFIG_KEYS.Behaviour.SuppressNotifications))
                    window.showErrorMessage("Failed to reconnect to Discord Gateway");
                editor.setStatusBarItem(StatusBarMode.Disconnected);
            });
    });

    const disconnectCommand = commands.registerCommand("vscord.disconnect", async () => {
        logInfo("Disconnecting from Discord Gateway...");

        await controller.destroy();

        editor.setStatusBarItem(StatusBarMode.Disconnected);
    });

    const enablePrivacyModeCommand = commands.registerCommand("vscord.enablePrivacyMode", async () => {
        logInfo("Enabled Privacy Mode");

        await togglePrivacyMode(true);

        if (!config.get(CONFIG_KEYS.Behaviour.SuppressNotifications))
            await window.showInformationMessage("Enabled Privacy Mode.");
    });

    const disablePrivacyModeCommand = commands.registerCommand("vscord.disablePrivacyMode", async () => {
        logInfo("Disabled Privacy Mode");

        await togglePrivacyMode(false);

        if (!config.get(CONFIG_KEYS.Behaviour.SuppressNotifications))
            await window.showInformationMessage("Disabled Privacy Mode.");
    });

    ctx.subscriptions.push(
        enableCommand,
        disableCommand,
        enableWorkspaceCommand,
        disableWorkspaceCommand,
        reconnectCommand,
        disconnectCommand,
        enablePrivacyModeCommand,
        disablePrivacyModeCommand
    );

    logInfo("Registered Discord Rich Presence commands");
};

export async function activate(ctx: ExtensionContext) {
    logInfo("Discord Rich Presence for VS Code activated.");
    registerCommands(ctx);
    registerListeners(ctx);

    if (!getConfig().get(CONFIG_KEYS.Enabled)) await controller.disable();
}

export async function deactivate() {
    logInfo("Discord Rich Presence for VS Code deactivated.");
    await controller.destroy();
    logInfo("[004] Destroyed Discord RPC client");
}
