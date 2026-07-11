import lang from "./data/languages.json";

export const { KNOWN_EXTENSIONS, KNOWN_LANGUAGES } = lang as {
    KNOWN_EXTENSIONS: Record<string, { image: string }>;
    KNOWN_LANGUAGES: Array<{ language: string; image: string }>;
};

export const EMPTY = "";
export const FAKE_EMPTY = "\u200b\u200b";

export const CONFIG_KEYS = {
    Enable: "enable" as const,
    App: {
        Id: "app.id" as const,
        Name: "app.name" as const,
        PrivacyMode: "app.privacyMode.enable" as const,
        WhitelistEnabled: "app.whitelistEnabled" as const,
        whitelistIsBlacklist: "app.whitelistIsBlacklist" as const,
        Whitelist: "app.whitelist" as const
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
                Viewing: "status.details.text.viewing" as const,
                NotInFile: "status.details.text.notInFile" as const,
                NoWorkspaceText: "status.details.text.noWorkSpaceText" as const,
                Debugging: "status.details.text.debugging" as const
            } as const
        } as const,
        State: {
            Enabled: "status.state.enabled" as const,
            Debugging: {
                Enabled: "status.state.debugging.enabled" as const
            } as const,
            Idle: {
                Enabled: "status.state.idle.enabled" as const
            } as const,
            Text: {
                Idle: "status.state.text.idle" as const,
                Editing: "status.state.text.editing" as const,
                Debugging: "status.state.text.debugging" as const,
                Viewing: "status.state.text.viewing" as const,
                NotInFile: "status.state.text.notInFile" as const,
                NoWorkspaceFound: "status.state.text.noWorkspaceFound" as const
            } as const
        } as const,
        Buttons: {
            Button1: {
                Enabled: "status.buttons.button1.enabled" as const,
                Active: {
                    Enabled: "status.buttons.button1.active.enabled" as const,
                    Label: "status.buttons.button1.active.label" as const,
                    Url: "status.buttons.button1.active.url" as const
                } as const,
                Inactive: {
                    Enabled: "status.buttons.button1.inactive.enabled" as const,
                    Label: "status.buttons.button1.inactive.label" as const,
                    Url: "status.buttons.button1.inactive.url" as const
                } as const,
                Idle: {
                    Enabled: "status.buttons.button1.idle.enabled" as const,
                    Label: "status.buttons.button1.idle.label" as const,
                    Url: "status.buttons.button1.idle.url" as const
                } as const,
                Git: {
                    Active: {
                        Enabled: "status.buttons.button1.git.active.enabled" as const,
                        Label: "status.buttons.button1.git.active.label" as const,
                        Url: "status.buttons.button1.git.active.url" as const
                    } as const,
                    Inactive: {
                        Enabled: "status.buttons.button1.git.inactive.enabled" as const,
                        Label: "status.buttons.button1.git.inactive.label" as const,
                        Url: "status.buttons.button1.git.inactive.url" as const
                    } as const,
                    Idle: {
                        Enabled: "status.buttons.button1.git.idle.enabled" as const,
                        Label: "status.buttons.button1.git.idle.label" as const,
                        Url: "status.buttons.button1.git.idle.url" as const
                    } as const
                } as const
            },
            Button2: {
                Enabled: "status.buttons.button2.enabled" as const,
                Active: {
                    Enabled: "status.buttons.button2.active.enabled" as const,
                    Label: "status.buttons.button2.active.label" as const,
                    Url: "status.buttons.button2.active.url" as const
                } as const,
                Inactive: {
                    Enabled: "status.buttons.button2.inactive.enabled" as const,
                    Label: "status.buttons.button2.inactive.label" as const,
                    Url: "status.buttons.button2.inactive.url" as const
                } as const,
                Idle: {
                    Enabled: "status.buttons.button2.idle.enabled" as const,
                    Label: "status.buttons.button2.idle.label" as const,
                    Url: "status.buttons.button2.idle.url" as const
                } as const,
                Git: {
                    Active: {
                        Enabled: "status.buttons.button2.git.active.enabled" as const,
                        Label: "status.buttons.button2.git.active.label" as const,
                        Url: "status.buttons.button2.git.active.url" as const
                    } as const,
                    Inactive: {
                        Enabled: "status.buttons.button2.git.inactive.enabled" as const,
                        Label: "status.buttons.button2.git.inactive.label" as const,
                        Url: "status.buttons.button2.git.inactive.url" as const
                    } as const,
                    Idle: {
                        Enabled: "status.buttons.button2.git.idle.enabled" as const,
                        Label: "status.buttons.button2.git.idle.label" as const,
                        Url: "status.buttons.button2.git.idle.url" as const
                    } as const
                } as const
            }
        } as const,
        Image: {
            Large: {
                Idle: {
                    Key: "status.image.large.idle.key" as const,
                    Text: "status.image.large.idle.text" as const
                } as const,
                Editing: {
                    Key: "status.image.large.editing.key" as const,
                    Text: "status.image.large.editing.text" as const
                } as const,
                Debugging: {
                    Key: "status.image.large.debugging.key" as const,
                    Text: "status.image.large.debugging.text" as const
                } as const,
                Viewing: {
                    Key: "status.image.large.viewing.key" as const,
                    Text: "status.image.large.viewing.text" as const
                } as const,
                NotInFile: {
                    Key: "status.image.large.notInFile.key" as const,
                    Text: "status.image.large.notInFile.text" as const
                } as const
            } as const,
            Small: {
                Idle: {
                    Key: "status.image.small.idle.key" as const,
                    Text: "status.image.small.idle.text" as const
                } as const,
                Editing: {
                    Key: "status.image.small.editing.key" as const,
                    Text: "status.image.small.editing.text" as const
                } as const,
                Debugging: {
                    Key: "status.image.small.debugging.key" as const,
                    Text: "status.image.small.debugging.text" as const
                } as const,
                Viewing: {
                    Key: "status.image.small.viewing.key" as const,
                    Text: "status.image.small.viewing.text" as const
                } as const,
                NotInFile: {
                    Key: "status.image.small.notInFile.key" as const,
                    Text: "status.image.small.notInFile.text" as const
                } as const
            } as const
        } as const,
        Problems: {
            Enabled: "status.problems.enabled" as const,
            Text: "status.problems.text" as const,
            countedSeverities: "status.problems.countedSeverities" as const
        } as const,
        Idle: {
            Enabled: "status.idle.enabled" as const,
            Check: "status.idle.check" as const,
            DisconnectOnIdle: "status.idle.disconnectOnIdle" as const,
            ResetElapsedTime: "status.idle.resetElapsedTime" as const,
            Timeout: "status.idle.timeout" as const
        } as const,
        Time: {
            Mode: "status.time.mode" as const,
            CustomTimestamp: "status.time.customTimestamp" as const
        } as const,
        ShowElapsedTime: "status.showElapsedTime" as const,
        ResetElapsedTimePerFile: "status.resetElapsedTimePerFile" as const
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
            Standard: "file.size.standard" as const,
            Round: "file.size.round" as const,
            Spacer: "file.size.spacer" as const
        } as const
    } as const,
    Behaviour: {
        AdditionalFileMapping: "behaviour.additionalFileMapping" as const,
        SuppressNotifications: "behaviour.suppressNotifications" as const,
        SuppressRpcCouldNotConnect: "behaviour.suppressRpcCouldNotConnect" as const,
        StatusBarAlignment: "behaviour.statusBarAlignment" as const,
        Debug: "behaviour.debug" as const
    } as const
} as const;
