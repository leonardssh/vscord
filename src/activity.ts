import { type Selection, type TextDocument, debug, DiagnosticSeverity, env, languages, workspace } from "vscode";
import { resolveLangName, toLower, toTitle, toUpper } from "./helpers/resolveLangName";
import { type SetActivity } from "@xhayper/discord-rpc";
import { CONFIG_KEYS, FAKE_EMPTY } from "./constants";
import { getFileSize } from "./helpers/getFileSize";
import { isExcluded } from "./helpers/isExcluded";
import { isObject } from "./helpers/isObject";
import { getConfig } from "./config";
import { dataClass } from "./data";
import { sep } from "node:path";

export enum CURRENT_STATUS {
    IDLE = "idle",
    EDITING = "editing",
    DEBUGGING = "debugging",
    VIEWING = "viewing"
}

interface PROBLEM_LEVELS {
    errors: number;
    warnings: number;
    infos: number;
    hints: number;
}

// TODO: move this to data class
const COUNTED_SEVERITIES: PROBLEM_LEVELS = {
    errors: 0,
    warnings: 0,
    infos: 0,
    hints: 0
}
export const onDiagnosticsChange = () => {
    const diagnostics = languages.getDiagnostics();
    let errors = 0;
    let warnings = 0;
    let infos = 0;
    let hints = 0;

    for (const diagnostic of diagnostics.values())
        for (const diagnosticItem of diagnostic[1]) {
            if (diagnosticItem.severity == DiagnosticSeverity.Error) errors++;
            if (diagnosticItem.severity == DiagnosticSeverity.Warning) warnings++;
            if (diagnosticItem.severity == DiagnosticSeverity.Information) infos++;
            if (diagnosticItem.severity == DiagnosticSeverity.Hint) hints++;
        }
    COUNTED_SEVERITIES.errors = errors;
    COUNTED_SEVERITIES.warnings = warnings;
    COUNTED_SEVERITIES.infos = infos;
    COUNTED_SEVERITIES.hints = hints;
};

