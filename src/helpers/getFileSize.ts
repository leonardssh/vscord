import { FileSizeConfig, FileSizeSpec, WorkspaceExtensionConfiguration } from "../config";
import { CONFIG_KEYS } from "../constants";
import type { Data } from "../data";
import filesize from "file-size";

export const getFileSize = (config: WorkspaceExtensionConfiguration, dataClass: Data) => {
    if (!dataClass.fileSize) return;

    let fixed = 2;
    if (config[CONFIG_KEYS.File.Size.Fixed] === 0 || config[CONFIG_KEYS.File.Size.Fixed])
        fixed = config[CONFIG_KEYS.File.Size.Fixed];

    let spacer = " ";
    if (config[CONFIG_KEYS.File.Size.Spacer] === "" || config[CONFIG_KEYS.File.Size.Spacer])
        spacer = config[CONFIG_KEYS.File.Size.Spacer];

    let fileSize: string | undefined;
    const fileSizeSpec: FileSizeSpec = config[CONFIG_KEYS.File.Size.Spec] ?? "iec";
    const fileSizeConfig: FileSizeConfig = {
        fixed,
        spacer
    };

    fileSize = config[CONFIG_KEYS.File.Size.HumanReadable]
        ? (fileSize = filesize(dataClass.fileSize, fileSizeConfig).human(fileSizeSpec))
        : (fileSize = `${dataClass.fileSize.toLocaleString()}${fileSizeConfig.spacer}B`);

    return fileSize;
};
