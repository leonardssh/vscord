import { debug, DiagnosticSeverity, env, languages, Selection, TextDocument, window, workspace } from "vscode";
import { resolveLangName, toLower, toTitle, toUpper } from "./helpers/resolveLangName";
import { CONFIG_KEYS, EMPTY, FAKE_EMPTY } from "./constants";
import { type SetActivity } from "@xhayper/discord-rpc";
import { getFileSize } from "./helpers/getFileSize";
import { isExcluded } from "./helpers/isExcluded";
import { isObject } from "./helpers/isObject";
import { getConfig } from "./config";
import { dataClass } from "./data";
import { sep } from "node:path";

let totalProblems = 0;

export function onDiagnosticsChange() {
    const diagnostics = languages.getDiagnostics();

    let counted = 0;

    diagnostics.forEach((diagnostic) => {
        if (diagnostic[1]) {
            diagnostic[1].forEach((diagnostic) => {
                if (
                    diagnostic.severity === DiagnosticSeverity.Warning ||
                    diagnostic.severity === DiagnosticSeverity.Error
                )
                    counted++;
            });
        }
    });

    totalProblems = counted;
}

export function activity(previous: SetActivity = {}, isViewing = false, isIdling = false): SetActivity {
    const config = getConfig();

    const presence = previous;

    presence.startTimestamp = config.get(CONFIG_KEYS.Status.ShowElapsedTime)
        ? config.get(CONFIG_KEYS.Status.ResetElapsedTimePerFile)
            ? Date.now()
            : previous.startTimestamp ?? Date.now()
        : undefined;

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
        "uri" in dataClass.workspaceFolder &&
        isExcluded(config.get(CONFIG_KEYS.Ignore.Workspaces), dataClass.workspaceFolder.uri.fsPath);
    let workspaceExcludedText = "No workspace ignore text provided.";

    if (isWorkspaceExcluded) {
        const ignoreWorkspacesText = config.get(CONFIG_KEYS.Ignore.WorkspacesText);

        if (isObject(ignoreWorkspacesText)) {
            workspaceExcludedText =
                (dataClass.workspaceFolder ? ignoreWorkspacesText[dataClass.workspaceFolder.name] : undefined) ??
                workspaceExcludedText;
        } else {
            workspaceExcludedText = ignoreWorkspacesText ?? workspaceExcludedText;
        }
    }

    const isDebugging = !!debug.activeDebugSession;
    isViewing = !isDebugging && isViewing;

    const PROBLEMS = replaceFileInfo(
        replaceGitInfo(replaceAppInfo(config.get(CONFIG_KEYS.Status.Problems.Text)), isGitExcluded),
        isWorkspaceExcluded,
        window.activeTextEditor?.document,
        window.activeTextEditor?.selection
    );

    const replaceAllText = (text: string) =>
        replaceFileInfo(
            replaceGitInfo(replaceAppInfo(text), isGitExcluded),
            isWorkspaceExcluded,
            window.activeTextEditor?.document,
            window.activeTextEditor?.selection
        ).replace("{problems}", PROBLEMS);

    const detailsText =
        detailsIdleEnabled && isIdling
            ? replaceAllText(config.get(CONFIG_KEYS.Status.Details.Text.Idle))
            : replaceAllText(
                  isDebugging
                      ? config.get(CONFIG_KEYS.Status.Details.Text.Debugging)
                      : isViewing
                      ? config.get(CONFIG_KEYS.Status.Details.Text.Viewing)
                      : config.get(CONFIG_KEYS.Status.Details.Text.Editing)
              );

    const stateText =
        stateIdleEnabled && isIdling
            ? replaceAllText(config.get(CONFIG_KEYS.Status.State.Text.Idle))
            : replaceAllText(
                  isDebugging
                      ? config.get(CONFIG_KEYS.Status.State.Text.Debugging)
                      : isViewing
                      ? config.get(CONFIG_KEYS.Status.State.Text.Viewing)
                      : config.get(CONFIG_KEYS.Status.State.Text.Editing)
              );

    const largeImageKey = replaceAllText(
        isDebugging
            ? config.get(CONFIG_KEYS.Status.Image.Large.Debugging.Key)
            : isViewing
            ? config.get(CONFIG_KEYS.Status.Image.Large.Viewing.Key)
            : isIdling
            ? config.get(CONFIG_KEYS.Status.Image.Large.Idle.Key)
            : config.get(CONFIG_KEYS.Status.Image.Large.Editing.Key)
    );

    const largeImageText = replaceAllText(
        isDebugging
            ? config.get(CONFIG_KEYS.Status.Image.Large.Debugging.Text)
            : isViewing
            ? config.get(CONFIG_KEYS.Status.Image.Large.Viewing.Text)
            : isIdling
            ? config.get(CONFIG_KEYS.Status.Image.Large.Idle.Text)
            : config.get(CONFIG_KEYS.Status.Image.Large.Editing.Text)
    );

    const smallImageKey = replaceAllText(
        isDebugging
            ? config.get(CONFIG_KEYS.Status.Image.Small.Debugging.Key)
            : isViewing
            ? config.get(CONFIG_KEYS.Status.Image.Small.Viewing.Key)
            : isIdling
            ? config.get(CONFIG_KEYS.Status.Image.Small.Idle.Key)
            : config.get(CONFIG_KEYS.Status.Image.Small.Editing.Key)
    );

    const smallImageText = replaceAllText(
        isDebugging
            ? config.get(CONFIG_KEYS.Status.Image.Small.Debugging.Text)
            : isViewing
            ? config.get(CONFIG_KEYS.Status.Image.Small.Viewing.Text)
            : isIdling
            ? config.get(CONFIG_KEYS.Status.Image.Small.Idle.Text)
            : config.get(CONFIG_KEYS.Status.Image.Small.Editing.Text)
    );

    presence.details = detailsEnabled ? detailsText : undefined;
    presence.state = stateEnabled ? stateText : undefined;
    presence.largeImageKey = largeImageKey;
    presence.largeImageText = largeImageText;
    presence.smallImageKey = smallImageKey;
    presence.smallImageText = smallImageText;

    if (isIdling) {
        if (config.get(CONFIG_KEYS.Status.Button.Idle.Enabled))
            presence.buttons = [
                {
                    label: replaceAllText(config.get(CONFIG_KEYS.Status.Button.Idle.Label)),
                    url: replaceAllText(config.get(CONFIG_KEYS.Status.Button.Idle.Url))
                }
            ];
    } else if (!isGitExcluded && dataClass.gitRemoteUrl) {
        if (config.get(CONFIG_KEYS.Status.Button.Active.Enabled))
            presence.buttons = [
                {
                    label: replaceAllText(config.get(CONFIG_KEYS.Status.Button.Active.Label)),
                    url: replaceAllText(config.get(CONFIG_KEYS.Status.Button.Active.Url))
                }
            ];
    } else if (isGitExcluded) {
        if (config.get(CONFIG_KEYS.Status.Button.Inactive.Enabled))
            presence.buttons = [
                {
                    label: replaceAllText(config.get(CONFIG_KEYS.Status.Button.Inactive.Label)),
                    url: replaceAllText(config.get(CONFIG_KEYS.Status.Button.Inactive.Url))
                }
            ];
    }

    console.log(JSON.stringify(presence));
    return presence;
}

