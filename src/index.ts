import Client from './client/Client';

import { ExtensionContext, workspace, window, StatusBarAlignment, StatusBarItem, commands } from 'vscode';
import { LoggingService } from './structures/LoggingService';
import { getConfig } from './util/util';

const statusBarIcon: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);

statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';

const client: Client = new Client(getConfig(), statusBarIcon);

// eslint-disable-next-line @typescript-eslint/init-declarations
let loginTimeout: NodeJS.Timer | undefined;

const extensionName = process.env.EXTENSION_NAME || 'dev.vscord';
const extensionVersion = process.env.EXTENSION_VERSION || '0.0.0';

const loggingService = new LoggingService();

export const activate = async (ctx: ExtensionContext) => {
	loggingService.logInfo(`Extension Name: ${extensionName}.`);
	loggingService.logInfo(`Extension Version: ${extensionVersion}.`);

	let isWorkspaceIgnored = false;

	const { ignoreWorkspaces } = getConfig();

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

	const enableCommand = commands.registerCommand('rpc.enable', () => {
		client.dispose();

		void getConfig().update('enabled', true);

		client.config = workspace.getConfiguration('VSCord');

		client.statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';
		client.statusBarIcon.show();

		void client.connect();
		void window.showInformationMessage('Enabled Discord Rich Presence for this workspace.');
	});

	const disableCommand = commands.registerCommand('rpc.disable', () => {
		void getConfig().update('enabled', false);

		client.config = workspace.getConfiguration('rpc');

		client.dispose();
		client.statusBarIcon.hide();

		void window.showInformationMessage('Disabled Discord Rich Presence for this workspace.');
	});

	const reconnectCommand = commands.registerCommand('rpc.reconnect', () => {
		if (loginTimeout) {
			clearTimeout(loginTimeout);
		}

		client.dispose();

		loginTimeout = setTimeout(async () => {
			try {
				await client.connect(ctx);
			} catch (error) {
				loggingService.logError(`Encountered following error after trying to login.`, error);

				client.dispose();

				void window.showErrorMessage(
					error?.message?.includes('ENOENT')
						? 'No Discord Client detected!'
						: `Couldn't connect to Discord via RPC: ${error as string}`
				);

				client.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
				client.statusBarIcon.command = 'rpc.reconnect';
			}

			void window.showInformationMessage('Reconnecting to Discord Gateway...');

			client.statusBarIcon.text = '$(search-refresh) Reconnecting to Discord Gateway...';
			client.statusBarIcon.command = 'rpc.reconnect';
		}, 1000);
	});

	const disconnectCommand = commands.registerCommand('rpc.disconnect', () => {
		client.dispose();

		client.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
		client.statusBarIcon.command = 'rpc.reconnect';
	});

	ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand);

	const { enabled } = getConfig();

	if (!isWorkspaceIgnored && enabled) {
		statusBarIcon.show();

		try {
			await client.connect(ctx);
		} catch (error) {
			loggingService.logError('Encountered following error after trying to login.', error);

			client.dispose();

			void window.showErrorMessage(
				error?.message?.includes('ENOENT')
					? 'No Discord Client detected!'
					: `Couldn't connect to Discord via RPC: ${error as string}`
			);

			client.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
			client.statusBarIcon.command = 'rpc.reconnect';
		}
	}
};

export const deactivate = () => {
	client.dispose();
};

process.on('unhandledRejection', (err) => loggingService.logError('Unhandled Rejection:', err as string));
