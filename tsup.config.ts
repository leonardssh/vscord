import { defineConfig } from "tsup";

export default defineConfig({
    platform: "node",
    target: ["node16", "chrome102"],
    format: "cjs",
    entry: ["src/extension.ts"],
    external: ["vscode"],
    sourcemap: true,
    minify: true
});