export const replaceAppInfo = (text: string): string => {
    text = text.slice();
    const { appName } = env;

    const isInsider = appName.includes("Insiders");
    const isCodium = appName.startsWith("VSCodium") || appName.startsWith("codium");

    const replaceMap = new Map([
        ["{app_name}", appName],
        [
            "{app_id}",
            isInsider ? (isCodium ? "vscodium-insiders" : "vscode-insiders") : isCodium ? "vscodium" : "vscode"
        ]
    ]);

    for (const [key, value] of replaceMap) text = text.replace(key, value);

    return text;
};

export const replaceGitInfo = (text: string, excluded: boolean = false): string => {
    text = text.slice();

    const replaceMap = new Map([
        [
            "{git_repo}",
            !excluded
                ? dataClass.gitRemoteUrl
                    ? dataClass.gitRemoteUrl.name
                    : dataClass.gitRepoName ?? FAKE_EMPTY
                : FAKE_EMPTY
        ],
        ["{git_branch}", !excluded ? dataClass.gitBranchName ?? FAKE_EMPTY : FAKE_EMPTY]
    ]);

    for (const [key, value] of replaceMap) text = text.replace(key, value);

    return text;
};

export const replaceFileInfo = (
    text: string,
    excluded: boolean = false,
    document?: TextDocument,
    selection?: Selection
): string => {
    const config = getConfig();
    text = text.slice();

    const workspaceFolderName = (!excluded ? dataClass.workspaceFolder?.name : undefined) ?? FAKE_EMPTY;
    const workspaceName =
        (!excluded ? dataClass.workspace?.replace("(Workspace)", EMPTY) : undefined) ?? workspaceFolderName;
    const workspaceAndFolder = !excluded
        ? `${workspaceName}${workspaceFolderName === FAKE_EMPTY ? "" : ` - ${workspaceFolderName}`}`
        : FAKE_EMPTY;

    let fullDirectoryName: string = FAKE_EMPTY;
    const fileIcon = window.activeTextEditor ? resolveLangName(window.activeTextEditor.document) : "text";
    const fileSize = getFileSize(config, dataClass);

    if (window.activeTextEditor && dataClass.workspace && !excluded) {
        const name = dataClass.workspace;
        const relativePath = workspace.asRelativePath(window.activeTextEditor.document.fileName).split(sep);

        relativePath.splice(-1, 1);
        fullDirectoryName = `${name}${sep}${relativePath.join(sep)}`;
    }

    const replaceMap = new Map([
        ["{file_name}", dataClass.fileName ?? FAKE_EMPTY],
        ["{file_extenstion}", dataClass.fileExtension ?? FAKE_EMPTY],
        ["{file_size}", fileSize?.toString() ?? FAKE_EMPTY],
        ["{folder_and_file}", dataClass.folderAndFile ?? FAKE_EMPTY],
        ["{full_directory_name}", fullDirectoryName],
        ["{workspace}", workspaceName],
        ["{workspace_folder}", workspaceFolderName],
        ["{workspace_and_folder}", workspaceAndFolder],
        ["{lang}", toLower(fileIcon)],
        ["{Lang}", toTitle(fileIcon)],
        ["{LANG}", toUpper(fileIcon)],
        ["{problems_count}", config.get(CONFIG_KEYS.Status.Problems.Enabled) ? totalProblems.toString() : FAKE_EMPTY],
        ["{line_count}", document?.lineCount.toString() ?? FAKE_EMPTY],
        ["{current_line}", selection ? (selection.active.line + 1).toString() : FAKE_EMPTY],
        ["{current_column}", selection ? (selection.active.character + 1).toString() : FAKE_EMPTY]
    ]);

    for (const [key, value] of replaceMap) text = text.replace(key, value);

    return text;
};
