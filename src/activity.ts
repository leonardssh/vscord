import { resolveLangName, toLower, toTitle, toUpper } from "./helpers/resolveLangName";
import { type SetActivity } from "@xhayper/discord-rpc";
import { CONFIG_KEYS, FAKE_EMPTY } from "./constants";
import { getFileSize } from "./helpers/getFileSize";
import { isExcluded } from "./helpers/isExcluded";
import { isObject } from "./helpers/isObject";
import { getConfig } from "./config";
import { dataClass } from "./data";
import { sep } from "node:path";
import {
    type Selection,
    type TextDocument,
    type NotebookDocument,
    debug,
    DiagnosticSeverity,
    env,
    languages,
    workspace
} from "vscode";

// TODO: move this to data class
export let totalProblems = 0;

// TODO: make this configurable
const COUNTED_SEVERITIES = [DiagnosticSeverity.Error, DiagnosticSeverity.Warning];

export const onDiagnosticsChange = () => {
    const diagnostics = languages.getDiagnostics();

    let counted = 0;

    for (const diagnostic of diagnostics.values())
        for (const diagnosticItem of diagnostic[1])
            if (COUNTED_SEVERITIES.includes(diagnosticItem.severity)) totalProblems++;

    totalProblems = counted;
};

export const activity = async (
    previous: SetActivity = {},
    isViewing = false,
    isIdling = false
): Promise<SetActivity> => {
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
        (isExcluded(config.get(CONFIG_KEYS.Ignore.Workspaces), dataClass.workspaceFolder.uri.fsPath) ||
            isExcluded(config.get(CONFIG_KEYS.Ignore.Workspaces), dataClass.workspaceName));

    isIdling =
        isIdling ||
        (!isWorkspaceExcluded && (!dataClass.workspaceFolder || (!dataClass.editor && !dataClass.notebookEditor)));

    const isDebugging = !!debug.activeDebugSession;
    isViewing = !isDebugging && isViewing;

    const PROBLEMS = await replaceFileInfo(
        replaceGitInfo(replaceAppInfo(config.get(CONFIG_KEYS.Status.Problems.Text)), isGitExcluded),
        isWorkspaceExcluded,
        dataClass.editor?.document ?? dataClass.notebookEditor?.notebook,
        dataClass.editor?.selection
    );

    const replaceAllText = async (text: string) =>
        (
            await replaceFileInfo(
                replaceGitInfo(replaceAppInfo(text), isGitExcluded),
                isWorkspaceExcluded,
                dataClass.editor?.document ?? dataClass.notebookEditor?.notebook,
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

    const detailsText = detailsEnabled
        ? isWorkspaceExcluded
            ? workspaceExcludedText
            : isIdling || (!dataClass.editor && !dataClass.notebookEditor)
            ? detailsIdleEnabled
                ? await replaceAllText(config.get(CONFIG_KEYS.Status.Details.Text.Idle))
                : undefined
            : await replaceAllText(
                  isDebugging
                      ? config.get(CONFIG_KEYS.Status.Details.Text.Debugging)
                      : isViewing
                      ? config.get(CONFIG_KEYS.Status.Details.Text.Viewing)
                      : config.get(CONFIG_KEYS.Status.Details.Text.Editing)
              )
        : undefined;

    const stateText =
        stateEnabled && !isWorkspaceExcluded
            ? isIdling || (!dataClass.editor && !dataClass.notebookEditor)
                ? stateIdleEnabled
                    ? await replaceAllText(config.get(CONFIG_KEYS.Status.State.Text.Idle))
                    : undefined
                : await replaceAllText(
                      isDebugging
                          ? config.get(CONFIG_KEYS.Status.State.Text.Debugging)
                          : isViewing
                          ? config.get(CONFIG_KEYS.Status.State.Text.Viewing)
                          : config.get(CONFIG_KEYS.Status.State.Text.Editing)
                  )
            : undefined;

    const largeImageKey = await replaceAllText(
        isIdling || (!dataClass.editor && !dataClass.notebookEditor)
            ? config.get(CONFIG_KEYS.Status.Image.Large.Idle.Key)
            : isDebugging
            ? config.get(CONFIG_KEYS.Status.Image.Large.Debugging.Key)
            : isViewing
            ? config.get(CONFIG_KEYS.Status.Image.Large.Viewing.Key)
            : config.get(CONFIG_KEYS.Status.Image.Large.Editing.Key)
    );

    const largeImageText = await replaceAllText(
        isIdling || (!dataClass.editor && !dataClass.notebookEditor)
            ? config.get(CONFIG_KEYS.Status.Image.Large.Idle.Text)
            : isDebugging
            ? config.get(CONFIG_KEYS.Status.Image.Large.Debugging.Text)
            : isViewing
            ? config.get(CONFIG_KEYS.Status.Image.Large.Viewing.Text)
            : config.get(CONFIG_KEYS.Status.Image.Large.Editing.Text)
    );

    const smallImageKey = await replaceAllText(
        isIdling || (!dataClass.editor && !dataClass.notebookEditor)
            ? config.get(CONFIG_KEYS.Status.Image.Small.Idle.Key)
            : isDebugging
            ? config.get(CONFIG_KEYS.Status.Image.Small.Debugging.Key)
            : isViewing
            ? config.get(CONFIG_KEYS.Status.Image.Small.Viewing.Key)
            : config.get(CONFIG_KEYS.Status.Image.Small.Editing.Key)
    );

    const smallImageText = await replaceAllText(
        isIdling || (!dataClass.editor && !dataClass.notebookEditor)
            ? config.get(CONFIG_KEYS.Status.Image.Small.Idle.Text)
            : isDebugging
            ? config.get(CONFIG_KEYS.Status.Image.Small.Debugging.Text)
            : isViewing
            ? config.get(CONFIG_KEYS.Status.Image.Small.Viewing.Text)
            : config.get(CONFIG_KEYS.Status.Image.Small.Editing.Text)
    );

    presence.details = detailsEnabled ? detailsText : undefined;
    presence.state = stateEnabled ? stateText : undefined;
    presence.largeImageKey = largeImageKey;
    presence.largeImageText = largeImageText;
    presence.smallImageKey = smallImageKey;
    presence.smallImageText = smallImageText;

    if (isIdling || (!dataClass.editor && !dataClass.notebookEditor)) {
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

    const replaceMap = new Map([
        ["{app_name}", appName],
        [
            "{app_id}",
            isInsider ? (isCodium ? "vscodium-insiders" : "vscode-insiders") : isCodium ? "vscodium" : "vscode"
        ]
    ]);

    for (const [key, value] of replaceMap) text = text.replaceAll(key, value);

    return text;
};

export const replaceGitInfo = (text: string, excluded: boolean = false): string => {
    text = text.slice();

    const replaceMap = new Map([
        ["{git_owner}", (!excluded ? dataClass.gitRemoteUrl?.owner : undefined) ?? FAKE_EMPTY],
        ["{git_provider}", (!excluded ? dataClass.gitRemoteUrl?.source : undefined) ?? FAKE_EMPTY],
        [
            "{git_repo}",
            (!excluded ? (dataClass.gitRemoteUrl ? dataClass.gitRemoteUrl.name : dataClass.gitRepoName) : undefined) ??
                FAKE_EMPTY
        ],
        ["{git_branch}", (!excluded ? dataClass.gitBranchName : undefined) ?? FAKE_EMPTY],
        ["{git_url}", (!excluded ? dataClass.gitRemoteUrl?.toString("https") : undefined) ?? FAKE_EMPTY]
    ]);

    for (const [key, value] of replaceMap) text = text.replaceAll(key, value);

    return text;
};

export const replaceFileInfo = async (
    text: string,
    excluded: boolean = false,
    document?: TextDocument | NotebookDocument,
    selection?: Selection
): Promise<string> => {
    const config = getConfig();
    text = text.slice();

    const workspaceFolderName = (!excluded ? dataClass.workspaceFolder?.name : undefined) ?? FAKE_EMPTY;
    const workspaceName = (!excluded ? dataClass.workspaceName : undefined) ?? workspaceFolderName;
    const workspaceAndFolder = !excluded
        ? `${workspaceName}${workspaceFolderName === FAKE_EMPTY ? "" : ` - ${workspaceFolderName}`}`
        : FAKE_EMPTY;

    let fullDirectoryName: string = FAKE_EMPTY;
    const fileIcon = dataClass.editor ? resolveLangName(dataClass.editor.document) : "text";
    const fileSize = await getFileSize(config, dataClass);

    if (dataClass.editor && dataClass.workspaceName && !excluded) {
        const name = dataClass.workspaceName;
        const relativePath = workspace.asRelativePath(dataClass.editor.document.fileName).split(sep);

        relativePath.splice(-1, 1);
        fullDirectoryName = `${name}${sep}${relativePath.join(sep)}`;
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
            config.get(CONFIG_KEYS.Status.Problems.Enabled) ? totalProblems.toLocaleString() : FAKE_EMPTY
        ],
        [
            "{line_count}",
            (document && "lineCount" in document ? document.lineCount.toLocaleString() : undefined) ?? FAKE_EMPTY
        ],
        ["{current_line}", selection ? (selection.active.line + 1).toLocaleString() : FAKE_EMPTY],
        ["{current_column}", selection ? (selection.active.character + 1).toLocaleString() : FAKE_EMPTY]
    ]);

    for (const [key, value] of replaceMap) text = text.replaceAll(key, value);

    return text;
};
