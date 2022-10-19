import { debug, DiagnosticSeverity, env, languages, Selection, TextDocument, window, workspace } from "vscode";
import { getFileIcon, resolveFileIcon, toLower, toTitle, toUpper } from "./helpers/resolveFileIcon";
import { type SetActivity } from "@xhayper/discord-rpc";
import { getFileSize } from "./helpers/getFileSize";
import { isExcluded } from "./helpers/isExcluded";
import { isObject } from "./helpers/isObject";
import { getConfig } from "./config";
import { dataClass } from "./data";
import { sep } from "node:path";
import {
    CONFIG_KEYS,
    DEBUGGING_IMAGE_KEY,
    EMPTY,
    FAKE_EMPTY,
    IDLE_VSCODE_IMAGE_KEY,
    IDLE_VSCODE_INSIDERS_IMAGE_KEY,
    REPLACE_KEYS,
    VSCODE_IMAGE_KEY,
    VSCODE_INSIDERS_IMAGE_KEY,
    VSCODIUM_IMAGE_KEY,
    VSCODIUM_INSIDERS_IMAGE_KEY
} from "./constants";

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

export function activity(previous: SetActivity = {}, isViewing = false): SetActivity {
    const config = getConfig();
    const { appName } = env;

    const isInsider = appName.includes("Insiders");
    const isCodium = appName.startsWith("VSCodium") || appName.startsWith("codium");

    const defaultSmallImageKey = debug.activeDebugSession
        ? getFileIcon(DEBUGGING_IMAGE_KEY)
        : isInsider
        ? getFileIcon(isCodium ? VSCODIUM_INSIDERS_IMAGE_KEY : VSCODE_INSIDERS_IMAGE_KEY)
        : getFileIcon(isCodium ? VSCODIUM_IMAGE_KEY : VSCODE_IMAGE_KEY);

    const defaultSmallImageText = config[CONFIG_KEYS.SmallImage].replace(REPLACE_KEYS.AppName, appName);

    const defaultLargeImageText = config[CONFIG_KEYS.LargeImageIdling];

    const removeDetails = config[CONFIG_KEYS.RemoveDetails];
    const removeLowerDetails = config[CONFIG_KEYS.RemoveLowerDetails];
    const removeLowerDetailsIdling = config[CONFIG_KEYS.RemoveLowerDetailsIdling];

    let presence: SetActivity = {
        details: removeDetails
            ? undefined
            : details(
                  CONFIG_KEYS.DetailsIdling,
                  CONFIG_KEYS.DetailsViewing,
                  CONFIG_KEYS.DetailsEditing,
                  CONFIG_KEYS.DetailsDebugging,
                  isViewing
              ),
        state:
            removeLowerDetails || removeLowerDetailsIdling
                ? undefined
                : details(
                      CONFIG_KEYS.LowerDetailsIdling,
                      CONFIG_KEYS.LowerDetailsViewing,
                      CONFIG_KEYS.LowerDetailsEditing,
                      CONFIG_KEYS.LowerDetailsDebugging,
                      isViewing
                  ),
        startTimestamp: config[CONFIG_KEYS.RemoveElapsedTime] ? undefined : previous.startTimestamp ?? new Date(),
        largeImageKey: isInsider ? getFileIcon(IDLE_VSCODE_IMAGE_KEY) : getFileIcon(IDLE_VSCODE_INSIDERS_IMAGE_KEY),
        largeImageText: defaultLargeImageText,
        smallImageKey: defaultSmallImageKey,
        smallImageText: defaultSmallImageText
    };

    if (window.activeTextEditor) {
        const largeImageKey = resolveFileIcon(window.activeTextEditor.document);
        const largeImageText = config[CONFIG_KEYS.LargeImage]
            .replace(REPLACE_KEYS.LanguageLowerCase, toLower(largeImageKey))
            .replace(REPLACE_KEYS.LanguageTitleCase, toTitle(largeImageKey))
            .replace(REPLACE_KEYS.LanguageUpperCase, toUpper(largeImageKey))
            .padEnd(2, FAKE_EMPTY);

        let isWorkspaceExcluded = false;
        let workspaceExcludedText = "No workspace ignore text provided.";

        if (dataClass.workspaceFolder && "uri" in dataClass.workspaceFolder) {
            isWorkspaceExcluded = isExcluded(
                config[CONFIG_KEYS.IgnoreWorkspaces],
                dataClass.workspaceFolder.uri.fsPath
            );
        }

        if (isWorkspaceExcluded && dataClass.workspaceFolder && dataClass.workspaceFolder.name) {
            const ignoreWorkspacesText = config[CONFIG_KEYS.IgnoreWorkspacesText];

            workspaceExcludedText = isObject(ignoreWorkspacesText)
                ? // @ts-ignore Element implicitly has an 'any' type because index expression is not of type 'number'.
                  ignoreWorkspacesText[dataClass.workspaceFolder.name]
                : ignoreWorkspacesText
                ? ignoreWorkspacesText
                : "No workspace ignore text provided.";
        }

        presence = {
            ...presence,
            details: removeDetails
                ? undefined
                : isWorkspaceExcluded
                ? workspaceExcludedText
                : details(
                      CONFIG_KEYS.DetailsIdling,
                      CONFIG_KEYS.DetailsViewing,
                      CONFIG_KEYS.DetailsEditing,
                      CONFIG_KEYS.DetailsDebugging,
                      isViewing
                  ),
            state: removeLowerDetails
                ? undefined
                : isWorkspaceExcluded
                ? undefined
                : details(
                      CONFIG_KEYS.LowerDetailsIdling,
                      CONFIG_KEYS.LowerDetailsViewing,
                      CONFIG_KEYS.LowerDetailsEditing,
                      CONFIG_KEYS.LowerDetailsDebugging,
                      isViewing
                  ),
            largeImageKey: getFileIcon(largeImageKey),
            largeImageText
        };

        if (config[CONFIG_KEYS.ButtonEnabled] && dataClass.gitRemoteUrl) {
            const gitRepo = dataClass.gitRemoteUrl.toString("https").replace(/\.git$/, "");
            const gitOrg = dataClass.gitRemoteUrl.organization ?? dataClass.gitRemoteUrl.owner;
            const gitHost = dataClass.gitRemoteUrl.source;

            const isRepositoryExcluded = isExcluded(config[CONFIG_KEYS.IgnoreRepositories], gitRepo);

            const isOrganizationExcluded = isExcluded(config[CONFIG_KEYS.IgnoreOrganizations], gitOrg);

            const isGitHostExcluded = isExcluded(config[CONFIG_KEYS.IgnoreGitHosts], gitHost);

            const isNotExcluded =
                !isRepositoryExcluded && !isWorkspaceExcluded && !isOrganizationExcluded && !isGitHostExcluded;

            if (gitRepo && config[CONFIG_KEYS.ButtonActiveLabel] && isNotExcluded)
                presence = {
                    ...presence,
                    buttons: [
                        {
                            label: config[CONFIG_KEYS.ButtonActiveLabel],
                            url:
                                config[CONFIG_KEYS.ButtonActiveUrl] != ""
                                    ? config[CONFIG_KEYS.ButtonActiveUrl]
                                    : gitRepo
                        }
                    ]
                };
        }
    } else if (
        !!config[CONFIG_KEYS.ButtonEnabled] &&
        !!config[CONFIG_KEYS.ButtonInactiveLabel] &&
        !!config[CONFIG_KEYS.ButtonInactiveUrl]
    )
        presence.buttons = [
            {
                label: config[CONFIG_KEYS.ButtonInactiveLabel],
                url: config[CONFIG_KEYS.ButtonInactiveUrl]
            }
        ];

    return presence;
}

