import type { SetActivity } from "@xhayper/discord-rpc";
import type { ExtensionConfigGenerated } from "./@types/configtypes.d.ts";
import type { GatewayActivityButton } from "discord-api-types/v10";
import { resolveLangName, toLower, toTitle, toUpper, getArticle } from "./helpers/resolveLangName";
import { FAKE_EMPTY } from "./constants";
import { getFileSize } from "./helpers/getFileSize";
import { isExcluded } from "./helpers/isExcluded";
import { isObject } from "./helpers/isObject";
import { getConfig } from "./config";
import { logInfo } from "./logger";
import { dataClass } from "./data";
import { sep } from "node:path";
import {
    type Selection,
    type TextDocument,
    DiagnosticSeverity,
    debug,
    env,
    languages,
    window,
    workspace
} from "vscode";

export enum CURRENT_STATUS {
    IDLE = "idle",
    NOT_IN_FILE = "notInFile",
    EDITING = "editing",
    DEBUGGING = "debugging",
    VIEWING = "viewing"
}

// TODO: move this to data class
const COUNTED_SEVERITIES = {
    error: 0,
    warning: 0,
    info: 0,
    hint: 0
};

export const onDiagnosticsChange = () => {
    const diagnostics = languages.getDiagnostics();

    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    let hintCount = 0;

    for (const diagnostic of diagnostics.values())
        for (const diagnosticItem of diagnostic[1]) {
            switch (diagnosticItem.severity) {
                case DiagnosticSeverity.Error: {
                    errorCount++;
                    break;
                }
                case DiagnosticSeverity.Warning: {
                    warningCount++;
                    break;
                }
                case DiagnosticSeverity.Information: {
                    infoCount++;
                    break;
                }
                case DiagnosticSeverity.Hint: {
                    hintCount++;
                    break;
                }
            }
        }

    COUNTED_SEVERITIES.error = errorCount;
    COUNTED_SEVERITIES.warning = warningCount;
    COUNTED_SEVERITIES.info = infoCount;
    COUNTED_SEVERITIES.hint = hintCount;
};

