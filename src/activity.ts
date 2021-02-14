/* eslint-disable prefer-destructuring */
import type { Presence } from 'discord-rpc';
import { basename, parse, sep } from 'path';
import {
	Disposable,
	TextDocumentChangeEvent,
	TextEditor,
	env,
	languages,
	DiagnosticSeverity,
	TextDocument,
	window,
	workspace,
	WindowState,
	ConfigurationChangeEvent,
	commands
} from 'vscode';

import icon from './icons.json';

import type { Client } from './client';
import { getConfig } from './config';

interface FileDetail {
	size?: string;
	totalLines?: string;
	currentLine?: string;
	currentColumn?: string;
}

const knownExtensions: { [key: string]: { image: string } } = icon.knownExtensions;
const knownLanguages: string[] = icon.knownLanguages;

const empty = '\u200b\u200b';

const enum defaultIcons {
	standard_vscode = 'idle-vscode',
	standard_vscode_insiders = 'idle-vscode-insiders',
	idle = 'idle'
}

let idleCheckTimeout: NodeJS.Timer | undefined = undefined;

export function resolveIcon(document: TextDocument) {
	const filename = basename(document.fileName);

	const icon =
		knownExtensions[
			Object.keys(knownExtensions).find((key) => {
				if (filename.endsWith(key)) {
					return true;
				}

				const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
				if (!match) {
					return false;
				}

				const regex = new RegExp(match[1], match[2]);
				return regex.test(filename);
			})!
		] ?? (knownLanguages.includes(document.languageId) ? document.languageId : null);

	return icon ? icon.image ?? icon : 'text';
}

export class Activity implements Disposable {
	private presence: Presence = {};

	private debugging = false;

	private viewing = false;

	private problems = 0;

	public constructor(private readonly client: Client) {}

	public async init() {
		const { workspaceElapsedTime, largeImageIdle, detailsIdle, lowerDetailsIdle, smallImage } = getConfig();

		if (workspaceElapsedTime) {
			this.presence.startTimestamp = Date.now();
		}

		this.presence.details = detailsIdle.replace('{null}', empty);
		this.presence.state = lowerDetailsIdle.replace('{null}', empty);
		this.presence.largeImageKey = env.appName.includes('Insiders')
			? defaultIcons.standard_vscode_insiders
			: defaultIcons.standard_vscode;
		this.presence.largeImageText = largeImageIdle;
		this.presence.smallImageKey = this.debugging
			? 'debug'
			: env.appName.includes('Insiders')
			? 'vscode-insiders'
			: 'vscode';
		this.presence.smallImageText = smallImage.replace('{appname}', env.appName);

		await this.update();
	}

	public async onFileSwitch(editor: TextEditor) {
		let icon: string = env.appName.includes('Insiders')
			? defaultIcons.standard_vscode_insiders
			: defaultIcons.standard_vscode;

		if (editor) {
			icon = resolveIcon(editor.document);
		}

		const { largeImage, largeImageIdle } = getConfig();

		this.viewing = true;

		this.presence.details = this.generateDetails(
			'detailsDebugging',
			'detailsEditing',
			'detailsIdle',
			'detailsViewing',
			icon,
			editor?.document
		);

		this.presence.state = this.generateDetails(
			'lowerDetailsDebugging',
			'lowerDetailsEditing',
			'lowerDetailsIdle',
			'lowerDetailsViewing',
			icon,
			editor?.document
		);
		this.presence.largeImageKey = icon;
		this.presence.largeImageText = editor
			? largeImage
					.replace('{lang}', icon)
					.replace(
						'{Lang}',
						icon.toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())
					)
					.replace('{LANG}', icon.toUpperCase()) || editor?.document.languageId.padEnd(2, '\u200b')
			: largeImageIdle;

