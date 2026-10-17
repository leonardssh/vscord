import lang from "./data/languages.json";

export const { KNOWN_EXTENSIONS, KNOWN_LANGUAGES } = lang as {
    KNOWN_EXTENSIONS: Record<string, { image: string }>;
    KNOWN_LANGUAGES: Array<{ language: string; image: string }>;
};

export const EMPTY = "";
export const FAKE_EMPTY = "\u200b\u200b";
