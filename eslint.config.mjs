import js from "@eslint/js";
import tseslint from "typescript-eslint";
import yasml from "@thirtytech/eslint-plugin-yasml";

// ESLint 10 flat config. Replaces the old `.eslintrc` + `.eslintignore`, which
// extended "eslint:recommended", the two "@typescript-eslint/recommended*"
// presets, and "plugin:@thirtytech/yasml/recommended". In typescript-eslint v8
// `recommendedTypeChecked` is the superset of recommended + the type-aware rules,
// so it replaces both of the old @typescript-eslint extends.
export default tseslint.config(
  {
    ignores: [
      "dist/",
      "eslint/",
      "codegen/",
      "docs/",
      "storybook-static/",
      // Tooling/config files that live outside the root tsconfig's `include`, so
      // the type-aware project service can't parse them. Not library source.
      ".storybook/",
      "eslint.config.mjs",
      "vite.config.ts",
      "src/vite-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  yasml.configs.recommended
);
