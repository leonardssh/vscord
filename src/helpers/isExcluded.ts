export const isExcluded = (config: string[], toMatch?: string) => {
    if (!config || !toMatch) return false;
    if (!config.length) return false;
    return config.some((pattern) => {
        let regex = new RegExp(pattern, "gm").test(toMatch)
        return regex
    });
};