export const activity = async (
    previous: SetActivity = {},
    isViewing = false,
    isIdling = false
): Promise<SetActivity> => {
    const config = getConfig();

    const presence = previous;

    if (config.get(CONFIG_KEYS.Status.ShowElapsedTime)) {
        presence.startTimestamp = config.get(CONFIG_KEYS.Status.ResetElapsedTimePerFile)
            ? Date.now()
            : previous.startTimestamp ?? Date.now();
    } else {
        delete presence.startTimestamp;
    }

    const detailsEnabled = config.get(CONFIG_KEYS.Status.Details.Enabled);
    const detailsIdleEnabled = config.get(CONFIG_KEYS.Status.Details.Idle.Enabled);
    const stateEnabled = config.get(CONFIG_KEYS.Status.State.Enabled);
    const stateIdleEnabled = config.get(CONFIG_KEYS.Status.State.Idle.Enabled);

    const gitRepo = dataClass.gitRemoteUrl?.toString("https").replace(/\.git$/, "");
    const gitOrg = dataClass.gitRemoteUrl?.organization ?? dataClass.gitRemoteUrl?.owner;
    const gitHost = dataClass.gitRemoteUrl?.source;

    const isRepositoryExcluded = !!gitRepo && isExcluded(config.get(CONFIG_KEYS.Ignore.Repositories), gitRepo);
    const isOrganizationExcluded = !!gitOrg && isExcluded(config.get(CONFIG_KEYS.Ignore.Organizations), gitOrg);
    const isGitHostExcluded = !!gitHost && isExcluded(config.get(CONFIG_KEYS.Ignore.GitHosts), gitHost);
    const isGitExcluded = isRepositoryExcluded || isOrganizationExcluded || isGitHostExcluded;

    const isWorkspaceExcluded =
        dataClass.workspaceFolder != null &&
        (isExcluded(config.get(CONFIG_KEYS.Ignore.Workspaces), dataClass.workspaceFolder.uri.fsPath) ||
            isExcluded(config.get(CONFIG_KEYS.Ignore.Workspaces), dataClass.workspaceName));

    isIdling = isIdling || (!isWorkspaceExcluded && (!dataClass.workspaceFolder || !dataClass.editor));

    const isDebugging = !!debug.activeDebugSession;
    isViewing = !isDebugging && isViewing;

    let status: CURRENT_STATUS;
    if (isIdling) status = CURRENT_STATUS.IDLE;
    else if (isDebugging) status = CURRENT_STATUS.DEBUGGING;
    else if (isViewing) status = CURRENT_STATUS.VIEWING;
    else status = CURRENT_STATUS.EDITING;

    const PROBLEMS = config.get(CONFIG_KEYS.Status.Problems.Enabled)
        ? await replaceFileInfo(
              replaceGitInfo(replaceAppInfo(config.get(CONFIG_KEYS.Status.Problems.Text)), isGitExcluded),
              isWorkspaceExcluded,
              dataClass.editor?.document,
              dataClass.editor?.selection
          )
        : FAKE_EMPTY;

    const replaceAllText = async (text: string) =>
        (
            await replaceFileInfo(
                replaceGitInfo(replaceAppInfo(text), isGitExcluded),
                isWorkspaceExcluded,
                dataClass.editor?.document,
                dataClass.editor?.selection
            )
        ).replaceAll("{problems}", PROBLEMS);

    let workspaceExcludedText = "No workspace ignore text provided.";
    const ignoreWorkspacesText = config.get(CONFIG_KEYS.Ignore.WorkspacesText);

    if (isObject(ignoreWorkspacesText)) {
        workspaceExcludedText =
            (dataClass.workspaceFolder
                ? await replaceAllText(ignoreWorkspacesText[dataClass.workspaceFolder.name])
                : undefined) ?? workspaceExcludedText;
    } else {
        const text = await replaceAllText(ignoreWorkspacesText);
        workspaceExcludedText = text !== "" ? text : undefined ?? workspaceExcludedText;
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
                    details = await replaceAllText(config.get(CONFIG_KEYS.Status.Details.Text.Idle));
                if (stateIdleEnabled && stateEnabled)
                    state = await replaceAllText(config.get(CONFIG_KEYS.Status.State.Text.Idle));
            }

            largeImageKey = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Large.Idle.Key));
            largeImageText = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Large.Idle.Text));

            smallImageKey = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Small.Idle.Key));
            smallImageText = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Small.Idle.Text));
            break;
        }
        case CURRENT_STATUS.EDITING: {
            if (!isWorkspaceExcluded) {
                if (detailsEnabled) details = await replaceAllText(config.get(CONFIG_KEYS.Status.Details.Text.Editing));
                if (stateEnabled) state = await replaceAllText(config.get(CONFIG_KEYS.Status.State.Text.Editing));
            }

            largeImageKey = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Large.Editing.Key));
            largeImageText = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Large.Editing.Text));

            smallImageKey = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Small.Editing.Key));
            smallImageText = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Small.Editing.Text));
            break;
        }
        case CURRENT_STATUS.DEBUGGING: {
            if (!isWorkspaceExcluded) {
                if (detailsEnabled)
                    details = await replaceAllText(config.get(CONFIG_KEYS.Status.Details.Text.Debugging));
                if (stateEnabled) state = await replaceAllText(config.get(CONFIG_KEYS.Status.State.Text.Debugging));
            }

            largeImageKey = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Large.Debugging.Key));
            largeImageText = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Large.Debugging.Text));

            smallImageKey = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Small.Debugging.Key));
            smallImageText = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Small.Debugging.Text));
            break;
        }
        case CURRENT_STATUS.VIEWING: {
            if (!isWorkspaceExcluded) {
                if (detailsEnabled) details = await replaceAllText(config.get(CONFIG_KEYS.Status.Details.Text.Viewing));
                if (stateEnabled) state = await replaceAllText(config.get(CONFIG_KEYS.Status.State.Text.Viewing));
            }

            largeImageKey = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Large.Viewing.Key));
            largeImageText = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Large.Viewing.Text));

            smallImageKey = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Small.Viewing.Key));
            smallImageText = await replaceAllText(config.get(CONFIG_KEYS.Status.Image.Small.Viewing.Text));
            break;
        }
    }

    presence.details = details;
    presence.state = state;
    presence.largeImageKey = largeImageKey;
    presence.largeImageText = largeImageText;
    presence.smallImageKey = smallImageKey;
    presence.smallImageText = smallImageText;

    if (isIdling || !dataClass.editor) {
        if (config.get(CONFIG_KEYS.Status.Button.Idle.Enabled))
            presence.buttons = [
                {
                    label: await replaceAllText(config.get(CONFIG_KEYS.Status.Button.Idle.Label)),
                    url: await replaceAllText(config.get(CONFIG_KEYS.Status.Button.Idle.Url))
                }
            ];
    } else if (!isGitExcluded && dataClass.gitRemoteUrl) {
        if (config.get(CONFIG_KEYS.Status.Button.Active.Enabled))
            presence.buttons = [
                {
                    label: await replaceAllText(config.get(CONFIG_KEYS.Status.Button.Active.Label)),
                    url: await replaceAllText(config.get(CONFIG_KEYS.Status.Button.Active.Url))
                }
            ];
    } else if (isGitExcluded) {
        if (config.get(CONFIG_KEYS.Status.Button.Inactive.Enabled))
            presence.buttons = [
                {
                    label: await replaceAllText(config.get(CONFIG_KEYS.Status.Button.Inactive.Label)),
                    url: await replaceAllText(config.get(CONFIG_KEYS.Status.Button.Inactive.Url))
                }
            ];
    }

    // Clean up
    presence.details === "" && delete presence.details;
    presence.state === "" && delete presence.state;
    presence.buttons?.length === 0 && delete presence.buttons;
    presence.largeImageKey === "" && delete presence.largeImageKey;
    presence.largeImageText === "" && delete presence.largeImageText;
    presence.smallImageKey === "" && delete presence.smallImageKey;
    presence.smallImageText === "" && delete presence.smallImageText;

    return presence;
};

