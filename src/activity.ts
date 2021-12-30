import { Presence } from 'discord-rpc';
import { getConfig } from './config';
import { debug, DiagnosticSeverity, env, languages, Selection, TextDocument, window, workspace, WorkspaceFolder } from 'vscode';
import {
	CONFIG_KEYS,
	DEBUGGING_IMAGE_KEY,
	EMPTY,
	FAKE_EMPTY,
	IDLE_VSCODE_IMAGE_KEY,
	IDLE_VSCODE_INSIDERS_IMAGE_KEY,
	REPLACE_KEYS,
	VSCODE_IMAGE_KEY,
	VSCODE_INSIDERS_IMAGE_KEY
} from './constants';
import { resolveFileIcon, toLower, toTitle, toUpper } from './utils';
import { sep } from 'path';
import { dataClass } from './data';

let isViewing = false;
let totalProblems = 0;

function isWorkspaceExcluded(workspace: WorkspaceFolder | undefined) {
	if (!workspace) {
		return false;
	}

	const config = getConfig();
	const pattern = config[CONFIG_KEYS.IgnoreWorkspaces].join('|');
	const regex = new RegExp(pattern, 'gm');

	const isExcluded = regex.test(workspace.uri.fsPath);
	return isExcluded ? true : false;
}

export function toggleViewing(viewing: boolean) {
	isViewing = viewing;
}

export function onDiagnosticsChange() {
	const diag = languages.getDiagnostics();

	let counted = 0;

	diag.forEach((i: any) => {
		if (i[1]) {
			i[1].forEach((i: any) => {
				if (i.severity === DiagnosticSeverity.Warning || i.severity === DiagnosticSeverity.Error) {
					counted++;
				}
			});
		}
	});

	totalProblems = counted;
}

export function activity(previous: Presence = {}): Presence {
	const config = getConfig();
	const { appName } = env;
	const insiders = appName.includes('Insiders');
	const defaultSmallImageKey = debug.activeDebugSession ? DEBUGGING_IMAGE_KEY : insiders ? VSCODE_INSIDERS_IMAGE_KEY : VSCODE_IMAGE_KEY;

	const defaultSmallImageText = config[CONFIG_KEYS.SmallImage].replace(REPLACE_KEYS.AppName, appName);

	const defaultLargeImageText = config[CONFIG_KEYS.LargeImageIdling];

	let presence: Presence = {
		details: details(CONFIG_KEYS.DetailsIdling, CONFIG_KEYS.DetailsViewing, CONFIG_KEYS.DetailsEditing, CONFIG_KEYS.DetailsDebugging),
		startTimestamp: config[CONFIG_KEYS.RemoveElapsedTime] ? undefined : previous.startTimestamp ?? Date.now(),
		largeImageKey: insiders ? IDLE_VSCODE_IMAGE_KEY : IDLE_VSCODE_INSIDERS_IMAGE_KEY,
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

		const workspaceExcluded = isWorkspaceExcluded(dataClass.workspaceFolder);
		const workspaceExcludedText = config[CONFIG_KEYS.IgnoreWorkspacesText];

		presence = {
			...presence,
			details: workspaceExcluded
				? workspaceExcludedText
				: details(CONFIG_KEYS.DetailsIdling, CONFIG_KEYS.DetailsViewing, CONFIG_KEYS.DetailsEditing, CONFIG_KEYS.DetailsDebugging),
			state: workspaceExcluded
				? undefined
				: details(
						CONFIG_KEYS.LowerDetailsIdling,
						CONFIG_KEYS.LowerDetailsViewing,
						CONFIG_KEYS.LowerDetailsEditing,
						CONFIG_KEYS.LowerDetailsDebugging
				  ),
			largeImageKey,
			largeImageText
		};

		if (config[CONFIG_KEYS.ButtonEnabled]) {
			const gitRepo = dataClass.gitRemoteUrl?.toString('https').replace(/\.git$/, '');

			if (gitRepo && config[CONFIG_KEYS.ButtonActiveLabel]) {
				presence = {
					...presence,
					buttons: [
						{
							label: config[CONFIG_KEYS.ButtonActiveLabel],
							url: gitRepo
						}
					]
				};
			} else if (!gitRepo && config[CONFIG_KEYS.ButtonInactiveLabel] && config[CONFIG_KEYS.ButtonInactiveUrl]) {
				presence = {
					...presence,
					buttons: [
						{
							label: config[CONFIG_KEYS.ButtonInactiveLabel],
							url: config[CONFIG_KEYS.ButtonInactiveUrl]
						}
					]
				};
			}
		}
	}

	return presence;
}

function details(idling: CONFIG_KEYS, viewing: CONFIG_KEYS, editing: CONFIG_KEYS, debugging: CONFIG_KEYS) {
	const config = getConfig();

	let raw = (config[idling] as string).replace(REPLACE_KEYS.Empty, FAKE_EMPTY);

	if (window.activeTextEditor) {
		const noWorkspaceFound = config[CONFIG_KEYS.LowerDetailsNoWorkspaceFound].replace(REPLACE_KEYS.Empty, FAKE_EMPTY);

		const workspaceFolderName = dataClass.workspaceFolder?.name ?? noWorkspaceFound;
		const workspaceName = dataClass.workspace?.replace(REPLACE_KEYS.VSCodeWorkspace, EMPTY) ?? workspaceFolderName;
		const workspaceAndFolder = `${workspaceName}${workspaceFolderName === FAKE_EMPTY ? '' : ` - ${workspaceFolderName}`}`;

		const fileIcon = resolveFileIcon(window.activeTextEditor.document);

		const problems = config[CONFIG_KEYS.ShowProblems]
			? config[CONFIG_KEYS.ProblemsText].replace(REPLACE_KEYS.ProblemsCount, totalProblems.toString())
			: '';

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
			.replace(REPLACE_KEYS.DirName, dataClass.dirName ?? FAKE_EMPTY)
			.replace(REPLACE_KEYS.Workspace, workspaceName)
			.replace(REPLACE_KEYS.WorkspaceFolder, workspaceFolderName)
			.replace(REPLACE_KEYS.WorkspaceAndFolder, workspaceAndFolder)
			.replace(REPLACE_KEYS.LanguageLowerCase, toLower(fileIcon))
			.replace(REPLACE_KEYS.LanguageTitleCase, toTitle(fileIcon))
			.replace(REPLACE_KEYS.LanguageUpperCase, toUpper(fileIcon))
			.replace(REPLACE_KEYS.Problems, problems)
			.replace(REPLACE_KEYS.GitRepo, dataClass.gitRemoteUrl?.name ?? dataClass.gitRepoName ?? FAKE_EMPTY)
			.replace(REPLACE_KEYS.GitBranch, dataClass.gitBranchName ?? FAKE_EMPTY);
	}

	return raw;
}

function fileDetails(_raw: string, document: TextDocument, selection: Selection) {
	let raw = _raw.slice();

	if (raw.includes(REPLACE_KEYS.TotalLines)) {
		raw = raw.replace(REPLACE_KEYS.TotalLines, document.lineCount.toLocaleString());
	}

	if (raw.includes(REPLACE_KEYS.CurrentLine)) {
		raw = raw.replace(REPLACE_KEYS.CurrentLine, (selection.active.line + 1).toLocaleString());
	}

	if (raw.includes(REPLACE_KEYS.CurrentColumn)) {
		raw = raw.replace(REPLACE_KEYS.CurrentColumn, (selection.active.character + 1).toLocaleString());
	}

	return raw;
}
