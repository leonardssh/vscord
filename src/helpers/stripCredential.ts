import { URL } from "node:url";

export const stripCredential = (uri: string): string => {
    try {
        const url = new URL(uri);
        url.username = "";
        url.password = "";
        return url.toString();
    } catch (ignored) {
        return uri;
    }
};
