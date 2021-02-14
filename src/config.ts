import { workspace } from 'vscode';
import type { VSCordConfig } from './types';

export function getConfig(): VSCordConfig {
	return workspace.getConfiguration('VSCord') as any;
}
