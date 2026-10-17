// AUTO-GENERATED FILE
// DO NOT EDIT MANUALLY
// Edit package.json instead and re-run/edit configtypes.js to update
// Generated from package.json contributes.configuration

export type ExtensionConfigGenerated = {
    "vscord.enable": boolean;
    "vscord.app.name": "Code" | "Visual Studio Code" | "VSCodium" | "Antigravity" | "Cursor" | "Custom";
    "vscord.app.id": string;
    "vscord.app.privacyMode.enable": boolean;
    "vscord.app.whitelistEnabled": boolean;
    "vscord.app.whitelistIsBlacklist": boolean;
    "vscord.app.whitelist": string[];
    "vscord.status.showElapsedTime": boolean;
    "vscord.status.resetElapsedTimePerFile": boolean;
    "vscord.status.problems.enabled": boolean;
    "vscord.status.problems.text": string;
    "vscord.status.problems.countedSeverities": ("error" | "warning" | "info" | "hint")[];
    "vscord.status.idle.check": boolean;
    "vscord.status.idle.enabled": boolean;
    "vscord.status.idle.disconnectOnIdle": boolean;
    "vscord.status.idle.resetElapsedTime": boolean;
    "vscord.status.idle.timeout": number;
    "vscord.ignore.workspaces": string[];
    "vscord.ignore.workspacesText": string | Record<string, unknown>;
    "vscord.ignore.repositories": string[];
    "vscord.ignore.organizations": string[];
    "vscord.ignore.gitHosts": string[];
    "vscord.status.details.enabled": boolean;
    "vscord.status.details.idle.enabled": boolean;
    "vscord.status.details.text.idle": string;
    "vscord.status.details.text.editing": string;
    "vscord.status.details.text.debugging": string;
    "vscord.status.details.text.viewing": string;
    "vscord.status.details.text.notInFile": string;
    "vscord.status.details.text.noWorkSpaceText": string;
    "vscord.status.state.enabled": boolean;
    "vscord.status.state.debugging.enabled": boolean;
    "vscord.status.state.idle.enabled": boolean;
    "vscord.status.state.text.idle": string;
    "vscord.status.state.text.editing": string;
    "vscord.status.state.text.debugging": string;
    "vscord.status.state.text.viewing": string;
    "vscord.status.state.text.notInFile": string;
    "vscord.status.state.text.noWorkspaceFound": string;
    "vscord.status.image.large.idle.key": string;
    "vscord.status.image.large.idle.text": string;
    "vscord.status.image.large.viewing.key": string;
    "vscord.status.image.large.viewing.text": string;
    "vscord.status.image.large.editing.key": string;
    "vscord.status.image.large.editing.text": string;
    "vscord.status.image.large.debugging.key": string;
    "vscord.status.image.large.debugging.text": string;
    "vscord.status.image.large.notInFile.key": string;
    "vscord.status.image.large.notInFile.text": string;
    "vscord.status.image.small.idle.key": string;
    "vscord.status.image.small.idle.text": string;
    "vscord.status.image.small.viewing.key": string;
    "vscord.status.image.small.viewing.text": string;
    "vscord.status.image.small.editing.key": string;
    "vscord.status.image.small.editing.text": string;
    "vscord.status.image.small.debugging.key": string;
    "vscord.status.image.small.debugging.text": string;
    "vscord.status.image.small.notInFile.key": string;
    "vscord.status.image.small.notInFile.text": string;
    "vscord.status.buttons": {
        button1: {
            enabled: boolean;
            active: {
                enabled: boolean;
                label: string;
                url: string;
            };
            inactive: {
                enabled: boolean;
                label: string;
                url: string;
            };
            idle: {
                enabled: boolean;
                label: string;
                url: string;
            };
            git: {
                active: {
                    enabled: boolean;
                    label: string;
                    url: string;
                };
                inactive: {
                    enabled: boolean;
                    label: string;
                    url: string;
                };
                idle: {
                    enabled: boolean;
                    label: string;
                    url: string;
                };
            };
        };
        button2: {
            enabled: boolean;
            active: {
                enabled: boolean;
                label: string;
                url: string;
            };
            inactive: {
                enabled: boolean;
                label: string;
                url: string;
            };
            idle: {
                enabled: boolean;
                label: string;
                url: string;
            };
            git: {
                active: {
                    enabled: boolean;
                    label: string;
                    url: string;
                };
                inactive: {
                    enabled: boolean;
                    label: string;
                    url: string;
                };
                idle: {
                    enabled: boolean;
                    label: string;
                    url: string;
                };
            };
        };
    };
    "vscord.status.buttons.button1.enabled": boolean;
    "vscord.status.buttons.button1.active.enabled": boolean;
    "vscord.status.buttons.button1.active.label": string;
    "vscord.status.buttons.button1.active.url": string;
    "vscord.status.buttons.button1.inactive.enabled": boolean;
    "vscord.status.buttons.button1.inactive.label": string;
    "vscord.status.buttons.button1.inactive.url": string;
    "vscord.status.buttons.button1.idle.enabled": boolean;
    "vscord.status.buttons.button1.idle.label": string;
    "vscord.status.buttons.button1.idle.url": string;
    "vscord.status.buttons.button1.git.active.enabled": boolean;
    "vscord.status.buttons.button1.git.active.label": string;
    "vscord.status.buttons.button1.git.active.url": string;
    "vscord.status.buttons.button1.git.inactive.enabled": boolean;
    "vscord.status.buttons.button1.git.inactive.label": string;
    "vscord.status.buttons.button1.git.inactive.url": string;
    "vscord.status.buttons.button1.git.idle.enabled": boolean;
    "vscord.status.buttons.button1.git.idle.label": string;
    "vscord.status.buttons.button1.git.idle.url": string;
    "vscord.status.buttons.button2.enabled": boolean;
    "vscord.status.buttons.button2.active.enabled": boolean;
    "vscord.status.buttons.button2.active.label": string;
    "vscord.status.buttons.button2.active.url": string;
    "vscord.status.buttons.button2.inactive.enabled": boolean;
    "vscord.status.buttons.button2.inactive.label": string;
    "vscord.status.buttons.button2.inactive.url": string;
    "vscord.status.buttons.button2.idle.enabled": boolean;
    "vscord.status.buttons.button2.idle.label": string;
    "vscord.status.buttons.button2.idle.url": string;
    "vscord.status.buttons.button2.git.active.enabled": boolean;
    "vscord.status.buttons.button2.git.active.label": string;
    "vscord.status.buttons.button2.git.active.url": string;
    "vscord.status.buttons.button2.git.inactive.enabled": boolean;
    "vscord.status.buttons.button2.git.inactive.label": string;
    "vscord.status.buttons.button2.git.inactive.url": string;
    "vscord.status.buttons.button2.git.idle.enabled": boolean;
    "vscord.status.buttons.button2.git.idle.label": string;
    "vscord.status.buttons.button2.git.idle.url": string;
    "vscord.file.size.round": number;
    "vscord.file.size.spacer": string;
    "vscord.behaviour.additionalFileMapping": {
        [key: string]: string;
    };
    "vscord.behaviour.suppressNotifications": boolean;
    "vscord.behaviour.suppressRpcCouldNotConnect": boolean;
    "vscord.behaviour.statusBarAlignment": "Right" | "Left";
    "vscord.file.size.humanReadable": boolean;
    "vscord.file.size.standard": "iec" | "jedec";
    "vscord.behaviour.debug": boolean;
};