export const activity = async (
    previous: SetActivity = {},
    isViewing = false,
    isIdling = false
): Promise<SetActivity> => {
    const config = getConfig();
    const presence = previous;

    if (
        isIdling &&
        config.get("vscord.status.idle.disconnectOnIdle") &&
        config.get("vscord.status.idle.resetElapsedTime")
    ) {
        delete presence.startTimestamp;
        return {};
    }

    if (isIdling && !config.get("vscord.status.idle.enabled")) return {};

    if (config.get("vscord.status.showElapsedTime")) {
        presence.startTimestamp = config.get("vscord.status.resetElapsedTimePerFile")
            ? Date.now()
            : (previous.startTimestamp ?? Date.now());
    } else {
        delete presence.startTimestamp;
    }

    const detailsEnabled = config.get("vscord.status.details.enabled");
    const detailsIdleEnabled = config.get("vscord.status.details.idle.enabled");
    const stateEnabled = config.get("vscord.status.state.enabled");
    const stateIdleEnabled = config.get("vscord.status.state.idle.enabled");
    const privacyModeEnabled = config.get("vscord.app.privacyMode.enable") ?? false;

    const gitRepo = dataClass.gitRemoteUrl?.toString("https").replace(/\.git$/, "");
    const gitOrg = dataClass.gitRemoteUrl?.organization ?? dataClass.gitRemoteUrl?.owner;
    const gitHost = dataClass.gitRemoteUrl?.source;

    const isRepositoryExcluded = !!gitRepo && isExcluded(config.get("vscord.ignore.repositories")!, gitRepo);
    const isOrganizationExcluded = !!gitOrg && isExcluded(config.get("vscord.ignore.organizations")!, gitOrg);
    const isGitHostExcluded = !!gitHost && isExcluded(config.get("vscord.ignore.gitHosts")!, gitHost);
    const isGitExcluded = isRepositoryExcluded || isOrganizationExcluded || isGitHostExcluded || privacyModeEnabled;

    let isWorkspaceExcluded =
        dataClass.workspaceFolder !== undefined &&
        isExcluded(config.get("vscord.ignore.workspaces")!, dataClass.workspaceFolder.uri.fsPath);

    if (!isWorkspaceExcluded)
        isWorkspaceExcluded =
            dataClass.workspaceName !== undefined &&
            isExcluded(config.get("vscord.ignore.workspaces")!, dataClass.workspaceName);

    const isNotInFile = !isWorkspaceExcluded && !dataClass.editor;

    const isDebugging = config.get("vscord.status.state.debugging.enabled") && !!debug.activeDebugSession;
    isViewing = !isDebugging && isViewing;

    let status: CURRENT_STATUS;
    if (isIdling) status = CURRENT_STATUS.IDLE;
    else if (isNotInFile) status = CURRENT_STATUS.NOT_IN_FILE;
    else if (isDebugging) status = CURRENT_STATUS.DEBUGGING;
    else if (isViewing) status = CURRENT_STATUS.VIEWING;
    else status = CURRENT_STATUS.EDITING;

    const PROBLEMS = config.get("vscord.status.problems.enabled")
        ? await replaceFileInfo(
              replaceGitInfo(replaceAppInfo(config.get("vscord.status.problems.text") ?? ""), isGitExcluded),
              isWorkspaceExcluded,
              dataClass.editor?.document,
              dataClass.editor?.selection
          )
        : FAKE_EMPTY;

    const replaceAllText = async (text: string) => {
        let replaced: string = text;
        if (privacyModeEnabled) {
            replaced = await replaceForPrivacyMode(replaced);
        }
        replaced = replaceAppInfo(replaced);
        replaced = replaceGitInfo(replaced, isGitExcluded);
        replaced = await replaceFileInfo(
            replaced,
            isWorkspaceExcluded,
            dataClass.editor?.document,
            dataClass.editor?.selection
        );
        return replaced.replaceAll("{problems}", PROBLEMS);
    };

    const replaceForPrivacyMode = async (text: string) => {
        let replaced: string = text;
        replaced = replaced.replaceAll("{file_name}", "a file");
        replaced = replaced.replaceAll("{file_extension}", "");
        replaced = replaced.replaceAll("{folder_and_file}", "a file in a folder");
        replaced = replaced.replaceAll("{directory_name}", "a folder");
        replaced = replaced.replaceAll("{full_directory_name}", "a folder");
        replaced = replaced.replaceAll("{workspace}", "a workspace");
        replaced = replaced.replaceAll("{workspace_folder}", "a workspace");
        replaced = replaced.replaceAll("{workspace_and_folder}", "a workspace");

        return replaced;
    };

    let workspaceExcludedText = "No workspace ignore text provided.";
    const ignoreWorkspacesText = config.get("vscord.ignore.workspacesText") ?? "";

    if (isObject(ignoreWorkspacesText)) {
        workspaceExcludedText =
            (dataClass.workspaceFolder
                ? await replaceAllText(String(ignoreWorkspacesText[dataClass.workspaceFolder.name]))
                : undefined) ?? workspaceExcludedText;
    } else {
        const text = await replaceAllText(ignoreWorkspacesText);
        workspaceExcludedText = text !== "" ? text : workspaceExcludedText;
    }

    let details = isWorkspaceExcluded ? workspaceExcludedText : undefined;
    let state = undefined;

    let largeImageKey = undefined;
    let largeImageText = undefined;

    let smallImageKey = undefined;
    let smallImageText = undefined;

    switch (status) {
        case CURRENT_STATUS.IDLE: {
            if (!isWorkspaceExcluded) {
                if (detailsIdleEnabled && detailsEnabled)
                    details = await replaceAllText(config.get("vscord.status.details.text.idle")!);
                if (stateIdleEnabled && stateEnabled)
                    state = await replaceAllText(config.get("vscord.status.state.text.idle")!);
            }

            largeImageKey = await replaceAllText(config.get("vscord.status.image.large.idle.key")!);
            largeImageText = await replaceAllText(config.get("vscord.status.image.large.idle.text")!);
            smallImageKey = await replaceAllText(config.get("vscord.status.image.small.idle.key")!);
            smallImageText = await replaceAllText(config.get("vscord.status.image.small.idle.text")!);
            break;
        }
        case CURRENT_STATUS.EDITING: {
            if (!isWorkspaceExcluded) {
                if (detailsEnabled) details = await replaceAllText(config.get("vscord.status.details.text.editing")!);
                if (stateEnabled) state = await replaceAllText(config.get("vscord.status.state.text.editing")!);
            }

            largeImageKey = await replaceAllText(config.get("vscord.status.image.large.editing.key")!);
            largeImageText = await replaceAllText(config.get("vscord.status.image.large.editing.text")!);

            smallImageKey = await replaceAllText(config.get("vscord.status.image.small.editing.key")!);
            smallImageText = await replaceAllText(config.get("vscord.status.image.small.editing.text")!);
            break;
        }
        case CURRENT_STATUS.DEBUGGING: {
            if (!isWorkspaceExcluded) {
                if (detailsEnabled) details = await replaceAllText(config.get("vscord.status.details.text.debugging")!);
                if (stateEnabled) state = await replaceAllText(config.get("vscord.status.state.text.debugging")!);
            }

            largeImageKey = await replaceAllText(config.get("vscord.status.image.large.debugging.key")!);
            largeImageText = await replaceAllText(config.get("vscord.status.image.large.debugging.text")!);

            smallImageKey = await replaceAllText(config.get("vscord.status.image.small.debugging.key")!);
            smallImageText = await replaceAllText(config.get("vscord.status.image.small.debugging.text")!);
            break;
        }
        case CURRENT_STATUS.VIEWING: {
            if (!isWorkspaceExcluded) {
                if (detailsEnabled) details = await replaceAllText(config.get("vscord.status.details.text.viewing")!);
                if (stateEnabled) state = await replaceAllText(config.get("vscord.status.state.text.viewing")!);
            }

            largeImageKey = await replaceAllText(config.get("vscord.status.image.large.viewing.key")!);
            largeImageText = await replaceAllText(config.get("vscord.status.image.large.viewing.text")!);

            smallImageKey = await replaceAllText(config.get("vscord.status.image.small.viewing.key")!);
            smallImageText = await replaceAllText(config.get("vscord.status.image.small.viewing.text")!);
            break;
        }
        case CURRENT_STATUS.NOT_IN_FILE: {
            if (detailsEnabled) details = await replaceAllText(config.get("vscord.status.details.text.notInFile")!);
            if (stateEnabled) state = await replaceAllText(config.get("vscord.status.state.text.notInFile")!);

            largeImageKey = await replaceAllText(config.get("vscord.status.image.large.notInFile.key")!);
            largeImageText = await replaceAllText(config.get("vscord.status.image.large.notInFile.text")!);

            smallImageKey = await replaceAllText(config.get("vscord.status.image.small.notInFile.key")!);
            smallImageText = await replaceAllText(config.get("vscord.status.image.small.notInFile.text")!);
            break;
        }
    }
    let buttons = await getPresenceButtons(isIdling, isGitExcluded, status, replaceAllText);
    //
    presence.details = details;
    presence.state = state;
    presence.largeImageKey = largeImageKey;
    presence.largeImageText = largeImageText;
    presence.smallImageKey = smallImageKey;
    presence.smallImageText = smallImageText;
    presence.buttons = buttons;

    // Clean up
    if (!presence.details || presence.details.trim() === "") delete presence.details;
    if (!presence.state || presence.state.trim() === "") delete presence.state;
    if (!presence.largeImageKey || presence.largeImageKey.trim() === "") delete presence.largeImageKey;
    if (!presence.largeImageText || presence.largeImageText.trim() === "") delete presence.largeImageText;
    if (!presence.smallImageKey || presence.smallImageKey.trim() === "") delete presence.smallImageKey;
    if (!presence.smallImageText || presence.smallImageText.trim() === "") delete presence.smallImageText;
    if (!presence.buttons || presence.buttons.length === 0) delete presence.buttons;

    return presence;
};

