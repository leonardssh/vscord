/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ConfigurationTarget, type WorkspaceConfiguration, workspace } from "vscode";
import type { ExtensionConfigGenerated } from "./@types/configtypes.d.ts";

export type FileSizeStandard = "iec" | "jedec";

// export interface ExtensionConfigurationType was here

// Created by hayper1919, you may use it inside your extension
/**
 * Represents the configuration. It is a merged view of
 *
 * - *Default Settings*
 * - *Global (User) Settings*
 * - *Workspace settings*
 * - *Workspace Folder settings* - From one of the {@link workspace.workspaceFolders Workspace Folders} under which requested resource belongs to.
 * - *Language settings* - Settings defined under requested language.
 *
 * The *effective* value (returned by {@linkcode WorkspaceConfiguration.get get}) is computed by overriding or merging the values in the following order:
 *
 * 1. `defaultValue` (if defined in `package.json` otherwise derived from the value's type)
 * 1. `globalValue` (if defined)
 * 1. `workspaceValue` (if defined)
 * 1. `workspaceFolderValue` (if defined)
 * 1. `defaultLanguageValue` (if defined)
 * 1. `globalLanguageValue` (if defined)
 * 1. `workspaceLanguageValue` (if defined)
 * 1. `workspaceFolderLanguageValue` (if defined)
 *
 * **Note:** Only `object` value types are merged and all other value types are overridden.
 *
 * Example 1: Overriding
 *
 * ```ts
 * defaultValue = 'on';
 * globalValue = 'relative'
 * workspaceFolderValue = 'off'
 * value = 'off'
 * ```
 *
 * Example 2: Language Values
 *
 * ```ts
 * defaultValue = 'on';
 * globalValue = 'relative'
 * workspaceFolderValue = 'off'
 * globalLanguageValue = 'on'
 * value = 'on'
 * ```
 *
 * Example 3: Object Values
 *
 * ```ts
 * defaultValue = { "a": 1, "b": 2 };
 * globalValue = { "b": 3, "c": 4 };
 * value = { "a": 1, "b": 3, "c": 4 };
 * ```
 *
 * *Note:* Workspace and Workspace Folder configurations contains `launch` and `tasks` settings. Their basename will be
 * part of the section identifier. The following snippets shows how to retrieve all configurations
 * from `launch.json`:
 *
 * ```ts
 * // launch.json configuration
 * const config = workspace.getConfiguration('launch', vscode.workspace.workspaceFolders[0].uri);
 *
 * // retrieve values
 * const values = config.get('configurations');
 * ```
 *
 * Refer to [Settings](https://code.visualstudio.com/docs/getstarted/settings) for more information.
 */
export type WorkspaceConfigurationWithType<Configuration extends Record<string, any>> = {
    /**
     * Return a value from this configuration.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @return The value `section` denotes or `undefined`.
     */
    get<T, S extends keyof Configuration | (string & Record<never, never>)>(
        section: S
    ): (S extends keyof Configuration ? Configuration[S] : T) | undefined;

    /**
     * Return a value from this configuration.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @param defaultValue A value should be returned when no value could be found, is `undefined`.
     * @return The value `section` denotes or the default.
     */
    get<
        T,
        S extends keyof Configuration | (string & Record<never, never>),
        R = S extends keyof Configuration ? Configuration[S] : T
    >(
        section: S,
        defaultValue: R
    ): R;

    /**
     * Check if this configuration has a certain value.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @return `true` if the section doesn't resolve to `undefined`.
     */
    has<S extends keyof Configuration | (string & Record<never, never>)>(section: S): boolean;

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
    inspect<
        T,
        S extends keyof Configuration | (string & Record<never, never>),
        R = S extends keyof Configuration ? Configuration[S] : T
    >(
        section: S
    ):
        | {
              key: S;

              defaultValue?: R;
              globalValue?: R;
              workspaceValue?: R;
              workspaceFolderValue?: R;

              defaultLanguageValue?: R;
              globalLanguageValue?: R;
              workspaceLanguageValue?: R;
              workspaceFolderLanguageValue?: R;

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
    update<S extends keyof Configuration | (string & Record<never, never>)>(
        section: S,
        value: S extends keyof Configuration ? Configuration[S] : unknown,
        configurationTarget?: ConfigurationTarget | boolean | null,
        overrideInLanguage?: boolean
    ): Thenable<void>;

    /**
     * Readable dictionary that backs this configuration.
     */
    readonly [key: string]: any;
} & WorkspaceConfiguration;

export type ExtensionConfiguration = WorkspaceConfigurationWithType<ExtensionConfigGenerated>;

export const getConfig = () => workspace.getConfiguration() as ExtensionConfiguration;
