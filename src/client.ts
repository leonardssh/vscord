/* eslint-disable quote-props */
import { Client as RPC, Presence } from 'discord-rpc';
import type { Disposable, WorkspaceConfiguration, StatusBarItem } from 'vscode';

import { Activity } from './activity';
import { getConfig } from './config';
import { Listener } from './listener';

export class Client implements Disposable {
	private rpc?: RPC;

	private ready?: boolean = false;

	private readonly activity: Activity;

	private readonly listener: Listener;

	public constructor(public config: WorkspaceConfiguration, public statusBarIcon: StatusBarItem) {
		this.activity = new Activity(this);
		this.listener = new Listener(this.activity);
	}

	public async connect() {
		if (this.rpc) {
			await this.dispose();
		}

		this.rpc = new RPC({ transport: 'ipc' });

		this.ready = false;

		this.rpc.once('ready', () => this.handleReady());

		this.rpc.transport.once('close', () => this.handleTransport());

		try {
			const { id, appName } = getConfig();

			const applicationIds = new Map();

			applicationIds.set('Code', '782685898163617802');
			applicationIds.set('Visual Studio Code', '810516608442695700');

			const match = /(Code|Visual Studio Code)/i.exec(appName);

			let clientId = id;

			if (match !== null && applicationIds.has(match[0])) {
				clientId = applicationIds.get(match[0]);
			}

			await this.rpc.login({ clientId });
		} catch (error) {
			throw error;
		}
	}

	public async handleTransport() {
		const { enabled } = getConfig();

		if (!enabled) {
			return;
		}

		await this.dispose();

		this.statusBarIcon.text = '$(search-refresh) Reconnect to Discord Gateway.';
		this.statusBarIcon.command = 'rpc.reconnect';
		this.statusBarIcon.tooltip = '';
	}

	public async handleReady() {
		this.ready = true;

		this.statusBarIcon.text = '$(smiley) Connected to Discord Gateway.';
		this.statusBarIcon.tooltip = 'Connected to Discord Gateway.';

		setTimeout(() => (this.statusBarIcon.text = '$(smiley)'), 5000);

		await this.activity.init();
		this.listener.listen();
	}

	public async setActivity(presence: Presence) {
		if (!this.rpc || !this.ready) {
			return;
		}

		await this.rpc.setActivity(presence).catch(() => this.dispose());
	}

	public async dispose() {
		this.activity.dispose();
		this.listener.dispose();

		if (this.rpc && this.ready) {
			await this.rpc.destroy();
		}

		this.rpc = undefined;
		this.statusBarIcon.tooltip = '';
	}
}

declare module 'discord-rpc' {
	interface Client {
		transport: {
			once(event: 'close', listener: () => void): void;
		};
	}
}
