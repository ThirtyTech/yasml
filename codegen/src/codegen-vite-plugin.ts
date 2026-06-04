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
  const linter = new Linter({ cwd: process.cwd(), configType: "eslintrc" });

  linter.defineRule(
    "@thirtytech/yasml/match-export-parameters",
    // The rule is built with @typescript-eslint's RuleCreator, whose RuleModule
    // type is structurally compatible with eslint's at runtime but not assignable
    // in TS. Cast at this one boundary rather than weakening the import to `any`.
    matchExportParameters as unknown as Rule.RuleModule
  );
  linter.defineParser(
    "@typescript-eslint/parser",
    // @ts-ignore
    parser
  );

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

      const lintedResult = linter.verifyAndFix(
        code,
        {
          rules: { "@thirtytech/yasml/match-export-parameters": "warn" },
          parser: "@typescript-eslint/parser",
          parserOptions: {
            project: true,
          },
        },
        {
          filename: id,
        }
      );

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
