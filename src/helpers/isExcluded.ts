export const isExcluded = (config: string[], toMatch?: string) => {
    if (!config || !toMatch) {
        return false;
    }

    if (!config.length) {
        return false;
    }

    const ignorePattern = config.join("|");
    const regex = new RegExp(ignorePattern, "gm");
    const excluded = regex.test(toMatch);
    return excluded;
};
