import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = import.meta.dirname;
const PACKAGE_JSON = path.join(ROOT, "package.json");
const OUT_FILE = path.join(ROOT, "src", "@types", "configtypes.d.ts");
const OUT_FILE_REL = path.relative(ROOT, OUT_FILE);

const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf8"));
const configurations = pkg.contributes?.configuration ?? [];

function schemaTypeToTs(schema, nesting = 1) {
    if (!schema) return "unknown";

    if (Array.isArray(schema.type)) {
        return schema.type.map((t) => schemaTypeToTs({ type: t })).join(" | ");
    }

    if (schema.enum) {
        return schema.enum.map((v) => JSON.stringify(v)).join(" | ");
    }

    switch (schema.type) {
        case "boolean":
            return "boolean";
        case "string":
            return "string";
        case "number":
            return "number";
        case "array": {
            const itemType = schema.items ? schemaTypeToTs(schema.items) : "unknown";
            const needsParens = itemType.includes("|");
            return needsParens ? `(${itemType})[]` : `${itemType}[]`;
        }
        case "object": {
            if (!schema.additionalProperties && !schema.properties && !schema.propertyNames) {
                return "Record<string, unknown>";
            }
            const spaceZero = "    ".repeat(nesting);
            const space = spaceZero + "    ";
            let obj = "{\n";
            if (schema.additionalProperties) {
                const valueType = schemaTypeToTs(schema.additionalProperties);
                obj += space + `[key: string]: ${valueType};\n`;
            }
            if (schema.properties) {
                for (const prop in schema.properties) {
                    const valueType = schemaTypeToTs(schema.properties[prop], nesting + 1);
                    obj += space + `${prop}: ${valueType};\n`;
                }
            }
            obj += spaceZero + "}";
            return obj;
        }
        default:
            return "unknown";
    }
}

function getDeprecation(schema) {
    if (schema.deprecationMessage) {
        return schema.deprecationMessage;
    }
    if (schema.markdownDeprecationMessage) {
        return schema.markdownDeprecationMessage.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[`#*]/g, "");
    }
    return null;
}

const activeEntries = [];
const deprecatedEntries = [];

for (const block of configurations) {
    const props = block.properties ?? {};
    for (const [key, schema] of Object.entries(props)) {
        const tsType = schemaTypeToTs(schema);
        const deprecation = getDeprecation(schema);

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
// Edit package.json instead and re-run/edit configtypes.js to update
// Generated from package.json contributes.configuration

export type ExtensionConfigGenerated = {
${activeEntries.join("\n")}
};

export type DeprecatedConfigGenerated = {
${deprecatedEntries.join("\n")}
};
`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

if (process.argv.includes("--check")) {
    const existing = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : null;
    if (existing !== output) {
        console.log("%s: OUT OF DATE.", OUT_FILE_REL);
        console.log("Regenerate by running 'node configtypes.js' or edit the generator script.");
        process.exit(1);
    }
    console.log("checked", OUT_FILE_REL);
} else {
    fs.writeFileSync(OUT_FILE, output, "utf8");
    console.log("generated", OUT_FILE_REL);
}
