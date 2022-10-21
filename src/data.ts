import type { API as GitApi, GitExtension, Remote, Repository } from "./@types/git";
import { basename, parse, sep } from "node:path";
import { CONFIG_KEYS } from "./constants";
import gitUrlParse from "git-url-parse";
import { getConfig } from "./config";
import { logInfo } from "./logger";
import {
    Disposable,
    EventEmitter,
    Extension,
    extensions,
    window,
    workspace,
    WorkspaceFolder,
    TextEditor
} from "vscode";

interface DisposableLike {
    dispose: () => any;
}

const API_VERSION: Parameters<GitExtension["getAPI"]>["0"] = 1;

export class Data implements DisposableLike {
    protected _repo: Repository | undefined;
    protected _remote: Remote | undefined;

    protected _debug: number;

    private eventEmitter = new EventEmitter<void>();

    private rootListeners: (Disposable | undefined)[] = [];
    private gitExtListeners: (Disposable | undefined)[] = [];
    private gitApiListeners: (Disposable | undefined)[] = [];

    private gitExt: Extension<GitExtension> | undefined;
    private gitApi: GitApi | undefined;

    // TODO: Figure out why this also got set when selecting the terminals
    public editor: TextEditor | undefined;

    public constructor(debugLevel = 0) {
        this._debug = debugLevel;
        this.editor = window.activeTextEditor;
        this.ext();
        this.api(this.gitExt?.exports.enabled || false);
        this.rootListeners.push(
            window.onDidChangeActiveTextEditor(() => {
                this.debug(2, `root(): window.onDidChangeActiveTextEditor`);
                this.editor = window.activeTextEditor;
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

    public get fileName(): string | undefined {
        const _file = this.editor?.document ? parse(this.editor.document.uri.fsPath) : undefined;
        const v = _file ? _file.base : undefined;
        this.debug(4, `fileName(): ${v}`);
        return v;
    }

    public get fileExtension(): string | undefined {
        const _file = this.editor?.document ? parse(this.editor.document.uri.fsPath) : undefined;
        const v = _file ? _file.ext : undefined;
        this.debug(4, `fileExtension(): ${v}`);
        return v;
    }

    public get fileSize(): Promise<number | undefined> {
        return new Promise(async (resolve) => {
            if (!this.editor?.document) return resolve(undefined);

            try {
                const v = await workspace.fs.stat(this.editor.document.uri);
                this.debug(4, `fileSize(): ${v.size}`);
                return resolve(v.size);
            } catch (ignored) {
                return resolve(undefined);
            }
        });
    }

    public get dirName(): string | undefined {
        const _file = this.editor?.document ? parse(this.editor.document.uri.fsPath) : undefined;
        const v = basename(_file?.dir ?? "");
        this.debug(4, `dirName(): ${v}`);
        return v;
    }

    public get folderAndFile(): string | undefined {
        const _file = this.editor?.document ? parse(this.editor.document.uri.fsPath) : undefined;
        const directory = basename(_file?.dir ?? "");
        const file = _file ? _file.base : undefined;

        if (!directory || !this.workspaceFolder?.name || directory === this.workspaceFolder?.name) return file;

        const v = directory + sep + file;
        this.debug(4, `folderAndFile(): ${v}`);
        return v;
    }

    public get fullDirName(): string | undefined {
        const _file = this.editor?.document ? parse(this.editor.document.uri.fsPath) : undefined;
        const v = _file?.dir;
        this.debug(4, `fullDirName(): ${v}`);
        return v;
    }

    public get workspace(): string | undefined {
        const v = workspace.name;
        this.debug(4, `workspace(): ${v}`);
        return v;
    }

    public get workspaceFolder(): WorkspaceFolder | undefined {
        const uri = this.editor?.document ? this.editor.document.uri : undefined;
        let v: WorkspaceFolder | undefined = undefined;
        if (uri) v = workspace.getWorkspaceFolder(uri);

        this.debug(4, `workspaceFolder(): ${uri ? "Found URI" : "No URI"} ${v}`);
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
        if (!v) return;

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
        for (const disposable of disposeOf) disposable?.dispose();
    }

    public onUpdate(listener: () => any): Disposable {
        return this.eventEmitter.event(listener);
    }

    private ext(): void {
        const ext = extensions.getExtension<GitExtension>("vscode.git");
        this.debug(3, `ext(): ${ext ? "Extension" : "undefined"}`);
        // Changed to Extension
        if (ext && !this.gitExt) {
            this.debug(1, `ext(): Changed to Extension`);
            this.gitExt = ext;
            if (this.gitExt.isActive) {
                logInfo("[data.ts] ext(): Git extension is active");
                this.api(this.gitExt.exports.enabled);
                this.gitExtListeners.push(this.gitExt.exports.onDidChangeEnablement((e) => this.api(e)));
            } else {
                logInfo("[data.ts] ext(): activate");
                void ext.activate();
            }
        } else if (!ext && this.gitExt) {
            this.debug(2, "[data.ts] ext(): Changed to undefined");
            this.gitExt = undefined;
            this.api(false);
            this.dispose(1);
        }
    }

    private api(e: boolean): void {
        this.debug(2, `api(): ${e}`);
        if (e) {
            this.gitApi = this.gitExt?.exports.getAPI(API_VERSION);
            this.debug(2, `api(): ${this.gitApi ? "gitApi" : "undefined"}`);
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
                this.debug(1, `listeners(): Open Repo ${e.rootUri.fsPath.split(sep).pop()}`);
                this.updateGit();
            }),
            this.gitApi.onDidCloseRepository((e) => {
                this.debug(1, `listeners(): Open Close ${e.rootUri.fsPath.split(sep).pop()}`);
                this.updateGit();
            }),
            this.gitApi.onDidChangeState((e) => {
                this.debug(1, "listeners(): Change State", e);
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

    private repo(): Repository | undefined {
        if (!this.gitApi) return;

        const repos = this.gitApi.repositories;

        if (this.editor?.document) {
            const _file = parse(this.editor.document.uri.fsPath);
            const testString = _file.dir;
            return (
                repos
                    .filter((v) => v.rootUri.fsPath.length <= testString.length)
                    .filter((v) => v.rootUri.fsPath === testString.substring(0, v.rootUri.fsPath.length))
                    .sort((a, b) => b.rootUri.fsPath.length - a.rootUri.fsPath.length)
                    // get first element
                    .shift()
            );
        }

        this.debug(3, `repo(): no file open`);

        if (!workspace.workspaceFolders) {
            return undefined;
        }

        return workspace.workspaceFolders
            .map((v) => [v])
            .sort((a, b) => a[0].index - b[0].index)
            .shift()
            ?.map((workspace) =>
                repos
                    .filter((v) => v.rootUri.fsPath.length <= workspace.uri.fsPath.length)
                    .filter((v) => v.rootUri.fsPath === workspace.uri.fsPath.substring(0, v.rootUri.fsPath.length))
                    .sort((a, b) => a.rootUri.fsPath.length - b.rootUri.fsPath.length)
                    .shift()
            )
            .shift();
    }

    private remote() {
        const remotes = this._repo?.state.remotes;

        if (!remotes) return;

        return remotes.find((v) => v.name === "origin") ?? remotes[0];
    }

    private debug(level: number, ...message: any) {
        if (this._debug >= level) logInfo("[data.ts]", ...message);
    }
}

export const dataClass = new Data(getConfig().get(CONFIG_KEYS.Behaviour.Debug) ? 100 : 0);
