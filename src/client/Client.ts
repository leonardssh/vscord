import { Client as RPClient } from 'discord-rpc';
import { Disposable, ExtensionContext, WorkspaceConfiguration, StatusBarItem, workspace } from 'vscode';
import Logger from '../structures/Logger';

// eslint-disable-next-line @typescript-eslint/init-declarations
let activityTimer: NodeJS.Timer | undefined;

export default class Client implements Disposable {
	private rpc?: any;

	public constructor(public config: WorkspaceConfiguration, public statusBarIcon: StatusBarItem) {}

	public async connect(ctx?: ExtensionContext) {
		if (this.rpc) {
			await this.dispose();
		}

		Logger.log('Logging into RPC...');

		this.rpc = new RPClient({ transport: 'ipc' });

		this.rpc.once('ready', () => this.ready(ctx));

		this.rpc.transport.once('close', () => {
			if (!this.config.get<boolean>('enabled')) {
				return;
			}

			void this.dispose();

			this.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway.';
			this.statusBarIcon.command = 'rpc.reconnect';
			this.statusBarIcon.tooltip = '';
		});

		try {
			await this.rpc.login({ clientId: this.config.get<string>('id') });
		} catch (error) {
			throw error;
		}
	}

	public ready(_ctx?: ExtensionContext) {
		Logger.log('Successfully connected to Discord Gateway.');

		this.statusBarIcon.text = '$(smiley) Connected to Discord Gateway.';
		this.statusBarIcon.tooltip = 'Connected to Discord Gateway.';

		setTimeout(() => (this.statusBarIcon.text = '$(smiley)'), 5000);

		if (activityTimer) {
			clearInterval(activityTimer);
		}

		this.setActivity();

		activityTimer = setInterval(() => {
			this.config = workspace.getConfiguration('rpc');

			this.setActivity();
		}, 1000);
	}

	public setActivity() {
		if (!this.rpc) {
			return;
		}

		Logger.log('Sending activity to Discord Gateway.');

		this.rpc.setActivity({
			details: 'test',
			state: 'test',
			smallImageKey: 'vscord-logo',
			smallImageText: 'Visual Studio Code',
			largeImageKey: 'vscord-logo',
			largeImageText: 'Visual Studio Code'
		});
	}

	public dispose() {
		if (this.rpc) {
			this.rpc.destroy;
		}

		this.rpc = undefined;
		this.statusBarIcon.tooltip = '';

		if (activityTimer) {
			clearInterval(activityTimer);
		}
	}
}
