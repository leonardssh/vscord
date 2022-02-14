import { Client, Presence } from 'discord-rpc';
import { logError, logInfo } from './logger';
import {
	commands,
	debug,
	Disposable,
	ExtensionContext,
	languages,
	StatusBarAlignment,
	window,
	WindowState,
	workspace
} from 'vscode';
import { throttle } from './helpers/throttle';
import { activity, onDiagnosticsChange } from './activity';
import { getConfig } from './config';
import { CONFIG_KEYS, IDLE_SMALL_IMAGE_KEY } from './constants';
import { getApplicationId } from './helpers/getApplicationId';
import { dataClass } from './data';
import { getFileIcon } from './helpers/resolveFileIcon';

let state: Presence = {};
let rpc: Client | undefined = undefined;
let listeners: Disposable[] = [];
let idleCheckTimeout: NodeJS.Timer | undefined = undefined;
let timeout: NodeJS.Timeout | undefined = undefined;

const statusBarIcon = window.createStatusBarItem(StatusBarAlignment.Left);
statusBarIcon.text = '$(pulse) Connecting to Discord Gateway...';

export const sendActivity = async (isViewing = false) => {
	state = {
		...(await activity(state, isViewing))
	};

	await rpc?.setActivity(state);
};

export const listen = () => {
	const config = getConfig();

	const fileSwitch = window.onDidChangeActiveTextEditor(() => sendActivity(true));
	const fileEdit = workspace.onDidChangeTextDocument(throttle(() => sendActivity(), 2000));
	const debugStart = debug.onDidStartDebugSession(() => sendActivity());
	const debugEnd = debug.onDidTerminateDebugSession(() => sendActivity());
	const diagnosticsChange = languages.onDidChangeDiagnostics(() => onDiagnosticsChange());
	const changeWindowState = window.onDidChangeWindowState((e: WindowState) => toggleIdling(e));
	const gitListener = dataClass.onUpdate(throttle(() => sendActivity(), 2000));

	if (config[CONFIG_KEYS.ShowProblems]) {
		listeners.push(diagnosticsChange);
	}

	if (config[CONFIG_KEYS.CheckIdle]) {
		listeners.push(changeWindowState);
	}

	listeners.push(fileSwitch, fileEdit, debugStart, debugEnd, gitListener);
};

export const cleanUp = () => {
	listeners.forEach((listener) => listener.dispose());
	listeners = [];
};

export const toggleIdling = async (windowState: WindowState) => {
	const config = getConfig();

	if (config[CONFIG_KEYS.IdleTimeout] !== 0) {
		if (windowState.focused) {
			if (idleCheckTimeout) {
				clearTimeout(idleCheckTimeout);
			}

			await sendActivity();
		} else {
			idleCheckTimeout = setTimeout(async () => {
				state = {
					...state,
					smallImageKey: getFileIcon(IDLE_SMALL_IMAGE_KEY),
					smallImageText: config[CONFIG_KEYS.IdleText]
				};

				await rpc?.setActivity(state);
			}, config[CONFIG_KEYS.IdleTimeout] * 1000);
		}
	}
};

export const login = async () => {
	const config = getConfig();

	statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';
	statusBarIcon.tooltip = 'Connecting to Discord Gateway...';

	rpc = new Client({ transport: 'ipc' });

	rpc.on('ready', async () => {
		logInfo('Successfully connected to Discord');
		cleanUp();

		await sendActivity();

		statusBarIcon.text = '$(globe) Connected to Discord';
		statusBarIcon.tooltip = 'Connected to Discord';
		statusBarIcon.show();

		listen();

		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => (statusBarIcon.text = '$(smiley)'), 5000);
	});

	rpc.on('disconnected', () => {
		cleanUp();

		rpc && rpc.destroy();

		statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
		statusBarIcon.command = 'rpc.reconnect';
		statusBarIcon.tooltip = 'Reconnect to Discord Gateway';
		statusBarIcon.show();
	});

	const { clientId } = getApplicationId(config);

	try {
		await rpc.login({ clientId });
		logInfo(`Successfully logged in to Discord with client ID ${clientId}`);
	} catch (error: any) {
		logError(`Encountered following error while trying to login:\n${error as string}`);

		rpc && rpc.destroy();

		logInfo(`[002] Destroyed Discord RPC client`);

		if (!config[CONFIG_KEYS.SuppressNotifications]) {
			error?.message?.includes('ENOENT')
				? void window.showErrorMessage('No Discord client detected')
				: void window.showErrorMessage(
						`Couldn't connect to Discord via RPC: ${error as string}`
				  );
		}

		statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
		statusBarIcon.command = 'rpc.reconnect';
		statusBarIcon.tooltip = 'Reconnect to Discord Gateway';
	}
};

export const registerComamnds = (ctx: ExtensionContext) => {
	const config = getConfig();

	const enable = async (update = true) => {
		if (update) {
			try {
				await config.update('enabled', true);
			} catch {}
		}

		cleanUp();

		statusBarIcon.text = '$(search-refresh) Connecting to Discord Gateway...';
		statusBarIcon.tooltip = 'Connecting to Discord Gateway...';

		await login();
	};

	const disable = async (update = true) => {
		if (update) {
			try {
				await config.update('enabled', false);
			} catch {}
		}

		cleanUp();

		rpc && rpc.destroy();

		logInfo(`[003] Destroyed Discord RPC client`);

		statusBarIcon.hide();
	};

	const enableCommand = commands.registerCommand('rpc.enable', async () => {
		await disable();
		await enable();

		logInfo('Enabled Discord Rich Presence for this workspace.');

		if (!config[CONFIG_KEYS.SuppressNotifications]) {
			await window.showInformationMessage(
				'Enabled Discord Rich Presence for this workspace.'
			);
		}
	});

	const disableCommand = commands.registerCommand('rpc.disable', async () => {
		await disable();

		logInfo('Disabled Discord Rich Presence for this workspace.');

		if (!config[CONFIG_KEYS.SuppressNotifications]) {
			await window.showInformationMessage(
				'Disabled Discord Rich Presence for this workspace.'
			);
		}
	});

	const reconnectCommand = commands.registerCommand('rpc.reconnect', async () => {
		logInfo('Reconnecting to Discord Gateway...');

		await disable(false);
		await enable(false);
	});

	const disconnectCommand = commands.registerCommand('rpc.disconnect', async () => {
		logInfo('Disconnecting from Discord Gateway...');

		await disable(false);

		statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway';
		statusBarIcon.command = 'rpc.reconnect';
		statusBarIcon.tooltip = 'Reconnect to Discord Gateway';
		statusBarIcon.show();
	});

	ctx.subscriptions.push(enableCommand, disableCommand, reconnectCommand, disconnectCommand);

	logInfo('Registered Discord Rich Presence commands');
};

export async function activate(ctx: ExtensionContext) {
	logInfo('Discord Rich Presence for VS Code activated.');

	registerComamnds(ctx);

	try {
		await login();
	} catch (error: any) {
		logError(`Failed to login to Discord: ${error}`);
	}
}

export function deactivate() {
	logInfo('Discord Rich Presence for VS Code deactivated.');

	cleanUp();

	if (timeout) {
		clearTimeout(timeout);
		timeout = undefined;
	}

	if (idleCheckTimeout) {
		clearTimeout(idleCheckTimeout);
		idleCheckTimeout = undefined;
	}

	rpc && rpc.destroy();

	logInfo(`[004] Destroyed Discord RPC client`);
}

declare module 'discord-rpc' {
	interface Client {
		on(event: 'ready' | 'connected' | 'disconnected', listener: () => void): this;
	}
}
