import { defineConfig } from "tsup";

export default defineConfig({
    platform: "node",
    format: "cjs",
    entry: ["src/extension.ts"],
    external: ["vscode"],
    sourcemap: true,
    minify: true,
    dts: true
});