export type DeprecatedConfigGenerated = {
    /** @deprecated Use the built-in setting */
    "vscord.enabled": boolean;
    /** @deprecated Deprecated: Please use vscord.app.id instead. */
    "rpc.id": string;
    /** @deprecated Deprecated: Please use vscord.app.name instead. */
    "rpc.appName": string;
    /** @deprecated Deprecated: Please use vscord.enabled instead. */
    "rpc.enabled": boolean;
    /** @deprecated Deprecated: Please use vscord.status.details.text.editing instead. */
    "rpc.detailsEditing": string;
    /** @deprecated Deprecated: Please use vscord.status.details.text.idle instead. */
    "rpc.detailsIdling": string;
    /** @deprecated Deprecated: Please use vscord.status.details.text.debugging instead. */
    "rpc.detailsDebugging": string;
    /** @deprecated Deprecated: Please use vscord.status.details.text.viewing instead. */
    "rpc.detailsViewing": string;
    /** @deprecated Deprecated: Please use vscord.status.state.text.editing instead. */
    "rpc.lowerDetailsEditing": string;
    /** @deprecated Deprecated: Please use vscord.status.state.text.idle instead. */
    "rpc.lowerDetailsIdling": string;
    /** @deprecated Deprecated: Please use vscord.status.state.text.debugging instead. */
    "rpc.lowerDetailsDebugging": string;
    /** @deprecated Deprecated: Please use vscord.status.state.text.viewing instead. */
    "rpc.lowerDetailsViewing": string;
    /** @deprecated Deprecated: Please use vscord.status.state.text.noWorkspaceFound instead. */
    "rpc.lowerDetailsNoWorkspaceFound": string;
    /** @deprecated Deprecated: Please use vscord.status.image instead. */
    "rpc.baseImageLink": string;
    /** @deprecated Deprecated: Please use vscord.status.image instead. */
    "rpc.largeImage": string;
    /** @deprecated Deprecated: Please use vscord.status.image.small.idle.key instead. */
    "rpc.largeImageIdling": string;
    /** @deprecated Deprecated: Please use vscord.status.image.small instead. */
    "rpc.smallImage": string;
    /** @deprecated Deprecated: Please use vscord.status.showElapsedTime instead. */
    "rpc.removeElapsedTime": boolean;
    /** @deprecated Deprecated: Please use vscord.status.details.enabled instead. */
    "rpc.removeDetails": boolean;
    /** @deprecated Deprecated: Please use vscord.status.details instead. */
    "rpc.removeLowerDetails": boolean;
    /** @deprecated Deprecated: Please use vscord.status.details.text.idle instead. */
    "rpc.removeLowerDetailsIdling": boolean;
    /** @deprecated Deprecated: Please use vscord.status.problems.enabled instead. */
    "rpc.showProblems": boolean;
    /** @deprecated Deprecated: Please use vscord.status.problems.text instead. */
    "rpc.problemsText": string;
    /** @deprecated Deprecated: Please use vscord.ignore.workspaces instead. */
    "rpc.ignoreWorkspaces": unknown[];
    /** @deprecated Deprecated: Please use vscord.ignore.workspacesText instead. */
    "rpc.ignoreWorkspacesText": string | Record<string, unknown>;
    /** @deprecated Deprecated: Please use vscord.status.idle.enabled instead. */
    "rpc.checkIdle": boolean;
    /** @deprecated Deprecated: Please use vscord.status.idle.disconnectOnIdle instead. */
    "rpc.disconnectOnIdle": boolean;
    /** @deprecated Deprecated: Please use vscord.status.idle.resetElapsedTime instead. */
    "rpc.resetElapsedTimeAfterIdle": boolean;
    /** @deprecated Deprecated: Please use vscord.status.idle.timeout instead. */
    "rpc.idleTimeout": number;
    /** @deprecated Deprecated: Please use vscord.status.image.small.idle.text instead. */
    "rpc.idleText": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.enabled instead. */
    "rpc.buttonEnabled": boolean;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.active.label instead. */
    "rpc.buttonActiveLabel": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.git.label instead. */
    "vscord.status.button.active.enabled": boolean;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.git.label instead. */
    "vscord.status.button.active.label": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.git.url instead. */
    "vscord.status.button.active.url": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.idle.label instead. */
    "vscord.status.button.idle.enabled": boolean;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.idle.label instead. */
    "vscord.status.button.idle.label": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.idle.url instead. */
    "vscord.status.button.idle.url": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.inactive.label instead. */
    "vscord.status.button.inactive.enabled": boolean;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.inactive.label instead. */
    "vscord.status.button.inactive.label": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.inactive.url instead. */
    "vscord.status.button.inactive.url": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.active.url instead. */
    "rpc.buttonActiveUrl": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.inactive.label instead. */
    "rpc.buttonInactiveLabel": string;
    /** @deprecated Deprecated: Please use vscord.status.buttons.button1.inactive.url instead. */
    "rpc.buttonInactiveUrl": string;
    /** @deprecated Deprecated: Please use vscord.ignore.repositories instead. */
    "rpc.ignoreRepositories": string[];
    /** @deprecated Deprecated: Please use vscord.ignore.organizations instead. */
    "rpc.ignoreOrganizations": string[];
    /** @deprecated Deprecated: Please use vscord.ignore.gitHosts instead. */
    "rpc.ignoreGitHosts": string[];
    /** @deprecated Deprecated: Please use vscord.behaviour.suppressNotifications instead. */
    "rpc.suppressNotifications": boolean;
    /** @deprecated Deprecated */
    "rpc.prioritizeLanguagesOverExtensions": boolean;
    /** @deprecated Deprecated: Please use vscord.behaviour.size.humanReadable instead. */
    "rpc.fileSizeHumanReadable": boolean;
    /** @deprecated Deprecated: Please use vscord.file.size.standard instead. */
    "rpc.fileSizeSpec": "si" | "iec" | "jedec";
    /** @deprecated Deprecated */
    "rpc.fileSizeFixed": number;
    /** @deprecated Deprecated: Please use vscord.file.size.spacer instead. */
    "rpc.fileSizeSpacer": string;
};
