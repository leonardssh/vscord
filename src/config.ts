import { workspace, WorkspaceConfiguration } from "vscode";
import filesize from "file-size";

export type FileSizeConfig = Required<Parameters<typeof filesize>["1"]>;
export type FileSizeSpec = Parameters<ReturnType<typeof filesize<NonNullable<FileSizeConfig>>>["human"]>["0"];

export type WorkspaceExtensionConfiguration = WorkspaceConfiguration & {
    id: string;
    enabled: boolean;
    detailsIdling: string;
    detailsViewing: string;
    detailsEditing: string;
    detailsDebugging: string;
    lowerDetailsIdling: string;
    lowerDetailsViewing: string;
    lowerDetailsEditing: string;
    lowerDetailsDebugging: string;
    lowerDetailsNoWorkspaceFound: string;
    largeImageIdling: string;
    largeImage: string;
    smallImage: string;
    removeElapsedTime: boolean;
    removeDetails: boolean;
    removeLowerDetails: boolean;
    ignoreWorkspaces: string[];
    ignoreWorkspacesText: string | string[];
    idleTimeout: number;
    checkIdle: boolean;
    disconnectOnIdle: boolean;
    resetElapsedTimeAfterIdle: boolean;
    idleText: string;
    appName: string;
    showProblems: boolean;
    problemsText: string;
    buttonEnabled: boolean;
    buttonActiveLabel: string;
    buttonActiveUrl: string;
    buttonInactiveLabel: string;
    buttonInactiveUrl: string;
    ignoreRepositories: string[];
    ignoreOrganizations: string[];
    suppressNotifications: boolean;
    prioritizeLanguagesOverExtensions: boolean;
    fileSizeHumanReadable: boolean;
    fileSizeSpec: FileSizeSpec;
    fileSizeFixed: number;
    fileSizeSpacer: string;
};

export function getConfig(): WorkspaceExtensionConfiguration {
    return workspace.getConfiguration("rpc") as WorkspaceExtensionConfiguration;
}
