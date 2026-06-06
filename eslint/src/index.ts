import matchExportParameters from "./rules/matchExportParameters.js";

// Re-exported by name so consumers (e.g. the vite-plugin) can import the rule
// directly off the package entry — `import { matchExportParameters }` — instead
// of reaching into `dist/`.
export { matchExportParameters };

// Flat-config plugin object. ESLint 10 removed the legacy eslintrc loader, so we
// ship a single flat plugin: `meta` identifies it for caching/config-inspection,
// `rules` holds the rule, and `configs.recommended` is a flat config block that
// references this same plugin object under its `plugins` key (flat config wants
// the instance, not the old `"@thirtytech/yasml"` string id).
const plugin = {
  meta: { name: "@thirtytech/eslint-plugin-yasml" },
  rules: {
    "match-export-parameters": matchExportParameters,
  },
  // Filled in below — see the self-reference note.
  configs: {} as Record<string, unknown>,
};

// Assigned after `plugin` exists because the preset must point `plugins` at the
// plugin object itself. The rule needs type information, so consumers are
// expected to have typed linting configured (e.g. typescript-eslint's
// `recommendedTypeChecked`); the preset deliberately does not pin a parser so it
// never clobbers the consumer's `languageOptions`.
plugin.configs.recommended = {
  name: "@thirtytech/yasml/recommended",
  plugins: { "@thirtytech/yasml": plugin },
  rules: {
    "@thirtytech/yasml/match-export-parameters": "warn",
  },
};

export const { rules, configs } = plugin;
export default plugin;
