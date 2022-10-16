import { FileSizeConfig, FileSizeSpec, WorkspaceExtensionConfiguration } from "../config";
import { CONFIG_KEYS } from "../constants";
import type { Data } from "../data";
import filesize from "file-size";

export const getFileSize = (config: WorkspaceExtensionConfiguration, dataClass: Data) => {
    if (!dataClass.fileSize) return;

    let fixed = 2;
    if (config[CONFIG_KEYS.FileSizeFixed] === 0 || config[CONFIG_KEYS.FileSizeFixed])
        fixed = config[CONFIG_KEYS.FileSizeFixed];

    let spacer = " ";
    if (config[CONFIG_KEYS.FileSizeSpacer] === "" || config[CONFIG_KEYS.FileSizeSpacer])
        spacer = config[CONFIG_KEYS.FileSizeSpacer];

    let fileSize: string | undefined;
    const fileSizeSpec: FileSizeSpec = config[CONFIG_KEYS.FileSizeSpec] || "iec";
    const fileSizeConfig: FileSizeConfig = {
        fixed,
        spacer
    };

    fileSize = config[CONFIG_KEYS.FileSizeHumanReadable]
        ? (fileSize = filesize(dataClass.fileSize, fileSizeConfig).human(fileSizeSpec))
        : (fileSize = `${dataClass.fileSize.toLocaleString()}${fileSizeConfig.spacer}B`);

    return fileSize;
};
