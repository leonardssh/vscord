import type { API as GitApi, GitExtension, Remote, Repository } from "./@types/git";
import { stripCredential } from "./helpers/stripCredential";
import { basename, parse, sep } from "node:path";
import gitUrlParse from "git-url-parse";
import { getConfig } from "./config";
import { logInfo } from "./logger";
import {
    type Disposable,
    type Extension,
    type TextEditor,
    type WorkspaceFolder,
    extensions,
    window,
    workspace
} from "vscode";

const ALLOWED_SCHEME = ["file", "vscode-remote", "untitled", "vsls"];
const API_VERSION: Parameters<GitExtension["getAPI"]>["0"] = 1;

function extractRepo(repos: Repository[], comparePath: string): Repository | undefined {
    const filterBySub = repos.filter((v) => {
        const subCompare = comparePath.substring(0, v.rootUri.fsPath.length);
        logInfo(
            `[data.ts] extractRepo(): "${v.rootUri.fsPath}" less than "${comparePath}" and equal to "${subCompare}"`
        );
        const byLen = v.rootUri.fsPath.length <= comparePath.length;
        const byEq = v.rootUri.fsPath === subCompare;
        return byLen && byEq;
    });
    const sortedByLen = filterBySub.sort((a, b) => b.rootUri.fsPath.length - a.rootUri.fsPath.length);
    const repo = sortedByLen.shift();
    return repo;
}

export class Data implements Disposable {
    protected _gitApi: GitApi | undefined;
    protected _repo: Repository | undefined;
    protected _remote: Remote | undefined;

    private rootListeners: Disposable[] = [];
    private gitApiListeners: Disposable[] = [];

    public editor: TextEditor | undefined;

    public constructor() {
        this.editor = window.activeTextEditor;
        this.requireGitApi().then((api) => {
            this._gitApi = api;
            this.updateGitInfo();
        });
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

    #lastValidGitRemoteUrl = "";

    public get gitRemoteUrl(): gitUrlParse.GitUrl | undefined {
        const v = stripCredential(this._remote?.fetchUrl ?? this._remote?.pushUrl ?? "");
        if (!v) return;

        const parsed = gitUrlParse(v);

        if (this.#lastValidGitRemoteUrl !== v) {
            this.#lastValidGitRemoteUrl = v;
            this.debug(`gitRemoteUrl(): Remote: ${this._remote}`);
            this.debug(`gitRemoteUrl(): Url: ${v ?? ""}`);
            logInfo(`gitRemoteUrl(): Parsed: ${JSON.stringify(parsed, null, 2)}`);
        }

        return parsed;
    }

    public get gitBranchName(): string | undefined {
        const v = this._repo?.state.HEAD?.name;
        this.debug(`gitBranchName(): ${v ?? ""}`);
        return v;
    }

    private async requireGit(): Promise<Extension<GitExtension> | undefined> {
        const ext = extensions.getExtension<GitExtension>("vscode.git");
        if (!ext) {
            return;
        }
        await ext.activate();
        return ext;
    }

    private async requireGitApi(): Promise<GitApi | undefined> {
        const ext = await this.requireGit();
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.debug(`requireGitApi(): ${ext}`);

        if (!ext) {
            return;
        }
        const api = ext.exports.getAPI(API_VERSION);
        this.debug(`requireGitApi(): ${api ? "got api" : "no api from ext. ext exists."}`);
        this.gitApiListeners.push(
            api.onDidOpenRepository((e) => {
                this.debug(`listeners(): Open Repo ${e.rootUri.fsPath.split(sep).pop() ?? ""}`);
                this.updateGitInfo();
            }),
            api.onDidCloseRepository((e) => {
                this.debug(`listeners(): Open Close ${e.rootUri.fsPath.split(sep).pop() ?? ""}`);
                this.updateGitInfo();
            }),
            api.onDidChangeState((e) => {
                this.debug("listeners(): Change State", e);
                this.updateGitInfo();
            })
        );
        return api;
    }

    public updateGitInfo() {
        if (!this._gitApi) {
            this._repo = undefined;
            this._remote = undefined;
            this.debug(`updateGitInfo(): repo undefined, no api`);
            return;
        }
        this._repo = this.repo(this._gitApi);
        this._remote = this.remote(this._repo);
        this.debug(`updateGitInfo(): repo ${this.gitRepoPath ?? ""}`);
    }

    private repo(api: GitApi): Repository | undefined {
        const repos = api.repositories;

        if (window.activeTextEditor) {
            const _file = parse(window.activeTextEditor.document.uri.fsPath);
            return extractRepo(repos, _file.dir);
        }

        this.debug("repo(): no file open");

        if (!workspace.workspaceFolders) return undefined;

        return workspace.workspaceFolders
            .map((v) => [v])
            .sort((a, b) => a[0].index - b[0].index)
            .shift()
            ?.map((workspace) => extractRepo(repos, workspace.uri.fsPath))
            .shift();
    }

    private remote(repo?: Repository) {
        const remotes = repo?.state.remotes;

        if (!remotes) return;

        return remotes.find((v) => v.name === "origin") ?? remotes[0];
    }

    public dispose(): void {
        for (const listener of this.gitApiListeners) listener.dispose();
        this.gitApiListeners = [];
        for (const listener of this.rootListeners) listener.dispose();
        this.rootListeners = [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private debug(...message: any[]) {
        if (!getConfig().get("vscord.behaviour.debug")) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        logInfo("[data.ts]", ...message);
    }
}

export const dataClass = new Data();
