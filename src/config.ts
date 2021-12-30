import { workspace, WorkspaceConfiguration } from 'vscode';

export type WorkspaceExtensionConfiguration = WorkspaceConfiguration & {
	id: string;
	enabled: boolean;
	detailsIdling: string;
	detailsViewing: string;
	detailsEditing: string;
	detailsDebugging: string;
	lowerDetailsIdling: string;
	lowerDetailsViewing: string;
	lowerDetailsEditing: string;
	lowerDetailsDebugging: string;
	lowerDetailsNoWorkspaceFound: string;
	largeImageIdling: string;
	largeImage: string;
	smallImage: string;
	removeElapsedTime: boolean;
	removeDetails: boolean;
	removeLowerDetails: boolean;
	ignoreWorkspaces: string[];
	ignoreWorkspacesText: string | string[];
	idleTimeout: number;
	checkIdle: boolean;
	idleText: string;
	appName: string;
	showProblems: boolean;
	problemsText: string;
	buttonEnabled: boolean;
	buttonActiveLabel: string;
	buttonInactiveLabel: string;
	buttonInactiveUrl: string;
	ignoreRepositories: string[];
	ignoreOrganizations: string[];
	suppressNotifications: boolean;
};

export function getConfig(): WorkspaceExtensionConfiguration {
	return workspace.getConfiguration('rpc') as WorkspaceExtensionConfiguration;
}
