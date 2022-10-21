import { FileSizeConfig, FileSizeSpec, ExtenstionConfiguration } from "../config";
import { CONFIG_KEYS } from "../constants";
import type { Data } from "../data";
import filesize from "file-size";

export const getFileSize = async (config: ExtenstionConfiguration, dataClass: Data) => {
    if (!dataClass.fileSize) return;

    let fixed = 2;
    if (config.get(CONFIG_KEYS.File.Size.Fixed) === 0 || config.get(CONFIG_KEYS.File.Size.Fixed))
        fixed = config.get(CONFIG_KEYS.File.Size.Fixed);

    let spacer = " ";
    if (config.get(CONFIG_KEYS.File.Size.Spacer) === "" || config.get(CONFIG_KEYS.File.Size.Spacer))
        spacer = config.get(CONFIG_KEYS.File.Size.Spacer);

    let fileSize: string | undefined;
    const fileSizeSpec: FileSizeSpec = config.get(CONFIG_KEYS.File.Size.Spec) ?? "iec";
    const fileSizeConfig: FileSizeConfig = {
        fixed,
        spacer
    };

    fileSize = config.get(CONFIG_KEYS.File.Size.HumanReadable)
        ? (fileSize = filesize((await dataClass.fileSize) ?? 0, fileSizeConfig).human(fileSizeSpec))
        : (fileSize = `${dataClass.fileSize.toLocaleString()}${fileSizeConfig.spacer}B`);

    return fileSize;
};
