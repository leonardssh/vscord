//@ts-check

"use strict";

const path = require("node:path");
const fs = require("node:fs");
const { styleText: c } = require("node:util");

const ROOT = path.join(__dirname, "..");
const PACKAGE_JSON = path.join(ROOT, "package.json");
const OUT_FILE = path.join(ROOT, "src", "@types", "configtypes.d.ts");
const OUT_FILE_REL = path.relative(ROOT, OUT_FILE);

/** @param {{ type?: string | string[], enum?: any[], items?: object, additionalProperties?: object, properties?: Record<string,object>, propertyNames?: object }} schema @param {number} [nesting] @returns {string} */
function schemaTypeToTs(schema, nesting = 1) {
    if (!schema) return "unknown";
    if (Array.isArray(schema.type)) {
        return schema.type.map((t) => schemaTypeToTs({ type: t })).join(" | ");
    }
    if (schema.enum) {
        return schema.enum.map((v) => JSON.stringify(v)).join(" | ");
    }
    switch (schema.type) {
        case "boolean": return "boolean";
        case "string":  return "string";
        case "number":  return "number";
        case "array": {
            const itemType = schema.items ? schemaTypeToTs(/** @type {any} */ (schema.items)) : "unknown";
            return itemType.includes("|") ? `(${itemType})[]` : `${itemType}[]`;
        }
        case "object": {
            if (!schema.additionalProperties && !schema.properties && !schema.propertyNames) {
                return "Record<string, unknown>";
            }
            const spaceZero = "    ".repeat(nesting);
            const space = spaceZero + "    ";
            let obj = "{\n";
            if (schema.additionalProperties) {
                obj += space + `[key: string]: ${schemaTypeToTs(/** @type {any} */ (schema.additionalProperties))};\n`;
            }
            if (schema.properties) {
                for (const prop in schema.properties) {
                    obj += space + `${prop}: ${schemaTypeToTs(/** @type {any} */ (schema.properties[prop]), nesting + 1)};\n`;
                }
            }
            obj += spaceZero + "}";
            return obj;
        }
        default: return "unknown";
    }
}

/** @param {{ deprecationMessage?: string, markdownDeprecationMessage?: string }} schema @returns {string | null} */
function getDeprecation(schema) {
    if (schema.deprecationMessage) return schema.deprecationMessage;
    if (schema.markdownDeprecationMessage) {
        return schema.markdownDeprecationMessage
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/[`#*]/g, "");
    }
    return null;
}

/**@typedef {{ check?: boolean }} ConfigTypesOptions */

/**
 * Generates src/@types/configtypes.d.ts.
 * @param {ConfigTypesOptions} [opts]
 */
function generateConfigTypes(opts = {}) {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf8"));
    const configurations = pkg.contributes?.configuration ?? [];

    const activeEntries = [];
    const deprecatedEntries = [];

    for (const block of configurations) {
        const props = block.properties ?? {};
        for (const [key, schema] of Object.entries(props)) {
            const tsType = schemaTypeToTs(/** @type {any} */ (schema));
            const deprecation = getDeprecation(/** @type {any} */ (schema));
            if (deprecation) {
                deprecatedEntries.push(`    /** @deprecated ${deprecation} */`);
                deprecatedEntries.push(`    ${JSON.stringify(key)}: ${tsType};`);
            } else {
                activeEntries.push(`    ${JSON.stringify(key)}: ${tsType};`);
            }
        }
    }

    const output = `// AUTO-GENERATED FILE
// DO NOT EDIT MANUALLY
// Edit package.json instead and re-run the build to update
// Generated from package.json contributes.configuration

export type ExtensionConfigGenerated = {
${activeEntries.join("\n")}
};

export type DeprecatedConfigGenerated = {
${deprecatedEntries.join("\n")}
};
`;

    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

    if (opts.check) {
        const existing = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : null;
        if (existing !== output) {
            console.log("Checked", OUT_FILE_REL, "and it is", c(["red", "bold"], "out of date."));
            console.log("Regenerate by running 'node --run gen:cfg' or 'node --run compile'.");
            process.exitCode = 1;
        } else {
            console.log("Checked", OUT_FILE_REL, c(["green", "bold"], "successfully"));
        }
    } else {
        fs.writeFileSync(OUT_FILE, output, "utf8");
        console.log("Generated", OUT_FILE_REL, c(["green", "bold"], "successfully"));
    }
}

if (require.main === module) {
    const { parseArgs } = require('node:util');
    const opts = parseArgs({
        options: {
            help: { type: "boolean", short: "h" },
            check: { type: "boolean" },
        }
    }).values;

    if (opts.help) {
        console.log("Usage: node --run gen:cfg -- [options]");
        console.log("");
        console.log("Options:");
        console.log("  --help, -h     Show this help message");
        console.log("  --check        Check if the generated file is up to date");
        console.log("");
        console.log("Examples:");
        console.log("  node generators/configTypes.js");
        console.log("  node --run gen:cfg");
        console.log("  npm run gen:cfg (slower)");
        console.log("");
        console.log("  node generators/configTypes.js --check");
        console.log("  node --run gen:cfg -- --check");
        console.log("  npm run gen:cfg -- --check (slower)");
        process.exit(0);
    }
    generateConfigTypes(opts);
}

/** @type {(opts: ConfigTypesOptions) => import('@rspack/core').RspackPluginInstance} */
module.exports = (opts) => ({
    apply(compiler) {
        compiler.hooks.beforeRun.tap("ConfigTypesPlugin", () => generateConfigTypes(opts));
        compiler.hooks.watchRun.tap("ConfigTypesPlugin", () => generateConfigTypes(opts));
    },
});