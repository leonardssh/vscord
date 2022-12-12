import { CONFIG_KEYS, KNOWN_EXTENSIONS, KNOWN_LANGUAGES } from "../constants";
import { type TextDocument } from "vscode";
import { getConfig } from "../config";
import { basename } from "node:path";

export const toLower = <S extends string>(str: S) => str.toLocaleLowerCase() as Lowercase<S>;
export const toUpper = <S extends string>(str: S) => str.toLocaleUpperCase() as Uppercase<S>;
export const toTitle = <S extends string>(str: S) =>
    toLower(str).replace(/^.{1}/, (c) => toUpper(c)) as Capitalize<Lowercase<S>>;

export const resolveLangName = (document: TextDocument): string => {
    const ALL_KNOWN_KNOWN_EXTENSIONS = KNOWN_EXTENSIONS;

    for (const [key, value] of Object.entries(getConfig().get(CONFIG_KEYS.Behaviour.AdditionalFileMapping) ?? {}))
        ALL_KNOWN_KNOWN_EXTENSIONS[key] = { image: value };

    const config = getConfig();
    const filename = basename(document.fileName);
    const findKnownExtension = Object.keys(ALL_KNOWN_KNOWN_EXTENSIONS).find((key) => {
        if (filename.endsWith(key)) return true;

        const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
        if (!match) return false;

        const regex = new RegExp(match[1], match[2]);
        return regex.test(filename);
    });

    const areLanguagesPrioritized = config.get(CONFIG_KEYS.Behaviour.PrioritizeLanguagesOverExtensions);
    const findKnownLanguage = KNOWN_LANGUAGES.find((key) => key.language === document.languageId);

    const knownExtension = findKnownExtension
        ? ALL_KNOWN_KNOWN_EXTENSIONS[findKnownExtension]
        : findKnownLanguage?.image;

    const knownLanguage = findKnownLanguage ? findKnownLanguage.image : knownExtension;
    const fileIcon = areLanguagesPrioritized ? knownLanguage : knownExtension;

    return typeof fileIcon === "string" ? fileIcon : fileIcon?.image ?? "text";
};
