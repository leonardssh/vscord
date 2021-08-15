import { workspace } from 'vscode';
import { WorkspaceExtensionConfiguration } from './configuration';

export function getConfig(): WorkspaceExtensionConfiguration {
	return workspace.getConfiguration('rpc') as WorkspaceExtensionConfiguration;
}
