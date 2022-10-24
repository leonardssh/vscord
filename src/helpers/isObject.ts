export const isObject = (value: unknown): value is object =>
    !!value && typeof value === "object" && !Array.isArray(value);
