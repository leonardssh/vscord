import { WorkspaceExtensionConfiguration } from "../config";
import { CONFIG_KEYS } from "../constants";

export const getApplicationId = (config: WorkspaceExtensionConfiguration) => {
    const applicationIds = new Map([
        ["Code", "782685898163617802"],
        ["Visual Studio Code", "810516608442695700"],
        ["VSCodium", "1031067701474492496"],
        ["Custom", config.id]
    ]);

    const currentAppName = config[CONFIG_KEYS.AppName];

    let clientId = config[CONFIG_KEYS.Id];
    for (const [appName, id] of applicationIds.entries()) {
        if (currentAppName !== appName) continue;
        clientId = id;
        break;
    }

    return { clientId };
};
