import "source-map-support/register";

import { getApplicationId } from "./helpers/getApplicationId";
import { commands, ExtensionContext, window } from "vscode";
import { RPCController } from "./controller";
import { CONFIG_KEYS } from "./constants";
import { getConfig } from "./config";
import { logInfo } from "./logger";

const controller = new RPCController(getApplicationId(getConfig()).clientId, true);

export const registerCommands = (ctx: ExtensionContext) => {
    const config = getConfig();

    const enable = async (update = true) => {
        if (update)
            try {
                await config.update("enabled", true);
            } catch (ignored) {}

        controller.statusBarIcon.text = "$(search-refresh) Connecting to Discord Gateway...";
        controller.statusBarIcon.tooltip = "Connecting to Discord Gateway...";
        await controller.enable();
    };

    const disable = async (update = true) => {
        if (update)
            try {
                await config.update("enabled", false);
            } catch (ignored) {}

        controller.cleanUp();
        await controller.disable();

        logInfo(`[003] Destroyed Discord RPC client`);
        controller.statusBarIcon.hide();
    };

    const enableCommand = commands.registerCommand("rpc.enable", async () => {
        await disable();
        await enable();

        logInfo("Enabled Discord Rich Presence for this workspace.");

        if (!config[CONFIG_KEYS.SuppressNotifications])
            await window.showInformationMessage("Enabled Discord Rich Presence for this workspace.");
    });

    const disableCommand = commands.registerCommand("rpc.disable", async () => {
        await disable();

        logInfo("Disabled Discord Rich Presence for this workspace.");

        if (!config[CONFIG_KEYS.SuppressNotifications])
            await window.showInformationMessage("Disabled Discord Rich Presence for this workspace.");
    });

    const reconnectCommand = commands.registerCommand("rpc.reconnect", async () => {
        logInfo("Reconnecting to Discord Gateway...");

        await disable(false);
        await enable(false);
    });

    const disconnectCommand = commands.registerCommand("rpc.disconnect", async () => {
        logInfo("Disconnecting from Discord Gateway...");

        await disable(false);

        controller.statusBarIcon.text = "$(search-refresh) Reconnect to Discord Gateway";
        controller.statusBarIcon.command = "rpc.reconnect";
        controller.statusBarIcon.tooltip = "Reconnect to Discord Gateway";
        controller.statusBarIcon.show();
    });

    ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand);

    logInfo("Registered Discord Rich Presence commands");
};

export async function activate(ctx: ExtensionContext) {
    logInfo("Discord Rich Presence for VS Code activated.");
    registerCommands(ctx);
}

export async function deactivate() {
    logInfo("Discord Rich Presence for VS Code deactivated.");
    await controller.destroy();
    logInfo(`[004] Destroyed Discord RPC client`);
}