async function createButton(
    replaceAllText: (text: string) => Promise<string>,
    state: "Idle" | "Active" | "Inactive",
    isGit: boolean,
    currentButton: "Button1" | "Button2"
): Promise<GatewayActivityButton | undefined> {
    const config = getConfig();

    const b = ({ Button1: "button1", Button2: "button2" } as const)[currentButton];
    const g = isGit ? (".git" as const) : ("" as const);
    const s = ({ Idle: "idle", Active: "active", Inactive: "inactive" } as const)[state];

    const keyEnabled = `vscord.status.buttons.${b}${g}.${s}.enabled` as const satisfies keyof ExtensionConfigGenerated;
    const keyLabel = `vscord.status.buttons.${b}${g}.${s}.label` as const satisfies keyof ExtensionConfigGenerated;
    const keyUrl = `vscord.status.buttons.${b}${g}.${s}.url` as const satisfies keyof ExtensionConfigGenerated;

    const enabled = config.get(keyEnabled);
    logInfo("[activity.ts] createButton(): enabled", enabled);
    if (!enabled) {
        return undefined;
    }

    return {
        label: await replaceAllText(config.get(keyLabel)!),
        url: await replaceAllText(config.get(keyUrl)!)
    };
}

function buttonValidation(
    button: GatewayActivityButton | undefined,
    state: string
): {
    button: GatewayActivityButton | undefined;
    validationError: string;
} {
    if (!button) return { button: undefined, validationError: "" };
    let validationError = "";

    const trimmedLabel = button.label.trim();
    const trimmedUrl = button.url.trim();

    if (!trimmedLabel || !trimmedUrl) {
        validationError += `Invalid ${!trimmedLabel ? `Label` : ""} ${!trimmedLabel && !trimmedUrl ? "and " : ""}${
            !trimmedUrl ? "Url" : ""
        } for ${state}.`;
        button = undefined;
    }

    return { button, validationError };
}