		await this.update();
	}

	public async onFileEdit({ document }: TextDocumentChangeEvent) {
		if (!window.activeTextEditor || document.fileName.endsWith('.git') || document.languageId === 'scminput') {
			return;
		}

		const icon = resolveIcon(document);
		const { largeImage } = getConfig();

		this.viewing = false;

		this.presence.details = this.generateDetails(
			'detailsDebugging',
			'detailsEditing',
			'detailsIdle',
			undefined,
			icon,
			document
		);

		this.presence.state = this.generateDetails(
			'lowerDetailsDebugging',
			'lowerDetailsEditing',
			'lowerDetailsIdle',
			undefined,
			icon,
			document
		);
		this.presence.largeImageKey = icon;
		this.presence.largeImageText =
			largeImage
				.replace('{lang}', icon)
				.replace(
					'{Lang}',
					icon.toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())
				)
				.replace('{LANG}', icon.toUpperCase()) || document.languageId.padEnd(2, '\u200b');

		await this.update();
	}

	public async onChangeWindowState({ focused }: WindowState) {
		const { idleTimeout } = getConfig();

		if (focused) {
			if (idleCheckTimeout) {
				clearTimeout(idleCheckTimeout);
			}

			return this.idle(false);
		}

		idleCheckTimeout = setTimeout(async () => {
			await this.idle(true);

			idleCheckTimeout = undefined;
		}, idleTimeout * 1000);
	}

	public toggleDebug() {
		this.debugging = !this.debugging;
	}

	public onDiagnosticsChange() {
		const diag = languages.getDiagnostics();

		let counted = 0;

		diag.forEach((i: any) => {
			if (i[1]) {
				i[1].forEach((i: any) => {
					if (i.severity === DiagnosticSeverity.Warning || i.severity === DiagnosticSeverity.Error) {
						counted++;
					}
				});
			}
		});

		this.problems = counted;
	}

	public async onConfigChange(e: ConfigurationChangeEvent) {
		if (
			e.affectsConfiguration('VSCord.appName') ||
			e.affectsConfiguration('VSCord.ignoreWorkspaces') ||
			e.affectsConfiguration('VSCord.checkIdle') ||
			e.affectsConfiguration('VSCord.id') ||
			e.affectsConfiguration('VSCord.enabled')
		) {
			const reload = await window.showInformationMessage(
				'VSCord extension configuration changes detected.\nPlease reload the Visual Studio code to apply it.',
				'Reload Now'
			);

			if (reload === 'Reload Now') {
				await commands.executeCommand('rpc.reconnect');
			}
		}
	}

	public dispose() {
		this.presence = {};
		this.problems = 0;
		this.viewing = false;
	}

	public async idle(status: boolean) {
		const { smallImage, idleText } = getConfig();

		this.presence.smallImageKey = status
			? defaultIcons.idle
			: this.debugging
			? 'debug'
			: env.appName.includes('Insiders')
			? 'vscode-insiders'
			: 'vscode';
		this.presence.smallImageText = status ? idleText : smallImage.replace('{appname}', env.appName);
		await this.update();
	}

	private generateDetails(
		debugging: string,
		editing: string,
		idling: string,
		viewing: string | undefined,
		largeImageKey: any,
		document?: TextDocument
	) {
		const config = getConfig();

		let raw = config[idling].replace('{null}', empty);
		let filename = null;
		let dirname = null;
		let checkState = false;
		let workspaceName = null;
		let workspaceFolder = null;
		let fullDirname = null;

		if (window.activeTextEditor && document) {
			filename = basename(document.fileName);

			const { dir } = parse(document.fileName);
			const split = dir.split(sep);

			dirname = split[split.length - 1];

			checkState = Boolean(workspace.getWorkspaceFolder(document.uri));
			workspaceName = workspace.name;
			workspaceFolder = checkState ? workspace.getWorkspaceFolder(document.uri) : null;

			if (workspaceFolder) {
				const { name } = workspaceFolder;
				const relativePath = workspace.asRelativePath(document.fileName).split(sep);

				relativePath.splice(-1, 1);
				fullDirname = `${name}${sep}${relativePath.join(sep)}`;
			}

			raw = this.debugging ? (raw = config[debugging]) : (raw = config[editing]);

			if (this.viewing && viewing) {
				raw = config[viewing];
			}

			const { totalLines, size, currentLine, currentColumn } = this.generateFileDetails(raw, document);
			const { showProblems, problemsText, lowerDetailsNotFound } = getConfig();

			const problems = showProblems ? problemsText.replace('{count}', this.problems.toString()) : '';

			raw = raw
				.replace('{null}', empty)
				.replace('{filename}', filename)
				.replace('{dirname}', dirname)
				.replace('{fulldirname}', fullDirname!)
				.replace(
					'{workspace}',
					workspaceName
						? workspaceName
						: checkState && workspaceFolder
						? workspaceFolder.name
						: lowerDetailsNotFound.replace('{null}', empty)
				)
				.replace(
					'{workspaceFolder}',
					checkState && workspaceFolder ? workspaceFolder.name : lowerDetailsNotFound.replace('{null}', empty)
				)
				.replace(
					'{workspaceAndFolder}',
					checkState && workspaceName && workspaceFolder
						? `${workspaceName} - ${workspaceFolder.name}`
						: lowerDetailsNotFound.replace('{null}', empty)
				)
				.replace('{problems}', problems)
				.replace('{lang}', largeImageKey)
				.replace(
					'{Lang}',
					largeImageKey.toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())
				)
				.replace('{LANG}', largeImageKey.toUpperCase());

			if (totalLines) {
				raw = raw.replace('{totallines}', totalLines);
			}

			if (size) {
				raw = raw.replace('{filesize}', size);
			}

			if (currentLine) {
				raw = raw.replace('{currentline}', currentLine);
			}

			if (currentColumn) {
				raw = raw.replace('{currentcolumn}', currentColumn);
			}
		}

		return raw;
	}

	private generateFileDetails(raw: string, document: TextDocument) {
		const fileDetail: FileDetail = {};

		if (!raw) {
			return fileDetail;
		}

		if (window.activeTextEditor) {
			if (raw.includes('{totallines}')) {
				fileDetail.totalLines = document.lineCount.toLocaleString();
			}

			if (raw.includes('{currentline}')) {
				fileDetail.currentLine = (window.activeTextEditor.selection.active.line + 1).toLocaleString();
			}

			if (raw.includes('{currentcolumn}')) {
				fileDetail.currentColumn = (window.activeTextEditor.selection.active.character + 1).toLocaleString();
			}
		}

		return fileDetail;
	}

	private async update() {
		await this.client.setActivity(this.presence);
	}
}
