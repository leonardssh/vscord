//@ts-check

"use strict";

const path = require("node:path");

//@ts-check
/** @typedef {import('@rspack/core').Configuration} RspackConfig **/

/** @type RspackConfig */
const extensionConfig = {
    target: "node", // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, "dist"),
        filename: "extension.js",
        library: {
            type: "commonjs2"
        }
    },
    externals: {
        vscode: "commonjs vscode" // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        // modules added here also need to be added in the .vscodeignore file
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "builtin:swc-loader",
                        options: {
                            jsc: {
                                parser: {
                                    syntax: "typescript"
                                }
                            }
                        }
                    }
                ]
            }
        ]
    },
    devtool: "nosources-source-map",
    infrastructureLogging: {
        level: "log" // enables logging required for problem matchers
    },
    ignoreWarnings: [/bufferutil/, /utf-8-validate/]
};
module.exports = [extensionConfig];
