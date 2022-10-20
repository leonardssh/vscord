import lang from "./data/languages.json";

export const { KNOWN_EXTENSIONS, KNOWN_LANGUAGES } = lang as {
    KNOWN_EXTENSIONS: Record<string, { image: string }>;
    KNOWN_LANGUAGES: { language: string; image: string }[];
};

export const EMPTY = "" as const;
export const FAKE_EMPTY = "\u200b\u200b" as const;

export const IDLE_SMALL_IMAGE_KEY = "idle" as const;
export const IDLE_VSCODE_IMAGE_KEY = "idle-vscode" as const;
export const IDLE_VSCODE_INSIDERS_IMAGE_KEY = "idle-vscode-insiders" as const;
export const DEBUGGING_IMAGE_KEY = "debugging" as const;
export const VSCODE_IMAGE_KEY = "vscode" as const;
export const VSCODE_INSIDERS_IMAGE_KEY = "vscode-insiders" as const;
export const VSCODIUM_IMAGE_KEY = "vscodium" as const;
export const VSCODIUM_INSIDERS_IMAGE_KEY = "vscodium-insiders" as const;

export const CONFIG_KEYS = {
    Enabled: "enabled" as const,
    App: {
        Id: "app.id",
        Name: "app.name"
    } as const,
    Status: {
        Details: {
            Enabled: "status.details.enabled" as const,
            Idle: {
                Enabled: "status.details.idle.enabled" as const
            } as const,
            Text: {
                Idle: "status.details.text.idle" as const,
                Editing: "status.details.text.editing" as const,
                Debugging: "status.details.text.debugging" as const,
                Viewing: "status.details.text.viewing" as const
            } as const
        } as const,
        State: {
            Enabled: "status.state.enabled" as const,
            Idle: {
                Enabled: "status.state.idle.enabled" as const
            } as const,
            Text: {
                Idle: "status.state.text.idle" as const,
                Editing: "status.state.text.editing" as const,
                Debugging: "status.state.text.debugging" as const,
                Viewing: "status.state.text.viewing" as const,
                NoWorkspaceFound: "status.state.text.noWorkspaceFound" as const
            } as const
        } as const,
        Button: {
            Enabled: "status.button.enabled" as const,
            Active: {
                Label: "status.button.active.label" as const,
                Url: "status.button.active.url" as const
            } as const,
            Inactive: {
                Label: "status.button.inactive.label" as const,
                Url: "status.button.inactive.url" as const
            } as const
        } as const,
        Image: {
            BaseLink: "status.image.baseLink" as const,
            Large: {
                Key: "status.image.large.key" as const,
                Text: "status.image.large.text" as const,
                Idle: {
                    Key: "status.image.large.idle.key" as const,
                    Text: "status.image.large.idle.text" as const
                } as const
            } as const,
            Small: {
                Key: "status.image.small.key" as const,
                Text: "status.image.small.text" as const,
                Idle: {
                    Key: "status.image.small.idle.key" as const,
                    Text: "status.image.small.idle.text" as const
                } as const
            } as const
        } as const,
        Problems: {
            Enabled: "status.problems.enabled" as const,
            Text: "status.problems.text" as const
        } as const,
        Idle: {
            Check: "status.idle.check" as const,
            DisconnectOnIdle: "status.idle.disconnectOnIdle" as const,
            ResetElapsedTime: "status.idle.resetElapsedTime" as const,
            Timeout: "status.idle.timeout" as const
        } as const,
        ShowElapsedTime: "status.showElapsedTime" as const
    } as const,
    Ignore: {
        Workspaces: "ignore.workspaces" as const,
        WorkspacesText: "ignore.workspacesText" as const,
        Repositories: "ignore.repositories" as const,
        Organizations: "ignore.organizations" as const,
        GitHosts: "ignore.gitHosts" as const
    } as const,
    File: {
        Size: {
            HumanReadable: "file.size.humanReadable" as const,
            Spec: "file.size.spec" as const,
            Fixed: "file.size.fixed" as const,
            Spacer: "file.size.spacer" as const
        } as const
    } as const,
    Behaviour: {
        AdditionalFileMapping: "behaviour.additionalFileMapping" as const,
        SuppressNotifications: "behaviour.suppressNotifications" as const,
        PrioritizeLanguagesOverExtensions: "behaviour.prioritizeLanguagesOverExtensions" as const,
        Debug: "behaviour.debug" as const
    } as const
} as const;

export const enum REPLACE_KEYS {
    Empty = "{empty}",
    FileName = "{file_name}",
    FileExtension = "{file_extension}",
    DirName = "{dir_name}",
    FullDirName = "{full_dir_name}",
    Workspace = "{workspace}",
    VSCodeWorkspace = "(Workspace)",
    WorkspaceFolder = "{workspace_folder}",
    FolderAndFile = "{folder_and_file}",
    WorkspaceAndFolder = "{workspace_and_folder}",
    LanguageLowerCase = "{lang}",
    LanguageTitleCase = "{Lang}",
    LanguageUpperCase = "{LANG}",
    TotalLines = "{total_lines}",
    CurrentLine = "{current_line}",
    CurrentColumn = "{current_column}",
    AppName = "{app_name}",
    Problems = "{problems}",
    ProblemsCount = "{problemsCount}",
    GitRepo = "{git_repo}",
    GitBranch = "{git_branch}",
    FileSize = "{file_size}",
    LargeImageIcon = "{icon}",
    SmallImageIcon = "{icon}",
    LargeImageIdleIcon = "{idle_icon}",
    SmallImageIdleIcon = "{idle_icon}"
}
