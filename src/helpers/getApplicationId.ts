import type { ExtensionConfiguration } from "../config";
import { CONFIG_KEYS } from "../constants";

export const getApplicationId = (config: ExtensionConfiguration) => {
    const applicationIds = new Map([
        ["Code", "782685898163617802"],
        ["Visual Studio Code", "810516608442695700"],
        ["VSCodium", "1031067701474492496"],
        ["Custom", config.get(CONFIG_KEYS.App.Id)!]
    ]);

    const currentAppName = config.get(CONFIG_KEYS.App.Name)!;

    let clientId = config.get(CONFIG_KEYS.App.Id)!;
    for (const [appName, id] of applicationIds.entries()) {
        if (currentAppName !== appName) continue;
        clientId = id;
        break;
    }

    return { clientId };
};