export const getPresenceButtons = async (
    isIdling: boolean,
    isGitExcluded: boolean,
    status: CURRENT_STATUS,
    replaceAllText: (text: string) => Promise<string>
): Promise<GatewayActivityButton[]> => {
    const config = getConfig();
    let button1Enabled = config.get("vscord.status.buttons.button1.enabled")!;
    let button2Enabled = config.get("vscord.status.buttons.button2.enabled")!;
    let state: "Idle" | "Active" | "Inactive" | undefined = isIdling
        ? "Idle"
        : isGitExcluded
          ? undefined
          : status == CURRENT_STATUS.EDITING ||
              status == CURRENT_STATUS.VIEWING ||
              status == CURRENT_STATUS.NOT_IN_FILE ||
              status == CURRENT_STATUS.DEBUGGING
            ? "Active"
            : "Inactive";
    if ((!button1Enabled && !button2Enabled) || !state) return [];
    let isGit = !isGitExcluded && !!dataClass.gitRemoteUrl;
    logInfo("[activity.ts] repo button1#gitRemoteUrl:", dataClass.gitRemoteUrl, "isGit", isGit);
    let button1 = buttonValidation(await createButton(replaceAllText, state, isGit, "Button1"), "Button1");
    let button2 = buttonValidation(await createButton(replaceAllText, state, isGit, "Button2"), "Button2");
    logInfo("[activity.ts] getPresenceButtons button1:", state, button1);
    logInfo("[activity.ts] getPresenceButtons button2:", state, button2);
    if ((button1.validationError || button2.validationError) && !config.get("vscord.behaviour.suppressNotifications"))
        window.showErrorMessage(`${button1.validationError} ${button2.validationError}`);
    return [button1.button, button2.button].filter(Boolean) as GatewayActivityButton[];
};

