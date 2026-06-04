import matchExportParameters from "./rules/matchExportParameters.js";

// Re-exported by name so consumers (e.g. the vite-plugin) can import the rule
// directly off the package entry — `import { matchExportParameters }` — instead
// of reaching into `dist/`. A named export also avoids the default-export interop
// wrapping that esbuild applies when bundling, so it stays a plain typed module.
export { matchExportParameters };

// Exposed as named exports (not just default) so ESLint's eslintrc loader, which
// `require()`s the plugin and reads `.rules`/`.configs` off the module namespace,
// still finds them now that this package is ESM. The default export is kept for
// flat-config / default-import consumers.
export const rules = {
  "match-export-parameters": matchExportParameters,
};

export const configs = {
  recommended: {
    plugins: ["@thirtytech/yasml"],
    parser: "@typescript-eslint/parser",
    parserOptions: { sourceType: "module" },
    rules: {
      "@thirtytech/yasml/match-export-parameters": "warn",
    },
  },
};

export default { rules, configs };