export const replaceAppInfo = (text: string): string => {
    text = text.slice();
    const { appName } = env;

    const isInsider = appName.includes("Insiders");
    const isCodium = appName.startsWith("VSCodium") || appName.startsWith("codium");

    const insiderAppName = isCodium ? "vscodium-insiders" : "vscode-insiders";
    const normalAppName = isCodium ? "vscodium" : "vscode";

    const replaceMap = new Map([
        ["{app_name}", appName],
        ["{app_id}", isInsider ? insiderAppName : normalAppName]
    ]);

    for (const [key, value] of replaceMap) text = text.replaceAll(key, value);

    return text;
};

export const replaceGitInfo = (text: string, excluded = false): string => {
    text = text.slice();

    const replaceMap = new Map([
        ["{git_owner}", (!excluded ? dataClass.gitRemoteUrl?.owner : undefined) ?? FAKE_EMPTY],
        ["{git_provider}", (!excluded ? dataClass.gitRemoteUrl?.source : undefined) ?? FAKE_EMPTY],
        ["{git_repo}", (!excluded ? dataClass.gitRemoteUrl?.name ?? dataClass.gitRepoName : undefined) ?? FAKE_EMPTY],
        ["{git_branch}", (!excluded ? dataClass.gitBranchName : undefined) ?? FAKE_EMPTY],
        ["{git_url}", (!excluded ? dataClass.gitRemoteUrl?.toString("https") : undefined) ?? FAKE_EMPTY]
    ]);

    for (const [key, value] of replaceMap) text = text.replaceAll(key, value);

    return text;
};

