/* eslint-disable prefer-destructuring */
import LANG from './languages.json';

export const KNOWN_EXTENSIONS: { [key: string]: { image: string } } =
	LANG.KNOWN_EXTENSIONS;

export const KNOWN_LANGUAGES: { language: string; image: string }[] =
	LANG.KNOWN_LANGUAGES;

export const EMPTY = '' as const;
export const FAKE_EMPTY = '\u200b\u200b' as const;

export const IDLE_SMALL_IMAGE_KEY = 'idle' as const;
export const IDLE_VSCODE_IMAGE_KEY = 'idle-vscode' as const;
export const IDLE_VSCODE_INSIDERS_IMAGE_KEY = 'idle-vscode-insiders' as const;
export const DEBUGGING_IMAGE_KEY = 'debugging' as const;
export const VSCODE_IMAGE_KEY = 'vscode' as const;
export const VSCODE_INSIDERS_IMAGE_KEY = 'vscode-insiders' as const;

export const enum CONFIG_KEYS {
	Id = 'id',
	Enabled = 'enabled',
	DetailsIdling = 'detailsIdling',
	DetailsViewing = 'detailsViewing',
	DetailsEditing = 'detailsEditing',
	DetailsDebugging = 'detailsDebugging',
	LowerDetailsIdling = 'lowerDetailsIdling',
	LowerDetailsViewing = 'lowerDetailsViewing',
	LowerDetailsEditing = 'lowerDetailsEditing',
	LowerDetailsDebugging = 'lowerDetailsDebugging',
	LowerDetailsNoWorkspaceFound = 'lowerDetailsNoWorkspaceFound',
	LargeImageIdling = 'largeImageIdling',
	LargeImage = 'largeImage',
	SmallImage = 'smallImage',
	RemoveElapsedTime = 'removeElapsedTime',
	IgnoreWorkspaces = 'ignoreWorkspaces',
	IdleTimeout = 'idleTimeout',
	CheckIdle = 'checkIdle',
	IdleText = 'idleText',
	AppName = 'appName',
	ShowProblems = 'showProblems',
	ProblemsText = 'problemsText',
	ButtonEnabled = 'buttonEnabled',
	ButtonActiveLabel = 'buttonActiveLabel',
	ButtonInactiveLabel = 'buttonInactiveLabel',
	ButtonInactiveUrl = 'buttonInactiveUrl',
	SuppressNotifications = 'suppressNotifications'
}

export const enum REPLACE_KEYS {
	Empty = '{empty}',
	FileName = '{file_name}',
	DirName = '{dir_name}',
	FullDirName = '{full_dir_name}',
	Workspace = '{workspace}',
	VSCodeWorkspace = '(Workspace)',
	WorkspaceFolder = '{workspace_folder}',
	WorkspaceAndFolder = '{workspace_and_folder}',
	LanguageLowerCase = '{lang}',
	LanguageTitleCase = '{Lang}',
	LanguageUpperCase = '{LANG}',
	TotalLines = '{total_lines}',
	CurrentLine = '{current_line}',
	CurrentColumn = '{current_column}',
	AppName = '{app_name}',
	Problems = '{problems}',
	ProblemsCount = '{problemsCount}',
	GitRepo = '{git_repo}',
	GitBranch = '{git_branch}'
}
