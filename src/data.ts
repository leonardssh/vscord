import type { API as GitApi, GitExtension, Remote, Repository } from "./@types/git";
import { stripCredential } from "./helpers/stripCredential";
import { basename, parse, sep } from "node:path";
import { CONFIG_KEYS } from "./constants";
import gitUrlParse from "git-url-parse";
import { getConfig } from "./config";
import { logInfo } from "./logger";
import {
    type WorkspaceFolder,
    type TextEditor,
    type Disposable,
    type Extension,
    EventEmitter,
    extensions,
    window,
    workspace
} from "vscode";

const ALLOWED_SCHEME = ["file", "vscode-remote", "untitled", "vsls"];

interface DisposableLike {
    dispose: () => unknown;
}

const API_VERSION: Parameters<GitExtension["getAPI"]>["0"] = 1;

export class Data implements DisposableLike {
    protected _repo: Repository | undefined;
    protected _remote: Remote | undefined;

    protected _debug: boolean;

    private eventEmitter = new EventEmitter<void>();

    private rootListeners: (Disposable | undefined)[] = [];
    private gitExtListeners: (Disposable | undefined)[] = [];
    private gitApiListeners: (Disposable | undefined)[] = [];

    private gitExt: Extension<GitExtension> | undefined;
    private gitApi: GitApi | undefined;

    public editor: TextEditor | undefined;

    public constructor(debug = false) {
        this._debug = debug;
        this.editor = window.activeTextEditor;
        this.ext();
        this.api(this.gitExt?.exports.enabled ?? false);
        this.rootListeners.push(
            // TODO: there's a small delay when switching file, it will fire a event where e will be null, then after a few ms, it will fire again with non-null e, figure out how to work around that
            window.onDidChangeActiveTextEditor((e) => {
                this.debug("root(): window.onDidChangeActiveTextEditor");

                if (e && !ALLOWED_SCHEME.includes(e.document.uri.scheme))
                    return this.debug(
                        `root(): window.onDidChangeActiveTextEditor: got unallowed scheme, got '${e.document.uri.scheme}'`
                    );

                if (e) this.debug(`root(): window.onDidChangeActiveTextEditor: got URI '${e.document.uri.scheme}'`);

                this.editor = e;
            }),
            extensions.onDidChange(() => {
                this.debug("root(): extensions.onDidChange");
                this.ext();
            })
        );
    }

    public get fileName(): string | undefined {
        const _file = this.editor ? parse(this.editor.document.uri.fsPath) : undefined;
        const v = _file ? _file.name : undefined;
        this.debug(`fileName(): ${v ?? ""}`);
        return v;
    }

    public get fileExtension(): string | undefined {
        const _file = this.editor ? parse(this.editor.document.uri.fsPath) : undefined;
        const v = _file ? _file.ext : undefined;
        this.debug(`fileExtension(): ${v ?? ""}`);
        return v;
    }

    public get fileSize(): Promise<number | undefined> {
        return new Promise((resolve) => {
            void (async () => {
                if (!this.editor) return resolve(undefined);

                try {
                    const v = await workspace.fs.stat(this.editor.document.uri);
                    this.debug(`fileSize(): ${v.size}`);
                    return resolve(v.size);
                } catch (ignored) {
                    return resolve(undefined);
                }
            })();
        });
    }

    public get dirName(): string | undefined {
        const _file = this.editor ? parse(this.editor.document.uri.fsPath) : undefined;
        const v = basename(_file?.dir ?? "");
        this.debug(`dirName(): ${v}`);
        return v;
    }

    public get folderAndFile(): string | undefined {
        const _file = this.editor ? parse(this.editor.document.uri.fsPath) : undefined;
        const directory = basename(_file?.dir ?? "");
        const file = _file ? _file.base : undefined;

        if (!directory || !this.workspaceFolder?.name || directory === this.workspaceFolder?.name) return file;

        const v = `${directory}${sep}${file ?? ""}`;
        this.debug(`folderAndFile(): ${v}`);
        return v;
    }

    public get fullDirName(): string | undefined {
        const _file = this.editor ? parse(this.editor.document.uri.fsPath) : undefined;
        const v = _file?.dir;
        this.debug(`fullDirName(): ${v ?? ""}`);
        return v;
    }

    public get workspaceName(): string | undefined {
        let v = workspace.name;

        // TODO: Find a better way to handle this
        if (this.editor?.document.uri.scheme === "vscode-remote") v = v?.replaceAll(/\[(SSH|WSL):.*\]$/gm, "");

        this.debug(`workspaceName(): ${v ?? ""}`);
        return v;
    }

