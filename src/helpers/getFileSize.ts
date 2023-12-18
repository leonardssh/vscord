import type { ExtensionConfiguration, FileSizeStandard } from "../config";
import { CONFIG_KEYS } from "../constants";
import type { Data } from "../data";
import { FileSizeOptionsBase, filesize } from "filesize";

export const getFileSize = async (config: ExtensionConfiguration, dataClass: Data) => {
    if (!(await dataClass.fileSize)) return;

    let round = 2;
    if (config.get(CONFIG_KEYS.File.Size.Round) === 0 || config.get(CONFIG_KEYS.File.Size.Round))
        round = config.get(CONFIG_KEYS.File.Size.Round)!;

    let spacer = " ";
    if (config.get(CONFIG_KEYS.File.Size.Spacer) === "" || config.get(CONFIG_KEYS.File.Size.Spacer))
        spacer = config.get(CONFIG_KEYS.File.Size.Spacer)!;

    const fileSizeStandard: FileSizeStandard = config.get(CONFIG_KEYS.File.Size.Standard) ?? "iec";
    const fileSizeConfig: FileSizeOptionsBase = {
        round,
        spacer,
        standard: fileSizeStandard
    } as const;

    const fileSize = config.get(CONFIG_KEYS.File.Size.HumanReadable)
        ? filesize((await dataClass.fileSize) ?? 0, fileSizeConfig).toLocaleString()
        : `${dataClass.fileSize.toLocaleString()}${fileSizeConfig.spacer ?? " "}B`;

    return fileSize;
};
