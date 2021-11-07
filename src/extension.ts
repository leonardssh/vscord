import { Presence } from 'discord-rpc';
import {
	commands,
	ExtensionContext,
	StatusBarAlignment,
	StatusBarItem,
	window,
	WindowState,
	workspace
} from 'vscode';
import { activity, toggleViewing } from './activity';
import { getConfig } from './config';
import { CONFIG_KEYS, IDLE_SMALL_IMAGE_KEY } from './constants';
import { git } from './gitManager';
import { cleanUp, listen } from './listener';
import { logError, logInfo } from './logger';

const { Client } = require('discord-rpc'); // eslint-disable-line

let rpc = new Client({ transport: 'ipc' });
let presence: Presence = {};

let idleCheckTimeout: NodeJS.Timer | undefined = undefined;
let timeout: NodeJS.Timeout | undefined = undefined;

const statusBarIcon: StatusBarItem = window.createStatusBarItem(
	StatusBarAlignment.Left
);

statusBarIcon.text = '$(pulse) Connecting to Discord Gateway...';

interface ActivityOptions {
	isViewing: boolean;
}

export async function sendActivity(options?: ActivityOptions) {
	if (options && 'isViewing' in options) {
		const { isViewing } = options;

		if (isViewing !== undefined) {
			toggleViewing(isViewing);
		}
	}

	presence = {
		...(await activity(presence))
	};

	rpc.setActivity(presence);
}

export function toggleIdling(windowState: WindowState) {
	const config = getConfig();

	if (config[CONFIG_KEYS.IdleTimeout] !== 0) {
		if (windowState.focused) {
			if (idleCheckTimeout) {
				clearTimeout(idleCheckTimeout);
			}

			void sendActivity();
		} else {
			idleCheckTimeout = setTimeout(() => {
				presence = {
					...presence,
					smallImageKey: IDLE_SMALL_IMAGE_KEY,
					smallImageText: config[CONFIG_KEYS.IdleText]
				};

				rpc.setActivity(presence);
			}, config[CONFIG_KEYS.IdleTimeout] * 1000);
		}
	}
}

async function login() {
	const config = getConfig();

	statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';

	rpc = new Client({ transport: 'ipc' });

	rpc.on('ready', handleReady);
	rpc.on('disconnected', handleDisconnected);

	const applicationIds = new Map();

	applicationIds.set('Code', '782685898163617802');
	applicationIds.set('Visual Studio Code', '810516608442695700');

	const match = /(Code|Visual Studio Code)/i.exec(config[CONFIG_KEYS.AppName]);

	let clientId = config[CONFIG_KEYS.Id];

	if (match !== null && applicationIds.has(match[0])) {
		clientId = applicationIds.get(match[0]);
	}

	try {
		await rpc.login({ clientId });
	} catch (error) {
		logError(error);
		cleanUp();

		await rpc.destroy();

		if (!config[CONFIG_KEYS.SuppressNotifications]) {
			error?.message?.includes('ENOENT')
				? void window.showErrorMessage('No Discord client detected')
				: void window.showErrorMessage(
						`Couldn't connect to Discord via RPC: ${error as string}`
				  );
		}

		statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
		statusBarIcon.command = 'rpc.reconnect';
	}
}

const handleReady = () => {
	logInfo('Successfully connected to Discord Gateway');

	statusBarIcon.text = '$(smiley) Connected to Discord Gateway';
	statusBarIcon.tooltip = 'Connected to Discord Gateway.';

	void sendActivity();
	listen();

	if (timeout) {
		clearTimeout(timeout);
	}

	timeout = setTimeout(() => (statusBarIcon.text = '$(smiley)'), 5000);
};

const handleDisconnected = async () => {
	cleanUp();

	await rpc.destroy();

	statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
	statusBarIcon.command = 'rpc.reconnect';
	statusBarIcon.show();
};

const handleCommands = (ctx: ExtensionContext) => {
	const config = getConfig();

	const enable = async (update = true) => {
		if (update) {
			try {
				await config.update('enabled', true);
			} catch {}
		}

		statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';
		statusBarIcon.show();

		cleanUp();
		await login();
	};

	const disable = async (update = true) => {
		if (update) {
			try {
				await config.update('enabled', false);
			} catch {}
		}

		statusBarIcon.hide();

		cleanUp();
		await rpc?.destroy();
	};

	const enableCommand = commands.registerCommand('rpc.enable', async () => {
		await disable();
		await enable();
		await window.showInformationMessage(
			'Enabled Discord Rich Presence for this workspace.'
		);
	});

	const disableCommand = commands.registerCommand('rpc.disable', async () => {
		await disable();
		await window.showInformationMessage(
			'Disabled Discord Rich Presence for this workspace.'
		);
	});

	const reconnectCommand = commands.registerCommand(
		'rpc.reconnect',
		async () => {
			await disable(false);
			await enable(false);
		}
	);

	const disconnectCommand = commands.registerCommand(
		'rpc.disconnect',
		async () => {
			await disable(false);

			statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
			statusBarIcon.command = 'rpc.reconnect';
			statusBarIcon.show();
		}
	);

	ctx.subscriptions.push(
		enableCommand,
		disableCommand,
		reconnectCommand,
		disconnectCommand
	);
};

export async function activate(ctx: ExtensionContext) {
	const config = getConfig();

	logInfo('Initialize the extension...');
	let isWorkspaceExcluded = false;
	for (const pattern of config[CONFIG_KEYS.IgnoreWorkspaces]) {
		const regex = new RegExp(pattern);
		const folders = workspace.workspaceFolders;

		if (!folders) {
			break;
		}

		if (folders.some((folder) => regex.test(folder.uri.fsPath))) {
			isWorkspaceExcluded = true;
			break;
		}
	}

	handleCommands(ctx);

	if (!isWorkspaceExcluded && config[CONFIG_KEYS.Enabled]) {
		statusBarIcon.show();
		await login();
	}
}

export function deactivate() {
	git.dispose();
	cleanUp();
	void rpc.destroy();
}