export const replaceAppInfo = (text: string): string => {
    text = text.slice();
    const { appName } = env;

    const isInsider = appName.includes("Insiders");
    const isCodium = appName.startsWith("VSCodium") || appName.startsWith("codium");
    const isAntigravity = appName.startsWith("Antigravity");
    const isCursor = appName.startsWith("Cursor");

    const insiderAppName = isCodium ? "vscodium-insiders" : "vscode-insiders";
    let normalAppName;

    if (isCursor) {
        normalAppName = "cursor";
    } else if (isAntigravity) {
        normalAppName = "antigravity";
    } else if (isCodium) {
        normalAppName = "vscodium";
    } else {
        normalAppName = "vscode";
    }

    const replaceMap = new Map([
        ["{app_name}", appName],
        ["{app_id}", isInsider ? insiderAppName : normalAppName]
    ]);

    for (const [key, value] of replaceMap) text = text.replaceAll(key, value);

    return text;
};

export const getTotalProblems = (
    countedSeverities: ExtensionConfigGenerated["vscord.status.problems.countedSeverities"]
): number => {
    let totalProblems = 0;

    for (const severity of countedSeverities) {
        switch (severity) {
            case "error": {
                totalProblems += COUNTED_SEVERITIES.error;
                break;
            }
            case "warning": {
                totalProblems += COUNTED_SEVERITIES.warning;
                break;
            }
            case "info": {
                totalProblems += COUNTED_SEVERITIES.info;
                break;
            }
            case "hint": {
                totalProblems += COUNTED_SEVERITIES.hint;
                break;
            }
        }
    }

    return totalProblems;
};

export const replaceGitInfo = (text: string, excluded = false): string => {
    text = text.slice();

    const replaceMap = new Map([
        ["{git_owner}", (!excluded ? dataClass.gitRemoteUrl?.owner : undefined) ?? FAKE_EMPTY],
        ["{git_repo}", (!excluded ? (dataClass.gitRemoteUrl?.name ?? dataClass.gitRepoName) : undefined) ?? FAKE_EMPTY],
        ["{git_branch}", (!excluded ? dataClass.gitBranchName : undefined) ?? FAKE_EMPTY],

        //  http, https, ssh, git
        ["{git_protocol}", (!excluded ? dataClass.gitRemoteUrl?.protocol : undefined) ?? FAKE_EMPTY],
        // github.com, gitlab.com, bitbucket.org, etc. (excluding port)
        ["{git_resource}", (!excluded ? dataClass.gitRemoteUrl?.resource : undefined) ?? FAKE_EMPTY],
        // github.com, gitlab.com, bitbucket.org, etc. (include port)
        ["{git_host}", (!excluded ? dataClass.gitRemoteUrl?.source : undefined) ?? FAKE_EMPTY],
        ["{git_port}", (!excluded ? dataClass.gitRemoteUrl?.port?.toString() : undefined) ?? FAKE_EMPTY],
        ["{git_href}", (!excluded ? dataClass.gitRemoteUrl?.href : undefined) ?? FAKE_EMPTY],
        ["{git_url}", (!excluded ? dataClass.gitRemoteUrl?.toString("https") : undefined) ?? FAKE_EMPTY]
    ]);

    for (const [key, value] of replaceMap) text = text.replaceAll(key, value);

    return text;
};

