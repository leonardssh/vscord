import type { ExtensionConfiguration } from "../config";

export const getApplicationId = (config: ExtensionConfiguration) => {
    const applicationIds = new Map([
        ["Code", "782685898163617802"],
        ["Visual Studio Code", "810516608442695700"],
        ["VSCodium", "1031067701474492496"],
        ["Antigravity", "1441771215290372156"],
        ["Cursor", "1376937466619232256"],
        ["Custom", config.get("vscord.app.id")!]
    ]);

    const currentAppName = config.get("vscord.app.name")!;

    let clientId = config.get("vscord.app.id")!;
    for (const [appName, id] of applicationIds.entries()) {
        if (currentAppName !== appName) continue;
        clientId = id;
        break;
    }

    return { clientId };
};