    public get workspaceFolder(): WorkspaceFolder | undefined {
        const uri = this.editor?.document.uri;
        let v: WorkspaceFolder | undefined;
        if (uri) v = workspace.getWorkspaceFolder(uri);

        this.debug(`workspaceFolder(): ${uri ? "Found URI" : "No URI"}`, v);
        return v;
    }

    public get gitRepoPath(): string | undefined {
        const v = this._repo?.rootUri.fsPath;
        this.debug(`gitRepoPath(): ${v ?? ""}`);
        return v;
    }

    public get gitRepoName(): string | undefined {
        const v = this._repo?.rootUri.fsPath.split(sep).pop();
        this.debug(`gitRepoName(): ${v ?? ""}`);
        return v;
    }

    public get gitRemoteName(): string | undefined {
        const v = this.gitRemoteUrl?.name;
        this.debug(`gitRepoName(): ${v ?? ""}`);
        return v;
    }

    public get gitRemoteUrl(): gitUrlParse.GitUrl | undefined {
        const v = stripCredential(this._remote?.fetchUrl ?? this._remote?.pushUrl ?? "");
        this.debug(`gitRemoteUrl(): Url: ${v ?? ""}`);
        if (!v) return;

        return gitUrlParse(v);
    }

    public get gitBranchName(): string | undefined {
        const v = this._repo?.state.HEAD?.name;
        this.debug(`gitBranchName(): ${v ?? ""}`);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onUpdate(listener: () => any): Disposable {
        return this.eventEmitter.event(listener);
    }

    private ext() {
        // Our extension
        this._debug = getConfig().get(CONFIG_KEYS.Behaviour.Debug) ?? false;

        // Git extension
        try {
            const ext = extensions.getExtension<GitExtension>("vscode.git");
            this.debug(`ext(): ${ext ? "Extension" : "undefined"}`);
            if (ext && !this.gitExt) {
                this.debug("ext(): Changed to Extension");
                this.gitExt = ext;
                if (this.gitExt.isActive) {
                    this.debug("[data.ts] ext(): Git extension is active");
                    this.api(this.gitExt.exports.enabled);
                    this.gitExtListeners.push(this.gitExt.exports.onDidChangeEnablement((e) => this.api(e)));
                } else {
                    this.debug("[data.ts] ext(): activate");
                    void ext.activate();
                }
            } else if (!ext && this.gitExt) {
                this.debug("[data.ts] ext(): Changed to undefined");
                this.gitExt = undefined;
                this.api(false);
                this.dispose(1);
            }
        } catch (e) {
            this.debug(`ext(): Git extension not found: ${e}`);
        }
    }

    private api(e: boolean) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.debug(`api(): ${e}`);

        if (e) {
            this.gitApi = this.gitExt?.exports.getAPI(API_VERSION);
            this.debug(`api(): ${this.gitApi ? "gitApi" : "undefined"}`);
            this.listeners();
        } else {
            this.gitApi = undefined;
            this.dispose(2);
        }

        this.updateGit();
    }

    private listeners() {
        if (!this.gitApi) return;

        this.gitApiListeners.push(
            this.gitApi.onDidOpenRepository((e) => {
                this.debug(`listeners(): Open Repo ${e.rootUri.fsPath.split(sep).pop() ?? ""}`);
                this.updateGit();
            }),
            this.gitApi.onDidCloseRepository((e) => {
                this.debug(`listeners(): Open Close ${e.rootUri.fsPath.split(sep).pop() ?? ""}`);
                this.updateGit();
            }),
            this.gitApi.onDidChangeState((e) => {
                this.debug("listeners(): Change State", e);

                this.updateGit();
            })
        );
    }

    private updateGit() {
        this.debug("updateGit()");
        if (!this.gitApi) {
            this._repo = undefined;
            this._remote = undefined;
            this.eventEmitter.fire();
            return;
        }
        this._repo = this.repo();
        this._remote = this.remote();
        this.debug(`updateGit(): repo ${this.gitRepoPath ?? ""}`);
        this.eventEmitter.fire();
    }

    private repo(): Repository | undefined {
        if (!this.gitApi) return;

        const repos = this.gitApi.repositories;

        if (this.editor) {
            const _file = parse(this.editor.document.uri.fsPath);
            const testString = _file.dir;
            return repos
                .filter((v) => v.rootUri.fsPath.length <= testString.length)
                .filter((v) => v.rootUri.fsPath === testString.substring(0, v.rootUri.fsPath.length))
                .sort((a, b) => b.rootUri.fsPath.length - a.rootUri.fsPath.length)
                .shift();
        }

        this.debug("repo(): no file open");

        if (!workspace.workspaceFolders) return undefined;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private debug(...message: any[]) {
        if (!this._debug) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        logInfo("[data.ts]", ...message);
    }
}

export const dataClass = new Data(getConfig().get(CONFIG_KEYS.Behaviour.Debug));