function details(
    idling: CONFIG_KEYS,
    viewing: CONFIG_KEYS,
    editing: CONFIG_KEYS,
    debugging: CONFIG_KEYS,
    isViewing: boolean
) {
    const config = getConfig();

    let raw = (config[idling] as string).replace(REPLACE_KEYS.Empty, FAKE_EMPTY);

    if (window.activeTextEditor) {
        const noWorkspaceFound = config[CONFIG_KEYS.LowerDetailsNoWorkspaceFound].replace(
            REPLACE_KEYS.Empty,
            FAKE_EMPTY
        );

        const workspaceFolderName = dataClass.workspaceFolder ? dataClass.workspaceFolder.name : noWorkspaceFound;
        const workspaceName = dataClass.workspace
            ? dataClass.workspace.replace(REPLACE_KEYS.VSCodeWorkspace, EMPTY)
            : workspaceFolderName;
        const workspaceAndFolder = `${workspaceName}${
            workspaceFolderName === FAKE_EMPTY ? "" : ` - ${workspaceFolderName}`
        }`;

        const fileIcon = resolveFileIcon(window.activeTextEditor.document);
        const fileSize = getFileSize(config, dataClass);

        const problems = config[CONFIG_KEYS.ShowProblems]
            ? config[CONFIG_KEYS.ProblemsText].replace(REPLACE_KEYS.ProblemsCount, totalProblems.toString())
            : "";

        raw = config[debug.activeDebugSession ? debugging : isViewing ? viewing : editing] as string;

        if (dataClass.workspace) {
            const name = dataClass.workspace;
            const relativePath = workspace.asRelativePath(window.activeTextEditor.document.fileName).split(sep);

            relativePath.splice(-1, 1);
            raw = raw.replace(REPLACE_KEYS.FullDirName, `${name}${sep}${relativePath.join(sep)}`);
        }

        raw = fileDetails(raw, window.activeTextEditor.document, window.activeTextEditor.selection);

        raw = raw
            .replace(REPLACE_KEYS.FileName, dataClass.fileName ?? FAKE_EMPTY)
            .replace(REPLACE_KEYS.FileExtension, dataClass.fileExtension ?? FAKE_EMPTY)
            .replace(REPLACE_KEYS.FileSize, fileSize ?? FAKE_EMPTY)
            .replace(REPLACE_KEYS.DirName, dataClass.dirName ?? FAKE_EMPTY)
            .replace(REPLACE_KEYS.Workspace, workspaceName)
            .replace(REPLACE_KEYS.WorkspaceFolder, workspaceFolderName)
            .replace(REPLACE_KEYS.WorkspaceAndFolder, workspaceAndFolder)
            .replace(REPLACE_KEYS.LanguageLowerCase, toLower(fileIcon))
            .replace(REPLACE_KEYS.LanguageTitleCase, toTitle(fileIcon))
            .replace(REPLACE_KEYS.LanguageUpperCase, toUpper(fileIcon))
            .replace(REPLACE_KEYS.Problems, problems)
            .replace(
                REPLACE_KEYS.GitRepo,
                dataClass.gitRemoteUrl ? dataClass.gitRemoteUrl.name : dataClass.gitRepoName ?? FAKE_EMPTY
            )
            .replace(REPLACE_KEYS.GitBranch, dataClass.gitBranchName ?? FAKE_EMPTY)
            .replace(REPLACE_KEYS.FolderAndFile, dataClass.folderAndFile ?? FAKE_EMPTY);
    }

    return raw;
}

function fileDetails(_raw: string, document: TextDocument, selection: Selection) {
    let raw = _raw.slice();

    if (raw.includes(REPLACE_KEYS.TotalLines))
        raw = raw.replace(REPLACE_KEYS.TotalLines, document.lineCount.toLocaleString());

    if (raw.includes(REPLACE_KEYS.CurrentLine))
        raw = raw.replace(REPLACE_KEYS.CurrentLine, (selection.active.line + 1).toLocaleString());

    if (raw.includes(REPLACE_KEYS.CurrentColumn))
        raw = raw.replace(REPLACE_KEYS.CurrentColumn, (selection.active.character + 1).toLocaleString());

    return raw;
}
