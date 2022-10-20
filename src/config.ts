import { workspace, WorkspaceConfiguration } from "vscode";
import filesize from "file-size";

export type FileSizeConfig = Required<Parameters<typeof filesize>["1"]>;
export type FileSizeSpec = Parameters<ReturnType<typeof filesize<NonNullable<FileSizeConfig>>>["human"]>["0"];

export type WorkspaceExtensionConfiguration = WorkspaceConfiguration & {
    enabled: boolean;
    "app.id": string;
    "app.name": "Code" | "Visual Studio Code" | "VSCodium" | "Custom";
    "status.details.enabled": boolean;
    "status.details.idle.enabled": boolean;
    "status.details.text.idle": string;
    "status.details.text.viewing": string;
    "status.details.text.editing": string;
    "status.details.text.debugging": string;
    "status.state.enabled": boolean;
    "status.state.idle.enabled": boolean;
    "status.state.text.idle": string;
    "status.state.text.viewing": string;
    "status.state.text.editing": string;
    "status.state.text.debugging": string;
    "status.state.text.noWorkspaceFound": string;
    "status.button.enabled": boolean;
    "status.button.active.label": string;
    "status.button.active.url": string;
    "status.button.inactive.label": string;
    "status.button.inactive.url": string;
    "status.image.baseLink": boolean;
    "status.image.large.key": string;
    "status.image.large.text": string;
    "status.image.large.idle.key": string;
    "status.image.large.idle.text": string;
    "status.image.small.key": string;
    "status.image.small.text": string;
    "status.image.small.idle.key": string;
    "status.image.small.idle.text": string;
    "status.image.problems.enabled": boolean;
    "status.image.problems.text": string;
    "status.idle.check": boolean;
    "status.idle.disconnectOnIdle": boolean;
    "status.idle.resetElapsedTime": boolean;
    "status.idle.timeout": number;
    "status.showElapsedTime": boolean;
    "ignore.workspaces": string[];
    "ignore.workspacesText": string | Record<string, string>;
    "ignore.repositories": string[];
    "ignore.organizations": string[];
    "ignore.gitHosts": string[];
    "file.size.humanReadable": boolean;
    "file.size.spec": FileSizeSpec;
    "file.size.fixed": number;
    "file.size.spacer": string;
    "behaviour.additionalFileMapping": Record<string, string>;
    "behaviour.suppressNotifications": boolean;
    "behaviour.prioritizeLanguagesOverExtensions": boolean;
    "behaviour.debug": boolean;
};

export function getConfig(): WorkspaceExtensionConfiguration {
    return workspace.getConfiguration("vscord") as WorkspaceExtensionConfiguration;
}
