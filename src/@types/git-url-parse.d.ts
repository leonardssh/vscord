// Type definitions for git-url-parse 13.1
// Project: https://github.com/IonicaBizau/git-url-parse
// Definitions by: Klaus Meinhardt <https://github.com/ajafff>
// Improved by: xhayper <https://github.com/xhayper>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "git-url-parse" {
    declare namespace gitUrlParse {
        type GitProtocol = "ssh" | "git" | "ftp" | "ftps" | "http" | "https" | (string & Record<never, never>);
        type FilePathType = "raw" | "src" | "blob" | "tree" | "edit" | (string & Record<never, never>);

        interface GitUrl {
            /** An array with the url protocols (usually it has one element). */
            protocols: GitProtocol[];
            /** The domain port. */
            port: number | null;
            /** The url domain (including subdomains). */
            resource: string;
            /** The authentication user (usually for ssh urls). */
            user: string;
            /** The url pathname. */
            pathname: string;
            /** The url hash. */
            hash: string;
            /** The url querystring value. */
            search: string;
            /** The input url. */
            href: string;
            /** The git url protocol. */
            protocol: GitProtocol;
            /** The oauth token (could appear in the https urls). */
            token: string;
            /** The Git provider (e.g. `"github.com"`). */
            source: string;
            /** The repository owner. */
            owner: string;
            /** The repository name. */
            name: string;
            /** The repository ref (e.g., "master" or "dev"). */
            ref: string;
            /** A filepath relative to the repository root. */
            filepath: string;
            /** The type of filepath in the url ("blob" or "tree"). */
            filepathtype: FilePathType;
            /** The owner and name values in the `owner/name` format. */
            full_name: string;
            /** The organization the owner belongs to. This is CloudForge specific. */
            organization: string;
            /** Whether to add the `.git` suffix or not. */
            git_suffix?: boolean | undefined;
            /** A function to stringify the parsed url into another url type.
             * @param type - The type of the stringified url (default `obj.protocol`).
             * @return The stringified url.
             */
            toString(type?: GitProtocol | GitProtocol[]): string;
        }

        /**
         * Stringifies a `GitUrl` object.
         *
         * @param obj - The parsed Git url object.
         * @param type - The type of the stringified url (default `obj.protocol`).
         * @return The stringified url.
         */
        function stringify(obj: GitUrl, type?: GitProtocol | GitProtocol[]): string;
    }

    /**
     * Parses a Git url.
     *
     * @param url - The Git url to parse.
     * @return The `GitUrl` object.
     */
    declare function gitUrlParse(url: string): gitUrlParse.GitUrl;

    export = gitUrlParse;
}
