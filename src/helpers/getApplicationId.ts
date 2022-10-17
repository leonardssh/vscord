import { WorkspaceExtensionConfiguration } from "../config";
import { CONFIG_KEYS } from "../constants";

// https://stackoverflow.com/a/3561711
const escapeRegex = (text: string) => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

export const getApplicationId = (config: WorkspaceExtensionConfiguration) => {
    const applicationIds = new Map([
        ["Code", "782685898163617802"],
        ["Visual Studio Code", "810516608442695700"],
        ["VSCodium", "1031067701474492496"]
    ]);

    const appIdsRegex = new RegExp([...Array.from(applicationIds.keys()).map(escapeRegex)].join("|"), "i");
    const match = appIdsRegex.exec(config[CONFIG_KEYS.AppName]);

    let clientId = config[CONFIG_KEYS.Id];
    if (match !== null && applicationIds.has(match[0])) clientId = applicationIds.get(match[0])!;

    return { clientId };
};
