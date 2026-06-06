import type { PluginOption } from "vite";
import { Linter, type Rule } from "eslint";
import * as parser from "@typescript-eslint/parser";
import { matchExportParameters } from "@thirtytech/eslint-plugin-yasml";

type CodeGeneratorYasmlPluginPatternOptions = {
  patterns?: string[] | RegExp[];
};

export function codeGeneratorYasmlPlugin(
  { patterns }: CodeGeneratorYasmlPluginPatternOptions | undefined = {}
): PluginOption {
  // Flat config (ESLint 9+/10). ESLint 10 removed the eslintrc Linter along with
  // `defineRule`/`defineParser`, so the rule, parser, and options are all passed
  // inline in the flat config object handed to `verifyAndFix` instead.
  const linter = new Linter({ cwd: process.cwd(), configType: "flat" });

  const config: Linter.Config = {
    // Flat config only lints a file that matches some config's `files` key — a
    // config with no `files` merely contributes settings to already-matched
    // files. We've already gated to .ts/.tsx in `transform`, so match both.
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      // The typescript-eslint parser object goes directly under
      // `languageOptions` in flat config (no name registration). Type-aware
      // linting via `project: true` is what lets the rule resolve a call back to
      // a real yasml factory.
      parser: parser as unknown as Linter.Parser,
      parserOptions: { project: true },
    },
    plugins: {
      // The rule is built with @typescript-eslint's RuleCreator, whose RuleModule
      // type is structurally compatible with eslint's at runtime but not
      // assignable in TS. Cast at this one boundary rather than weakening to `any`.
      "@thirtytech/yasml": {
        rules: {
          "match-export-parameters":
            matchExportParameters as unknown as Rule.RuleModule,
        },
      },
    },
    rules: { "@thirtytech/yasml/match-export-parameters": "warn" },
  };

  return {
    name: "codegen-yasml",
    enforce: "pre",
    transform(code, id) {
      // Only ever process our own .ts/.tsx sources — never node_modules.
      // (Previously a precedence bug let every .tsx under node_modules through,
      // triggering a full type-aware lint+fix on third-party files.)
      if (
        id.includes("node_modules") ||
        !(id.endsWith(".ts") || id.endsWith(".tsx"))
      ) {
        return null;
      }

      const matchesPattern = patterns
        ? patterns.some((pattern: any) =>
            typeof pattern === "string"
              ? code.includes(pattern)
              : pattern.test(code)
          )
        : true;
      if (!matchesPattern) {
        return null;
      }

      const lintedResult = linter.verifyAndFix(code, config, {
        filename: id,
      });

      // Only claim a transform when a fix was actually applied. Returning null
      // otherwise lets Vite keep the original module (and its source map)
      // instead of treating every .ts/.tsx file as rewritten with no map.
      if (lintedResult.fixed && lintedResult.output) {
        return { code: lintedResult.output, map: null };
      }
      return null;
    },
  };
}
