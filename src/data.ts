import gitUrlParse from 'git-url-parse';
import { parse, ParsedPath, sep } from 'path';
import {
	Disposable,
	EventEmitter,
	Extension,
	extensions,
	window,
	workspace
} from 'vscode';
import { API as GitApi, GitExtension, Remote, Repository } from './git';
import { logInfo } from './logger';

interface DisposableLike {
	dispose: () => any;
}

const API_VERSION: Parameters<GitExtension['getAPI']>['0'] = 1;

export class Data implements DisposableLike {
	protected _file: ParsedPath | undefined;
	protected _repo: Repository | undefined;
	protected _remote: Remote | undefined;

	protected _debug: number;

	private eventEmitter = new EventEmitter<void>();

	private rootListeners: (Disposable | undefined)[] = [];
	private gitExtListeners: (Disposable | undefined)[] = [];
	private gitApiListeners: (Disposable | undefined)[] = [];

	private gitExt: Extension<GitExtension> | undefined;
	private gitApi: GitApi | undefined;

	public constructor(debugLevel = 0) {
		this._debug = debugLevel;
		this._file = window.activeTextEditor
			? parse(window.activeTextEditor.document.fileName)
			: undefined;
		this.ext();
		this.api(this.gitExt?.exports.enabled || false);
		this.rootListeners.push(
			window.onDidChangeActiveTextEditor((e) => {
				this.debug(2, `root(): window.onDidChangeActiveTextEditor`);
				this._file = e ? parse(e.document.fileName) : undefined;
				this.updateGit();
			}),
			workspace.onDidChangeWorkspaceFolders(() => {
				this.debug(2, `root(): workspace.onDidChangeWorkspaceFolders`);
				this.updateGit();
			}),
			extensions.onDidChange(() => {
				this.debug(2, `root(): extensions.onDidChange`);
				this.ext();
			})
		);
	}

	// Getters

	public get fileName(): string | undefined {
		const v = this._file ? this._file.name + this._file.ext : undefined;
		this.debug(4, `fileName(): ${v}`);
		return v;
	}

	public get dirName(): string | undefined {
		const v = this._file?.dir.split(sep).pop();
		this.debug(4, `dirName(): ${v}`);
		return v;
	}

	public get fullDirName(): string | undefined {
		const v = this._file?.dir;
		this.debug(4, `fullDirName(): ${v}`);
		return v;
	}

	public get workspace(): string | undefined {
		const v = workspace.name;
		this.debug(4, `workspace(): ${v}`);
		return v;
	}

	public get workspaceFolder(): string | undefined {
		const uri = window?.activeTextEditor?.document.uri;
		let v: string | undefined = undefined;
		if (uri) {
			v = workspace.getWorkspaceFolder(uri)?.name;
		}
		this.debug(4, `workspaceFolder(): ${uri ? 'Found URI' : 'No URI'} ${v}`);
		return v;
	}

	public get gitRepoPath(): string | undefined {
		const v = this._repo?.rootUri.fsPath;
		this.debug(4, `gitRepoPath(): ${v}`);
		return v;
	}

	public get gitRepoName(): string | undefined {
		const v = this._repo?.rootUri.fsPath.split(sep).pop();
		this.debug(4, `gitRepoName(): ${v}`);
		return v;
	}

	public get gitRemoteName(): string | undefined {
		const v = this.gitRemoteUrl?.name;
		this.debug(4, `gitRepoName(): ${v}`);
		return v;
	}

	public get gitRemoteUrl(): gitUrlParse.GitUrl | undefined {
		const v = this._remote?.fetchUrl ?? this._remote?.pushUrl;
		this.debug(4, `gitRemoteUrl(): Url: ${v}`);
		if (!v) {
			return;
		}
		return gitUrlParse(v);
	}

	public get gitBranchName(): string | undefined {
		const v = this._repo?.state.HEAD?.name;
		this.debug(4, `gitBranchName(): ${v}`);
		return v;
	}

	public dispose(level = 0): void {
		let disposeOf: (Disposable | undefined)[] = [];
		switch (level) {
			case 0:
				this.dispose(1);
				disposeOf = this.rootListeners;
				this.rootListeners = [];
				break;
			case 1:
				this.dispose(2);
				disposeOf = this.gitExtListeners;
				this.gitExtListeners = [];
				break;
			case 2:
				disposeOf = this.gitApiListeners;
				this.gitApiListeners = [];
				break;
		}
		for (const disposable of disposeOf) {
			disposable?.dispose();
		}
	}

	public onUpdate(listener: () => any): Disposable {
		return this.eventEmitter.event(listener);
	}

