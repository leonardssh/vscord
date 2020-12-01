import Client from './client/Client';
import Logger from './structures/Logger';

import { ExtensionContext, workspace, window, StatusBarAlignment, StatusBarItem, commands } from 'vscode';

const config = workspace.getConfiguration('VSCord');

const statusBarIcon: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);

statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';

const client: Client = new Client(config, statusBarIcon);

// eslint-disable-next-line @typescript-eslint/init-declarations
let loginTimeout: NodeJS.Timer | undefined;

export const activate = async (ctx: ExtensionContext) => {
	Logger.log('Extension activated, trying to connect to Discord Gateway.');

	const enableCommand = commands.registerCommand('rpc.enable', () => {
		client.dispose();

		void config.update('enabled', true);

		client.config = workspace.getConfiguration('VSCord');

		client.statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';
		client.statusBarIcon.show();

		void client.connect();
		void window.showInformationMessage('Enabled Discord Rich Presence for this workspace.');
	});

	const disableCommand = commands.registerCommand('rpc.disable', () => {
		void config.update('enabled', false);

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
				Logger.log(`Encountered following error after trying to login:\n${error as string}`);

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

	statusBarIcon.show();

	try {
		await client.connect(ctx);
	} catch (error) {
		Logger.log(`Encountered following error after trying to login:\n${error as string}`);

		client.dispose();

		void window.showErrorMessage(
			error?.message?.includes('ENOENT')
				? 'No Discord Client detected!'
				: `Couldn't connect to Discord via RPC: ${error as string}`
		);

		client.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
		client.statusBarIcon.command = 'rpc.reconnect';
	}
};

export const deactivate = () => {
	Logger.log('Extension deactivated, trying to disconnect from Discord Gateway.');
	client.dispose();
};

process.on('unhandledRejection', (err) => Logger.log(err as string));
