import humanFileSize from "file-size";
import type { Data } from "../data";
import { CONFIG_KEYS } from "../constants";
import { FileSizeConfig, FileSizeSpec, WorkspaceExtensionConfiguration } from "../config";

export const getFileSize = (config: WorkspaceExtensionConfiguration, dataClass: Data) => {
    if (dataClass.fileSize === undefined) return undefined;

    let fixed = 2;
    if (config[CONFIG_KEYS.FileSizeFixed] === 0 || config[CONFIG_KEYS.FileSizeFixed]) {
        fixed = config[CONFIG_KEYS.FileSizeFixed];
    }

    let spacer = " ";
    if (config[CONFIG_KEYS.FileSizeSpacer] === "" || config[CONFIG_KEYS.FileSizeSpacer]) {
        spacer = config[CONFIG_KEYS.FileSizeSpacer];
    }

    let fileSize: string | undefined = undefined;
    const fileSizeSpec: FileSizeSpec = config[CONFIG_KEYS.FileSizeSpec] || "iec";
    const fileSizeConfig: FileSizeConfig = {
        fixed,
        spacer
    };

    if (config[CONFIG_KEYS.FileSizeHumanReadable]) {
        fileSize = humanFileSize(dataClass.fileSize, fileSizeConfig).human(fileSizeSpec);
    } else {
        fileSize = `${dataClass.fileSize.toLocaleString()}${fileSizeConfig.spacer}B`;
    }

    return fileSize;
};