export const getTotalProblems = (countedSeverities: Array<string>): number => {
    let totalProblems = 0;
    countedSeverities.forEach(severity => {
        const logLevel = severity.toLowerCase()
        if (logLevel === 'errors') totalProblems += COUNTED_SEVERITIES.errors;
        if (logLevel === 'warnings') totalProblems += COUNTED_SEVERITIES.warnings;
        if (logLevel === 'infos') totalProblems += COUNTED_SEVERITIES.infos;
        if (logLevel === 'hints') totalProblems += COUNTED_SEVERITIES.hints;
    });
    return totalProblems;
}

export const replaceFileInfo = async (
    text: string,
    excluded = false,
    document?: TextDocument,
    selection?: Selection
): Promise<string> => {
    const config = getConfig();
    text = text.slice();

    let workspaceFolderName = dataClass.workspaceFolder?.name ?? FAKE_EMPTY;
    let workspaceName = dataClass.workspaceName ?? FAKE_EMPTY;
    let workspaceAndFolder =
        workspaceName + (workspaceFolderName != FAKE_EMPTY ? ` - ${workspaceFolderName}` : FAKE_EMPTY);

    let fullDirectoryName: string = FAKE_EMPTY;
    const fileIcon = dataClass.editor ? resolveLangName(dataClass.editor.document) : "text";
    const fileSize = await getFileSize(config, dataClass);

    if (dataClass.editor && dataClass.workspaceName && !excluded) {
        const name = dataClass.workspaceName;
        const relativePath = workspace.asRelativePath(dataClass.editor.document.fileName).split(sep);

        relativePath.splice(-1, 1);
        fullDirectoryName = `${name}${sep}${relativePath.join(sep)}`;
    }

    if (excluded) {
        workspaceFolderName = FAKE_EMPTY;
        workspaceName = FAKE_EMPTY;
        workspaceAndFolder = FAKE_EMPTY;
        fullDirectoryName = FAKE_EMPTY;
    }

    const replaceMap = new Map([
        ["{file_name}", dataClass.fileName ?? FAKE_EMPTY],
        ["{file_extenstion}", dataClass.fileExtension ?? FAKE_EMPTY],
        ["{file_size}", fileSize?.toLocaleString() ?? FAKE_EMPTY],
        ["{folder_and_file}", dataClass.folderAndFile ?? FAKE_EMPTY],
        ["{directory_name}", dataClass.dirName ?? FAKE_EMPTY],
        ["{full_directory_name}", fullDirectoryName],
        ["{workspace}", workspaceName],
        ["{workspace_folder}", workspaceFolderName],
        ["{workspace_and_folder}", workspaceAndFolder],
        ["{lang}", toLower(fileIcon)],
        ["{Lang}", toTitle(fileIcon)],
        ["{LANG}", toUpper(fileIcon)],
        [
            "{problems_count}",
            config.get(CONFIG_KEYS.Status.Problems.Enabled) ? getTotalProblems(config.get(CONFIG_KEYS.Status.Problems.countedSeverities)).toLocaleString() : FAKE_EMPTY
        ],
        [
            "{problems_count_errors}",
            COUNTED_SEVERITIES.errors.toLocaleString()
        ],
        [
            "{problems_count_warnings}",
            COUNTED_SEVERITIES.warnings.toLocaleString()
        ],
        [
            "{problems_count_infos}",
            COUNTED_SEVERITIES.infos.toLocaleString()
        ],
        [
            "{problems_count_hints}",
            COUNTED_SEVERITIES.hints.toLocaleString()
        ],
        ["{line_count}", document?.lineCount.toLocaleString() ?? FAKE_EMPTY],
        ["{current_line}", selection ? (selection.active.line + 1).toLocaleString() : FAKE_EMPTY],
        ["{current_column}", selection ? (selection.active.character + 1).toLocaleString() : FAKE_EMPTY]
    ]);

    for (const [key, value] of replaceMap) text = text.replaceAll(key, value);

    return text;
};
