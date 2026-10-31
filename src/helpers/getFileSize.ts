import type { ExtensionConfiguration, FileSizeStandard } from "../config";
import { FilesizeOptions, filesize } from "filesize";
import type { Data } from "../data";

export const getFileSize = async (config: ExtensionConfiguration, dataClass: Data) => {
    if (!(await dataClass.fileSize)) return;

    let round = 2;
    if (config.get("vscord.file.size.round") === 0 || config.get("vscord.file.size.round"))
        round = config.get("vscord.file.size.round")!;

    let spacer = " ";
    if (config.get("vscord.file.size.spacer") === "" || config.get("vscord.file.size.spacer"))
        spacer = config.get("vscord.file.size.spacer")!;

    const fileSizeStandard: FileSizeStandard = config.get("vscord.file.size.standard") ?? "iec";
    const fileSizeConfig: FilesizeOptions = {
        round,
        spacer,
        standard: fileSizeStandard
    } as const;

    const fileSize = config.get("vscord.file.size.humanReadable")
        ? filesize((await dataClass.fileSize) ?? 0, fileSizeConfig).toLocaleString()
        : `${dataClass.fileSize.toLocaleString()}${fileSizeConfig.spacer ?? " "}B`;

    return fileSize;
};
