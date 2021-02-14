import { ExtensionContext, workspace, window, StatusBarAlignment, StatusBarItem, commands } from 'vscode';
import { Client } from './client';
import { getConfig } from './config';
import { logError, logInfo } from './logger';

const statusBarIcon: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);

statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';

const client: Client = new Client(getConfig(), statusBarIcon);

let loginTimeout: NodeJS.Timer | undefined = undefined;

const extensionName = process.env.EXTENSION_NAME || 'dev.vscord';
const extensionVersion = process.env.EXTENSION_VERSION || '0.0.0';

export const activate = async (ctx: ExtensionContext) => {
	logInfo(`Extension Name: ${extensionName}.`);
	logInfo(`Extension Version: ${extensionVersion}.`);

	const enableCommand = commands.registerCommand('rpc.enable', async () => {
		await client.dispose();

		await getConfig().update('enabled', true);

		client.config = workspace.getConfiguration('VSCord');

		client.statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';
		client.statusBarIcon.show();

		await client.connect();
		await window.showInformationMessage('Enabled Discord Rich Presence for this workspace.');
	});

	const disableCommand = commands.registerCommand('rpc.disable', async () => {
		void getConfig().update('enabled', false);

		client.config = workspace.getConfiguration('rpc');

		await client.dispose();
		client.statusBarIcon.hide();

		await window.showInformationMessage('Disabled Discord Rich Presence for this workspace.');
	});

	const reconnectCommand = commands.registerCommand('rpc.reconnect', async () => {
		if (loginTimeout) {
			clearTimeout(loginTimeout);
		}

		await client.dispose();

		loginTimeout = setTimeout(async () => {
			try {
				await client.connect();
			} catch (error) {
				logError(`Encountered following error after trying to login.`, error);

				await client.dispose();

				await window.showErrorMessage(
					error?.message?.includes('ENOENT')
						? 'No Discord Client detected!'
						: `Couldn't connect to Discord via RPC: ${error as string}`
				);

				client.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
				client.statusBarIcon.command = 'rpc.reconnect';
			}

			// await window.showInformationMessage('Reconnecting to Discord Gateway...');

			// client.statusBarIcon.text = '$(search-refresh) Reconnecting to Discord Gateway...';
			// client.statusBarIcon.command = 'rpc.reconnect';
		}, 1000);
	});

	const disconnectCommand = commands.registerCommand('rpc.disconnect', async () => {
		await client.dispose();

		client.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
		client.statusBarIcon.command = 'rpc.reconnect';
	});

	ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand);

	let isWorkspaceIgnored = false;

	const { ignoreWorkspaces, enabled } = getConfig();

	if (ignoreWorkspaces?.length) {
		for (const pattern of ignoreWorkspaces) {
			const regex = new RegExp(pattern);
			const folders = workspace.workspaceFolders;

			if (!folders) {
				break;
			}

			if (folders.some((folder) => regex.test(folder.uri.fsPath))) {
				isWorkspaceIgnored = true;
				break;
			}
		}
	}

	if (!isWorkspaceIgnored && enabled) {
		statusBarIcon.show();

		try {
			await client.connect();
		} catch (error) {
			logError('Encountered following error after trying to login.', error);

			await client.dispose();

			await window.showErrorMessage(
				error?.message?.includes('ENOENT')
					? 'No Discord Client detected!'
					: `Couldn't connect to Discord via RPC: ${error as string}`
			);

			client.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
			client.statusBarIcon.command = 'rpc.reconnect';
		}
	}
};

export const deactivate = async () => {
	await client.dispose();
};

process.on('unhandledRejection', (err) => logError('Unhandled Rejection:', err as string));
