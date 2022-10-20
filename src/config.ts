import { ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";
import filesize from "file-size";

export type FileSizeConfig = Required<Parameters<typeof filesize>["1"]>;
export type FileSizeSpec = Parameters<ReturnType<typeof filesize<NonNullable<FileSizeConfig>>>["human"]>["0"];

export interface ExtenstionConfigTyping {
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
    "status.button.active.enabled": boolean;
    "status.button.active.label": string;
    "status.button.active.url": string;
    "status.button.idle.enabled": boolean;
    "status.button.idle.label": string;
    "status.button.idle.url": string;
    "status.button.inactive.enabled": boolean;
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
    "status.problems.enabled": boolean;
    "status.problems.text": string;
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
}

// Created by hayper1919, you may use it inside your extenstion
export type WorkspaceConfigurationWithType<ConfigTypeMap extends { [key: string]: any }> = {
    /**
     * Return a value from this configuration.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @return The value `section` denotes or `undefined`.
     */
    get<T, S extends keyof ConfigTypeMap>(section: S | string): S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;

    /**
     * Return a value from this configuration.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @param defaultValue A value should be returned when no value could be found, is `undefined`.
     * @return The value `section` denotes or the default.
     */
    get<T, S extends keyof ConfigTypeMap>(
        section: S | string,
        defaultValue: T
    ): S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;

    /**
     * Check if this configuration has a certain value.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @return `true` if the section doesn't resolve to `undefined`.
     */
    has<S extends keyof ConfigTypeMap>(section: S): boolean;

    /**
     * Retrieve all information about a configuration setting. A configuration value
     * often consists of a *default* value, a global or installation-wide value,
     * a workspace-specific value, folder-specific value
     * and language-specific values (if {@link WorkspaceConfiguration} is scoped to a language).
     *
     * Also provides all language ids under which the given configuration setting is defined.
     *
     * *Note:* The configuration name must denote a leaf in the configuration tree
     * (`editor.fontSize` vs `editor`) otherwise no result is returned.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @return Information about a configuration setting or `undefined`.
     */
    inspect<T, S extends keyof ConfigTypeMap>(
        section: S | string
    ):
        | {
              key: string;

              defaultValue?: S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;
              globalValue?: S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;
              workspaceValue?: S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;
              workspaceFolderValue?: S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;

              defaultLanguageValue?: S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;
              globalLanguageValue?: S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;
              workspaceLanguageValue?: S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;
              workspaceFolderLanguageValue?: S extends keyof ConfigTypeMap ? ConfigTypeMap[S] : T;

              languageIds?: string[];
          }
        | undefined;

    /**
     * Update a configuration value. The updated configuration values are persisted.
     *
     * A value can be changed in
     *
     * - {@link ConfigurationTarget.Global Global settings}: Changes the value for all instances of the editor.
     * - {@link ConfigurationTarget.Workspace Workspace settings}: Changes the value for current workspace, if available.
     * - {@link ConfigurationTarget.WorkspaceFolder Workspace folder settings}: Changes the value for settings from one of the {@link workspace.workspaceFolders Workspace Folders} under which the requested resource belongs to.
     * - Language settings: Changes the value for the requested languageId.
     *
     * *Note:* To remove a configuration value use `undefined`, like so: `config.update('somekey', undefined)`
     *
     * @param section Configuration name, supports _dotted_ names.
     * @param value The new value.
     * @param configurationTarget The {@link ConfigurationTarget configuration target} or a boolean value.
     *	- If `true` updates {@link ConfigurationTarget.Global Global settings}.
     *	- If `false` updates {@link ConfigurationTarget.Workspace Workspace settings}.
     *	- If `undefined` or `null` updates to {@link ConfigurationTarget.WorkspaceFolder Workspace folder settings} if configuration is resource specific,
     * 	otherwise to {@link ConfigurationTarget.Workspace Workspace settings}.
     * @param overrideInLanguage Whether to update the value in the scope of requested languageId or not.
     *	- If `true` updates the value under the requested languageId.
     *	- If `undefined` updates the value under the requested languageId only if the configuration is defined for the language.
     * @throws error while updating
     *	- configuration which is not registered.
     *	- window configuration to workspace folder
     *	- configuration to workspace or workspace folder when no workspace is opened.
     *	- configuration to workspace folder when there is no workspace folder settings.
     *	- configuration to workspace folder when {@link WorkspaceConfiguration} is not scoped to a resource.
     */
    update<S extends keyof ExtenstionConfigTyping>(
        section: S | string,
        value: S extends keyof ExtenstionConfigTyping ? ExtenstionConfigTyping[S] : any,
        configurationTarget?: ConfigurationTarget | boolean | null,
        overrideInLanguage?: boolean
    ): Thenable<void>;

    /**
     * Readable dictionary that backs this configuration.
     */
    readonly [key: string]: any;
} & WorkspaceConfiguration;

export type ExtenstionConfiguration = WorkspaceConfigurationWithType<ExtenstionConfigTyping>;

export function getConfig(): ExtenstionConfiguration {
    return workspace.getConfiguration("vscord");
}
