import { defineConfig } from "tsup";

export default defineConfig({
    target: "esnext",
    entry: ["src/extension.ts"],
    external: ["vscode"],
    sourcemap: true,
    minify: true
});
