import matchExportParameters from "./rules/matchExportParameters";

export default {
  rules: {
    "match-export-parameters": matchExportParameters,
  },
  configs: {
    recommended: {
      plugins: ["@thirtytech/yasml"],
      parser: "@typescript-eslint/parser",
      parserOptions: { sourceType: "module" },
      rules: {
        "@thirtytech/yasml/match-export-parameters": "warn",
      },
    },
  },
} as any;
