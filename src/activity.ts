import { Presence } from 'discord-rpc';
import { getConfig } from './config';
import {
	debug,
	DiagnosticSeverity,
	env,
	languages,
	Selection,
	TextDocument,
	window,
	workspace
} from 'vscode';
import {
	CONFIG_KEYS,
	DEBUGGING_IMAGE_KEY,
	FAKE_EMPTY,
	IDLE_VSCODE_IMAGE_KEY,
	IDLE_VSCODE_INSIDERS_IMAGE_KEY,
	REPLACE_KEYS,
	VSCODE_IMAGE_KEY,
	VSCODE_INSIDERS_IMAGE_KEY
} from './constants';
import {
	getGitRepo,
	resolveFileIcon,
	toLower,
	toTitle,
	toUpper
} from './utils';
import { basename, parse, sep } from 'path';

let isViewing = false;
let totalProblems = 0;

export function toggleViewing(viewing: boolean) {
	isViewing = viewing;
}

export function onDiagnosticsChange() {
	const diag = languages.getDiagnostics();

	let counted = 0;

	diag.forEach((i: any) => {
		if (i[1]) {
			i[1].forEach((i: any) => {
				if (
					i.severity === DiagnosticSeverity.Warning ||
					i.severity === DiagnosticSeverity.Error
				) {
					counted++;
				}
			});
		}
	});

	totalProblems = counted;
}

export async function activity(previous: Presence = {}): Promise<Presence> {
	const config = getConfig();
	const { appName } = env;
	const insiders = appName.includes('Insiders');
	const defaultSmallImageKey = debug.activeDebugSession
		? DEBUGGING_IMAGE_KEY
		: insiders
		? VSCODE_INSIDERS_IMAGE_KEY
		: VSCODE_IMAGE_KEY;

	const defaultSmallImageText = config[CONFIG_KEYS.SmallImage].replace(
		REPLACE_KEYS.AppName,
		appName
	);

	const defaultLargeImageText = config[CONFIG_KEYS.LargeImageIdling];

	let presence: Presence = {
		details: details(
			CONFIG_KEYS.DetailsIdling,
			CONFIG_KEYS.DetailsViewing,
			CONFIG_KEYS.DetailsEditing,
			CONFIG_KEYS.DetailsDebugging
		),
		startTimestamp: config[CONFIG_KEYS.RemoveElapsedTime]
			? undefined
			: previous.startTimestamp ?? Date.now(),
		largeImageKey: insiders
			? IDLE_VSCODE_IMAGE_KEY
			: IDLE_VSCODE_INSIDERS_IMAGE_KEY,
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

		presence = {
			...presence,
			details: details(
				CONFIG_KEYS.DetailsIdling,
				CONFIG_KEYS.DetailsViewing,
				CONFIG_KEYS.DetailsEditing,
				CONFIG_KEYS.DetailsDebugging
			),
			state: details(
				CONFIG_KEYS.LowerDetailsIdling,
				CONFIG_KEYS.LowerDetailsViewing,
				CONFIG_KEYS.LowerDetailsEditing,
				CONFIG_KEYS.LowerDetailsDebugging
			),
			largeImageKey,
			largeImageText
		};

		if (config[CONFIG_KEYS.ButtonEnabled]) {
			const gitRepo = await getGitRepo(
				window.activeTextEditor.document.fileName
			);

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
			} else if (
				!gitRepo &&
				config[CONFIG_KEYS.ButtonInactiveLabel] &&
				config[CONFIG_KEYS.ButtonInactiveUrl]
			) {
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

function details(
	idling: CONFIG_KEYS,
	viewing: CONFIG_KEYS,
	editing: CONFIG_KEYS,
	debugging: CONFIG_KEYS
) {
	const config = getConfig();

	let raw = (config[idling] as string).replace(REPLACE_KEYS.Empty, FAKE_EMPTY);

	if (window.activeTextEditor) {
		const fileName = basename(window.activeTextEditor.document.fileName);
		const { dir } = parse(window.activeTextEditor.document.fileName);
		const split = dir.split(sep);
		const dirName = split[split.length - 1];

		const noWorkspaceFound = config[
			CONFIG_KEYS.LowerDetailsNoWorkspaceFound
		].replace(REPLACE_KEYS.Empty, FAKE_EMPTY);

		const workspaceFolder = workspace.getWorkspaceFolder(
			window.activeTextEditor.document.uri
		);

		const workspaceFolderName = workspaceFolder?.name ?? noWorkspaceFound;
		const workspaceName = workspace.name ?? workspaceFolderName;
		const workspaceAndFolder = `${workspaceName}${
			workspaceFolderName === FAKE_EMPTY ? '' : ` - ${workspaceFolderName}`
		}`;

		const fileIcon = resolveFileIcon(window.activeTextEditor.document);

		const problems = config[CONFIG_KEYS.ShowProblems]
			? config[CONFIG_KEYS.ProblemsText].replace(
					REPLACE_KEYS.ProblemsCount,
					totalProblems.toString()
			  )
			: '';

		raw = config[
			debug.activeDebugSession ? debugging : isViewing ? viewing : editing
		] as string;

		if (workspaceFolder) {
			const { name } = workspaceFolder;
			const relativePath = workspace
				.asRelativePath(window.activeTextEditor.document.fileName)
				.split(sep);

			relativePath.splice(-1, 1);
			raw = raw.replace(
				REPLACE_KEYS.FullDirName,
				`${name}${sep}${relativePath.join(sep)}`
			);
		}

		raw = fileDetails(
			raw,
			window.activeTextEditor.document,
			window.activeTextEditor.selection
		);

		raw = raw
			.replace(REPLACE_KEYS.FileName, fileName)
			.replace(REPLACE_KEYS.DirName, dirName)
			.replace(REPLACE_KEYS.Workspace, workspaceName)
			.replace(REPLACE_KEYS.WorkspaceFolder, workspaceFolderName)
			.replace(REPLACE_KEYS.WorkspaceAndFolder, workspaceAndFolder)
			.replace(REPLACE_KEYS.LanguageLowerCase, toLower(fileIcon))
			.replace(REPLACE_KEYS.LanguageTitleCase, toTitle(fileIcon))
			.replace(REPLACE_KEYS.LanguageUpperCase, toUpper(fileIcon))
			.replace(REPLACE_KEYS.Problems, problems);
	}

	return raw;
}

function fileDetails(
	_raw: string,
	document: TextDocument,
	selection: Selection
) {
	let raw = _raw.slice();

	if (raw.includes(REPLACE_KEYS.TotalLines)) {
		raw = raw.replace(
			REPLACE_KEYS.TotalLines,
			document.lineCount.toLocaleString()
		);
	}

	if (raw.includes(REPLACE_KEYS.CurrentLine)) {
		raw = raw.replace(
			REPLACE_KEYS.CurrentLine,
			(selection.active.line + 1).toLocaleString()
		);
	}

	if (raw.includes(REPLACE_KEYS.CurrentColumn)) {
		raw = raw.replace(
			REPLACE_KEYS.CurrentColumn,
			(selection.active.character + 1).toLocaleString()
		);
	}

	return raw;
}
