import { Client as RPClient, Presence } from 'discord-rpc';
import type { Disposable, ExtensionContext, WorkspaceConfiguration, StatusBarItem } from 'vscode';

import Activity from '../structures/Activity';
import { Listener } from '../structures/Listener';
import { getConfig } from '../util/util';

export default class Client implements Disposable {
	private rpc?: any;

	private readonly activity = new Activity(this);

	private readonly listener = new Listener(this.activity);

	public constructor(public config: WorkspaceConfiguration, public statusBarIcon: StatusBarItem) {}

	public async connect(ctx?: ExtensionContext) {
		if (this.rpc) {
			this.dispose();
		}

		this.rpc = new RPClient({ transport: 'ipc' });

		this.rpc.once('ready', () => this.ready(ctx));

		this.rpc.transport.once('close', () => {
			const { enabled } = getConfig();

			if (!enabled) {
				return;
			}

			void this.dispose();

			this.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway.';
			this.statusBarIcon.command = 'rpc.reconnect';
			this.statusBarIcon.tooltip = '';
		});

		try {
			const { id } = getConfig();

			await this.rpc.login({ clientId: id });
		} catch (error) {
			throw error;
		}
	}

	public ready(_ctx?: ExtensionContext) {
		this.statusBarIcon.text = '$(smiley) Connected to Discord Gateway.';
		this.statusBarIcon.tooltip = 'Connected to Discord Gateway.';

		setTimeout(() => (this.statusBarIcon.text = '$(smiley)'), 5000);

		this.activity.init();
		this.listener.listen();
	}

	public setActivity(presence: Presence) {
		if (!this.rpc) {
			return;
		}

		this.rpc.setActivity(presence).catch(() => this.dispose());
	}

	public dispose() {
		this.activity.dispose();
		this.listener.dispose();

		if (this.rpc) {
			this.rpc.destroy();
		}

		this.rpc = undefined;
		this.statusBarIcon.tooltip = '';
	}
}
