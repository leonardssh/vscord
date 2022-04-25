import { Presence } from 'discord-rpc';
import { getConfig } from './config';
import { debug, DiagnosticSeverity, env, languages, window, commands, Uri } from 'vscode';
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
import { dataClass } from './data';
import { isObject } from './helpers/isObject';
import { isExcluded } from './helpers/isExcluded';
import {
	getFileIcon,
	resolveFileIcon,
	resolveFileIconByUri,
	toLower,
	toTitle,
	toUpper
} from './helpers/resolveFileIcon';

let totalProblems = 0;

export function onDiagnosticsChange() {
	let counted = 0;
	languages.getDiagnostics().forEach((diagnostic) => {
		if (diagnostic[1]) {
			diagnostic[1].forEach((diagnostic) => {
				if (
					diagnostic.severity === DiagnosticSeverity.Warning ||
					diagnostic.severity === DiagnosticSeverity.Error
				) {
					counted++;
				}
			});
		}
	});

	totalProblems = counted;
}

async function getFileURI() {
	// temporary workaround to get the file URI of the current active CustomTextEditor
	// https://github.com/microsoft/vscode/issues/3553#issuecomment-1098562676

	const origClipboard = await env.clipboard.readText();
	await commands.executeCommand('copyFilePath');
	const filePath = await env.clipboard.readText();
	await env.clipboard.writeText(origClipboard);
	return Uri.file(filePath);
}

