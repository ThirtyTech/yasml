import { PluginOption } from "vite";
import { Linter } from "eslint";
import * as parser from "@typescript-eslint/parser";
import rule from "@thirtytech/eslint-plugin-yasml/dist/rules/matchExportParameters";

export function codeGeneratorYasmlPlugin({
  patterns,
}: {
  patterns: string | string[] | (RegExp | RegExp[]);
}): PluginOption {
  const linter = new Linter({ cwd: process.cwd(), configType: "eslintrc" });
  // Check if patterns is an array or string of regex patterns and set that to an array
  if (typeof patterns === "string") {
    patterns = [patterns];
  } else if (Array.isArray(patterns)) {
    patterns = patterns.map((pattern) =>
      typeof pattern === "string" ? new RegExp(pattern) : pattern
    );
  } else if (patterns instanceof RegExp) {
    patterns = [patterns];
  }

  if (!patterns) {
    patterns = [/\.state/g, /\.hooks/g];
  }

  linter.defineRule(
    "@thirtytech/yasml/match-export-parameters",
    // @ts-ignore
    rule
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
      if (
        (!id.includes("node_modules") && id.endsWith(".ts")) ||
        id.endsWith(".tsx")
      ) {
        const matchesPattern = patterns.some((pattern) =>
          typeof pattern === "string"
            ? code.includes(pattern)
            : pattern.test(code)
        );
        if (matchesPattern) {
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
          if (lintedResult.output) {
            code = lintedResult.output;
          }
        }
      }
      return {
        code,
        map: null,
      };
    },
  };
}
