export const isExcluded = (config: string[], toMatch?: string) => {
    console.log('here')
    if (!config || !toMatch) return false;
    console.log('first')
    if (!config.length) return false;
    console.log('after')
    return config.some((pattern) => {
        console.log(pattern)
        let regex = new RegExp(pattern, "gm").test(toMatch)
        console.log('regex', regex)
        console.log('toWatch', toMatch)
        return regex
    });
};