export const replaceFileInfo = async (
    text: string,
    excluded = false,
    document?: TextDocument,
    selection?: Selection
): Promise<string> => {
    const config = getConfig();
    text = text.slice();
    let workspaceFolderName =
        dataClass.workspaceFolder?.name ?? config.get("vscord.status.details.text.noWorkSpaceText")!;
    let workspaceName = dataClass.workspaceName ?? config.get("vscord.status.details.text.noWorkSpaceText")!;
    let workspaceAndFolder =
        workspaceName + (workspaceFolderName != FAKE_EMPTY ? ` - ${workspaceFolderName}` : FAKE_EMPTY);

    workspaceAndFolder =
        workspaceAndFolder.trim() === ""
            ? config.get("vscord.status.details.text.noWorkSpaceText")!
            : workspaceAndFolder;

    let fullDirectoryName: string = FAKE_EMPTY;
    const fileIcon = dataClass.editor ? resolveLangName(dataClass.editor.document) : "text";
    const fileSize = await getFileSize(config, dataClass);
    let relativeFilepath: string = FAKE_EMPTY;

    if (dataClass.editor && dataClass.workspaceName && !excluded) {
        const name = dataClass.workspaceName;
        relativeFilepath = workspace.asRelativePath(dataClass.editor.document.fileName);
        const relativePath = workspace.asRelativePath(dataClass.editor.document.fileName).split(sep);

        relativePath.splice(-1, 1);
        fullDirectoryName = `${name}${sep}${relativePath.join(sep)}`;
    }

    if (excluded) {
        workspaceFolderName = FAKE_EMPTY;
        workspaceName = FAKE_EMPTY;
        workspaceAndFolder = FAKE_EMPTY;
        fullDirectoryName = FAKE_EMPTY;
        relativeFilepath = FAKE_EMPTY;
    }

    const totalProblems = config.get("vscord.status.problems.enabled")
        ? getTotalProblems(config.get("vscord.status.problems.countedSeverities")!)
        : 0;

    const replaceMap = new Map([
        ["{file_name}", dataClass.fileName ?? FAKE_EMPTY],
        ["{file_extension}", dataClass.fileExtension ?? FAKE_EMPTY],
        ["{file_size}", fileSize?.toLocaleString() ?? FAKE_EMPTY],
        ["{folder_and_file}", dataClass.folderAndFile ?? FAKE_EMPTY],
        ["{relative_file_path}", relativeFilepath],
        ["{directory_name}", dataClass.dirName ?? FAKE_EMPTY],
        ["{full_directory_name}", fullDirectoryName],
        ["{workspace}", workspaceName],
        ["{workspace_folder}", workspaceFolderName],
        ["{workspace_and_folder}", workspaceAndFolder],
        ["{lang}", toLower(fileIcon)],
        ["{Lang}", toTitle(fileIcon)],
        ["{LANG}", toUpper(fileIcon)],
        ["{a_lang}", `${getArticle(toLower(fileIcon))} ${toLower(fileIcon)}`],
        ["{a_Lang}", `${getArticle(toTitle(fileIcon))} ${toTitle(fileIcon)}`],
        ["{a_LANG}", `${getArticle(toUpper(fileIcon))} ${toUpper(fileIcon)}`],
        [
            "{problems_count}",
            config.get("vscord.status.problems.enabled") ? totalProblems.toLocaleString() : FAKE_EMPTY
        ],
        ["{problems_pluralize}", totalProblems === 1 ? "problem" : "problems"],
        ["{problems_count_errors}", COUNTED_SEVERITIES.error.toLocaleString()],
        ["{problems_count_warnings}", COUNTED_SEVERITIES.warning.toLocaleString()],
        ["{problems_count_infos}", COUNTED_SEVERITIES.info.toLocaleString()],
        ["{problems_count_hints}", COUNTED_SEVERITIES.hint.toLocaleString()],
        ["{line_count}", document?.lineCount.toLocaleString() ?? FAKE_EMPTY],
        ["{current_line}", selection ? (selection.active.line + 1).toLocaleString() : FAKE_EMPTY],
        ["{current_column}", selection ? (selection.active.character + 1).toLocaleString() : FAKE_EMPTY]
    ]);

    for (const [key, value] of replaceMap) text = text.replaceAll(key, value);

    return text;
};