	/**
	 * Gets called on extensions.onDidChange and initialisaion
	 */
	private ext(): void {
		const ext = extensions.getExtension<GitExtension>('vscode.git');
		this.debug(3, `ext(): ${ext ? 'Extension' : 'undefined'}`);
		// Changed to Extension
		if (ext && !this.gitExt) {
			this.debug(1, `ext(): Changed to Extension`);
			this.gitExt = ext;
			if (this.gitExt.isActive) {
				logInfo(`[data.ts] ext(): Git extension is active`);
				this.api(this.gitExt.exports.enabled);
				this.gitExtListeners.push(
					this.gitExt.exports.onDidChangeEnablement((e) => this.api(e))
				);
			} else {
				logInfo(`[data.ts] ext(): activate`);
				void ext.activate();
			}
		}
		// Changed to undefined
		else if (!ext && this.gitExt) {
			this.debug(2, `[data.ts] ext(): Changed to undefined`);
			this.gitExt = undefined;
			this.api(false);
			this.dispose(1);
		}
	}

	/**
	 * Gets called on Extension<GitExtension>.exports.onDidChangeEnablement and this.ext()
	 */
	private api(e: boolean): void {
		this.debug(2, `api(): ${e}`);
		if (e) {
			this.gitApi = this.gitExt?.exports.getAPI(API_VERSION);
			this.debug(2, `api(): ${this.gitApi ? 'gitApi' : 'undefined'}`);
			this.listeners();
		} else {
			this.gitApi = undefined;
			this.dispose(2);
		}
		this.updateGit();
	}

	private listeners(): void {
		if (!this.gitApi) {
			return;
		}
		this.gitApiListeners.push(
			this.gitApi.onDidOpenRepository((e) => {
				this.debug(
					1,
					`listeners(): Open Repo ${e.rootUri.fsPath.split(sep).pop()}`
				);
				this.updateGit();
			}),
			this.gitApi.onDidCloseRepository((e) => {
				this.debug(
					1,
					`listeners(): Open Close ${e.rootUri.fsPath.split(sep).pop()}`
				);
				this.updateGit();
			}),
			this.gitApi.onDidChangeState((e) => {
				this.debug(1, `listeners(): Change State ${e}`);
				this.updateGit();
			})
		);
	}

	private updateGit(): void {
		this.debug(1, `[data.ts] updateGit()`);
		if (!this.gitApi) {
			this._repo = undefined;
			this._remote = undefined;
			this.eventEmitter.fire();
			return;
		}
		this._repo = this.repo();
		this._remote = this.remote();
		this.debug(2, `updateGit(): repo ${this.gitRepoPath}`);
		this.eventEmitter.fire();
	}

	// Helpers

	private repo(): Repository | undefined {
		if (!this.gitApi) {
			return;
		}

		const repos = this.gitApi.repositories;

		// We don't have to sort and filter anything, if there is only one or non repos loaded in the current workspace.
		if (repos.length < 2) {
			return repos[0] ? repos[0] : undefined;
		}

		this.debug(3, `repo(): repos length grater 1`);

		// If a file is open, return repo most likely containing the open file.
		if (this._file) {
			const testString = this._file.dir;
			return (
				repos
					// filter out paths witch are longer than the file path; they can't by definition include them
					.filter((v) => v.rootUri.fsPath.length <= testString.length)
					// filter out paths wich don't match
					.filter(
						(v) =>
							v.rootUri.fsPath ===
							testString.substring(0, v.rootUri.fsPath.length)
					)
					// sort the results length (longest in front)
					.sort((a, b) => b.rootUri.fsPath.length - a.rootUri.fsPath.length)
					// get first element
					.shift()
			);
		}

		this.debug(3, `repo(): no file open`);

		// else return the repo closesed to the root of the workspace of lowest index
		return (
			workspace.workspaceFolders
				// array wrap to enable sorting by index
				?.map((v) => [v])
				// sorting by workspace index
				.sort((a, b) => a[0].index - b[0].index)
				// get first element (array wraped)
				.shift()

				?.map((workspace) =>
					repos
						// filter out paths witch are longer than the file path; they can't by definition include them
						.filter(
							(v) => v.rootUri.fsPath.length <= workspace.uri.fsPath.length
						)
						// filter out paths wich don't match
						.filter(
							(v) =>
								v.rootUri.fsPath ===
								workspace.uri.fsPath.substring(0, v.rootUri.fsPath.length)
						)
						// sort the results length (shortest in front)
						.sort((a, b) => a.rootUri.fsPath.length - b.rootUri.fsPath.length)
						// get first element
						.shift()
				)
				.shift()
		);
	}

	private remote() {
		const remotes = this._repo?.state.remotes;
		if (!remotes) {
			return;
		}
		return remotes.find((v) => v.name === 'origin') ?? remotes[0];
	}

	private debug(level: number, message: string) {
		if (this._debug >= level) {
			logInfo(`[data.ts] ${message}`);
		}
	}
}

export const dataClass = new Data();
