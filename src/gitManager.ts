import { parse, ParsedPath, sep } from 'path';
import { Disposable, Extension, extensions } from 'vscode';
import { API, GitExtension } from './git';
import { logError, logInfo } from './logger';
import gitUrlParse from 'git-url-parse';

const API_VERSION: Parameters<GitExtension['getAPI']>['0'] = 1;

interface DisposableLike {
	dispose: () => any;
}

setTimeout(tests, 10000);
function tests() {
	const path = parse('/home/user/workspace/hello-latex/main.tex');
	logInfo(`getBranchName: ${git.getBranchName(path)}`);
	logInfo(`getRemoteURL: ${git.getRemoteURL(path)}`);
	logInfo(`getRemoteName: ${git.getRemoteName(path)}`);
	logInfo(`getRepoLocation: ${git.getRepoLocation(path)}`);
	logInfo(`getRepoFolderName: ${git.getRepoFolderName(path)}`);
}

class GitManager implements DisposableLike {
	private extension?: Extension<GitExtension>;
	private _api?: API;

	private extensionListener: Disposable;
	private apiListener: Disposable | undefined;

	public constructor() {
		this.extension = extensions.getExtension<GitExtension>('vscode.git');
		this.onExtensionChange();
		this.extensionListener = extensions.onDidChange(() => {
			this.extension = extensions.getExtension<GitExtension>('vscode.git');
			this.onExtensionChange();
		});
	}

	public dispose() {
		this.extensionListener.dispose();
		this.apiListener?.dispose();
	}

	public get api(): API | undefined {
		return this._api;
	}

	public getBranchName(path: ParsedPath): string | undefined {
		return this.repo(path)?.state.HEAD?.name;
	}

	public getRemoteURL(path: ParsedPath): gitUrlParse.GitUrl | undefined {
		const remote = this.remote(path);
		const url = remote?.fetchUrl ?? remote?.pushUrl;
		if (!url) {
			return;
		}
		return gitUrlParse(url);
	}

	public getRemoteName(path: ParsedPath): string | undefined {
		return this.remote(path)?.name;
	}

	public getRepoLocation(path: ParsedPath): string | undefined {
		return this.repo(path)?.rootUri.path;
	}

	public getRepoFolderName(path: ParsedPath): string | undefined {
		return this.repo(path)?.rootUri.path.split(sep).pop();
	}

	private repo(path: ParsedPath) {
		if (!this.api) {
			return;
		}
		const path_seg = path.dir.split(sep);
		const repos = this.api.repositories;
		let matched;
		let match_lenght = 0;
		for (const repo of repos) {
			const rep_seg = repo.rootUri.fsPath.split(sep);
			if (path_seg.length >= rep_seg.length) {
				if (rep_seg.every((v, i) => v === path_seg[i])) {
					if (match_lenght < rep_seg.length) {
						match_lenght = rep_seg.length;
						matched = repo;
					}
				}
			}
		}
		return matched;
	}

	private remote(path: ParsedPath) {
		const remotes = this.repo(path)?.state.remotes;
		if (!remotes) {
			return;
		}
		return remotes.find((v) => v.name === 'origin') ?? remotes[0];
	}

	// ------------------------------------------------------------------------

	private onApiChange(enabled: boolean) {
		if (enabled) {
			this._api = this.extension?.exports.getAPI(API_VERSION);
		} else {
			this._api = undefined;
		}
	}

	private onExtensionChange() {
		if (!this.extension) {
			this.apiListener?.dispose();
			this.apiListener = undefined;
			this._api = undefined;
			return;
		}

		if (!this.extension.isActive) {
			logInfo('Git extension not activated, activating...');
			this.extension.activate().then(
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				() => {},
				(error) => {
					logError(
						`Failed to load git extension, is git installed?; ${
							error as string
						}`
					);
				}
			);
			return;
		}

		// API
		this.onApiChange(this.extension.exports.enabled);
		this.apiListener = this.extension.exports.onDidChangeEnablement(
			(enabled) => {
				logInfo(`Git API ${enabled ? 'enabled' : 'disabled'}`);
				this.onApiChange(enabled);
			}
		);
	}
}

export const git = new GitManager();
