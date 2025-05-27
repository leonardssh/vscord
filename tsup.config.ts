import { defineConfig } from "tsup";

export default defineConfig({
    platform: "node",
    target: ["node22", "chrome108"],
    format: "cjs",
    entry: ["src/extension.ts"],
    external: ["vscode"],
    sourcemap: true,
    minify: true
});
