import { WorkspaceConfiguration } from 'vscode';

interface IExtensionConfig {
	id: string;
	enabled: boolean;
	detailsEditing: string;
	detailsIdle: string;
	detailsDebugging: string;
	detailsViewing: string;
	lowerDetailsEditing: string;
	lowerDetailsIdle: string;
	lowerDetailsDebugging: string;
	lowerDetailsViewing: string;
	lowerDetailsNotFound: string;
	largeImage: string;
	largeImageIdle: string;
	smallImage: string;
	workspaceElapsedTime: boolean;
	showProblems: boolean;
	problemsText: string;
	ignoreWorkspaces: string[];
	checkIdle: boolean;
	idleTimeout: number;
	idleText: string;
}

export type VSCordConfig = IExtensionConfig & WorkspaceConfiguration;

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
