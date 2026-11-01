import { KNOWN_EXTENSIONS, KNOWN_LANGUAGES } from "../constants";
import { type TextDocument } from "vscode";
import { getConfig } from "../config";
import { basename } from "node:path";

export const toLower = <S extends string>(str: S) => str.toLocaleLowerCase() as Lowercase<S>;
export const toUpper = <S extends string>(str: S) => str.toLocaleUpperCase() as Uppercase<S>;
export const toTitle = <S extends string>(str: S) =>
    toLower(str).replace(/^.{1}/, (c) => toUpper(c)) as Capitalize<Lowercase<S>>;

const objectFindEntryOf = <T extends Record<string, unknown>>(
    v: T,
    predicate: (value: [keyof T, T[keyof T]]) => boolean
): [keyof T, T[keyof T]] | undefined => {
    const entries = Object.entries(v) as [keyof T, T[keyof T]][];

    const foundEntry = entries.find((value) => predicate(value));

    return foundEntry;
};

export const regexFromStr = (str: string): RegExp => {
    const match = /^\/(.+)\/([a-z]*)$/i.exec(str);
    if (match) {
        const [, pattern, flags] = match;
        try {
            return new RegExp(pattern, flags);
        } catch (error) {
            return new RegExp(/(?!)/g);
        }
    }

    const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`${escaped}$`, "i");
};

export const resolveLangName = (document: TextDocument): string => {
    const config = getConfig();

    const ADDITIONAL_FILE_MAPPING = Object.fromEntries(
        Object.entries(config.get("vscord.behaviour.additionalFileMapping")!).map(([key, value]) => [
            key,
            { image: value }
        ])
    );

    const filename = basename(document.fileName);
    const findKnownExtension =
        (objectFindEntryOf(ADDITIONAL_FILE_MAPPING, ([extension]) =>
            regexFromStr(extension.toString()).test(filename)
        ) ?? [undefined, undefined])[1] ??
        (objectFindEntryOf(KNOWN_EXTENSIONS, ([extension]) => regexFromStr(extension).test(filename)) ?? [
            undefined,
            undefined
        ])[1] ??
        KNOWN_LANGUAGES.find((key) => key.language === document.languageId);

    return typeof findKnownExtension === "string" ? findKnownExtension : (findKnownExtension?.image ?? "text");
};

export const getArticle = (word: string): string => {
    const vowels = ["a", "e", "i", "o", "u"];
    return vowels.includes(word.charAt(0).toLowerCase()) ? "an" : "a";
};
