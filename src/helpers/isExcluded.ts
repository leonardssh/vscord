// https://stackoverflow.com/a/3561711
const escapeRegex = (text: string) => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

export const isExcluded = (config: string[], toMatch?: string) => {
    if (!config || !toMatch) return false;
    if (!config.length) return false;

    const ignorePattern = config.map(escapeRegex).join("|");
    const regex = new RegExp(ignorePattern, "gm");
    const excluded = regex.test(toMatch);
    return excluded;
};