export async function activity(previous: Presence = {}, isViewing = false): Promise<Presence> {
	const config = getConfig();
	const { appName } = env;

	const insiders = appName.includes('Insiders');

	const defaultSmallImageKey = debug.activeDebugSession
		? getFileIcon(DEBUGGING_IMAGE_KEY)
		: insiders
		? getFileIcon(VSCODE_INSIDERS_IMAGE_KEY)
		: getFileIcon(VSCODE_IMAGE_KEY);

	const defaultSmallImageText = config[CONFIG_KEYS.SmallImage].replace(
		REPLACE_KEYS.AppName,
		appName
	);

	const defaultLargeImageText = config[CONFIG_KEYS.LargeImageIdling];

	const removeDetails = config[CONFIG_KEYS.RemoveDetails];
	const removeLowerDetails = config[CONFIG_KEYS.RemoveLowerDetails];
	const removeLowerDetailsIdling = config[CONFIG_KEYS.RemoveLowerDetailsIdling];

	const defaultPresence = {
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
		startTimestamp: config[CONFIG_KEYS.RemoveElapsedTime]
			? undefined
			: previous.startTimestamp ?? Date.now(),
		largeImageKey: insiders
			? getFileIcon(IDLE_VSCODE_IMAGE_KEY)
			: getFileIcon(IDLE_VSCODE_INSIDERS_IMAGE_KEY),
		largeImageText: defaultLargeImageText,
		smallImageKey: defaultSmallImageKey,
		smallImageText: defaultSmallImageText
	};

	let presence: Presence = {
		...defaultPresence
	};

	const fileURI = await getFileURI(); // obtain fileURI if CustomTextEditor is used
	dataClass.setFileURI(fileURI);

	const fileIcon = window.activeTextEditor
		? resolveFileIcon(window.activeTextEditor.document)
		: resolveFileIconByUri(fileURI);

	if (!fileIcon) {
		// Return the default presence when file icon is null
		return {
			...defaultPresence
		};
	}

	const largeImageText = config[CONFIG_KEYS.LargeImage]
		.replace(REPLACE_KEYS.LanguageLowerCase, toLower(fileIcon))
		.replace(REPLACE_KEYS.LanguageTitleCase, toTitle(fileIcon))
		.replace(REPLACE_KEYS.LanguageUpperCase, toUpper(fileIcon))
		.padEnd(2, FAKE_EMPTY);

	let isWorkspaceExcluded = false;
	let workspaceExcludedText = 'No workspace ignore text provided.';

	if (dataClass.workspaceFolder && 'uri' in dataClass.workspaceFolder) {
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
			: 'No workspace ignore text provided.';
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
					isViewing,
					fileIcon
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
					isViewing,
					fileIcon
			  ),
		largeImageKey: getFileIcon(fileIcon),
		largeImageText
	};

	if (config[CONFIG_KEYS.ButtonEnabled] && dataClass.gitRemoteUrl) {
		const gitRepo = dataClass.gitRemoteUrl.toString('https').replace(/\.git$/, '');
		const gitOrg = dataClass.gitRemoteUrl.organization ?? dataClass.gitRemoteUrl.owner;

		const isRepositoryExcluded = isExcluded(config[CONFIG_KEYS.IgnoreRepositories], gitRepo);
		const isOrganizationExcluded = isExcluded(config[CONFIG_KEYS.IgnoreOrganizations], gitOrg);

		const isNotExcluded =
			!isRepositoryExcluded && !isWorkspaceExcluded && !isOrganizationExcluded;

		if (gitRepo && config[CONFIG_KEYS.ButtonActiveLabel] && isNotExcluded) {
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

	return presence;
}

function details(
	idling: CONFIG_KEYS,
	viewing: CONFIG_KEYS,
	editing: CONFIG_KEYS,
	debugging: CONFIG_KEYS,
	isViewing: boolean,
	_fileIcon: string | undefined = undefined // idle if undefined
) {
	const config = getConfig();

	let raw = (config[idling] as string).replace(REPLACE_KEYS.Empty, FAKE_EMPTY);

	const workspaceFolderName = dataClass.workspaceFolder
		? dataClass.workspaceFolder.name
		: config[CONFIG_KEYS.LowerDetailsNoWorkspaceFound].replace(REPLACE_KEYS.Empty, FAKE_EMPTY);
	const workspaceName = dataClass.workspace
		? dataClass.workspace.replace(REPLACE_KEYS.VSCodeWorkspace, EMPTY)
		: workspaceFolderName;
	const workspaceAndFolder = `${workspaceName}${
		workspaceFolderName === FAKE_EMPTY ? '' : ` - ${workspaceFolderName}`
	}`;
	const problems = config[CONFIG_KEYS.ShowProblems]
		? config[CONFIG_KEYS.ProblemsText].replace(
				REPLACE_KEYS.ProblemsCount,
				totalProblems.toString()
		  )
		: '';

	if (window.activeTextEditor) {
		const { document, selection } = window.activeTextEditor;
		const fileIcon = resolveFileIcon(document);
		raw = config[debug.activeDebugSession ? debugging : isViewing ? viewing : editing]
			.replace(REPLACE_KEYS.TotalLines, document.lineCount.toLocaleString())
			.replace(REPLACE_KEYS.CurrentLine, (selection.active.line + 1).toLocaleString())
			.replace(REPLACE_KEYS.CurrentColumn, (selection.active.character + 1).toLocaleString())
			.replace(REPLACE_KEYS.FullDirName, dataClass.fullDirName ?? FAKE_EMPTY)
			.replace(REPLACE_KEYS.FileName, dataClass.fileName ?? FAKE_EMPTY)
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
				dataClass.gitRemoteUrl
					? dataClass.gitRemoteUrl.name
					: dataClass.gitRepoName ?? FAKE_EMPTY
			)
			.replace(REPLACE_KEYS.GitBranch, dataClass.gitBranchName ?? FAKE_EMPTY);
	} else if (_fileIcon !== undefined) {
		// since this file is now edited with a CustomTextEditor, the following limitations apply:
		// - unable to distinguish between debugging, viewing or editing -> editing
		// - unable to show TotalLines, CurrentLine and CurrentColumn -> zeroed / emptied

		raw = config[editing]
			.replace(REPLACE_KEYS.TotalLines, FAKE_EMPTY)
			.replace(REPLACE_KEYS.CurrentLine, '0')
			.replace(REPLACE_KEYS.CurrentColumn, '0')
			.replace(REPLACE_KEYS.FullDirName, dataClass.fullDirName ?? FAKE_EMPTY)
			.replace(REPLACE_KEYS.FileName, dataClass.fileName ?? FAKE_EMPTY)
			.replace(REPLACE_KEYS.DirName, dataClass.dirName ?? FAKE_EMPTY)
			.replace(REPLACE_KEYS.Workspace, workspaceName)
			.replace(REPLACE_KEYS.WorkspaceFolder, workspaceFolderName)
			.replace(REPLACE_KEYS.WorkspaceAndFolder, workspaceAndFolder)
			.replace(REPLACE_KEYS.LanguageLowerCase, toLower(_fileIcon))
			.replace(REPLACE_KEYS.LanguageTitleCase, toTitle(_fileIcon))
			.replace(REPLACE_KEYS.LanguageUpperCase, toUpper(_fileIcon))
			.replace(REPLACE_KEYS.Problems, problems)
			.replace(
				REPLACE_KEYS.GitRepo,
				dataClass.gitRemoteUrl
					? dataClass.gitRemoteUrl.name
					: dataClass.gitRepoName ?? FAKE_EMPTY
			)
			.replace(REPLACE_KEYS.GitBranch, dataClass.gitBranchName ?? FAKE_EMPTY);
	}

	return raw;
}
