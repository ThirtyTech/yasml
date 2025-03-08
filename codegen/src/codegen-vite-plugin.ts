import { PluginOption } from "vite";
import { Linter } from "eslint";
import * as parser from "@typescript-eslint/parser";
import rule from "@thirtytech/eslint-plugin-yasml/dist/rules/matchExportParameters";

type CodeGeneratorYasmlPluginPatternOptions = {
  allFiles?: never;
  patterns?: string | string[] | (RegExp | RegExp[]);
};

type CodeGeneratorYasmlPluginAllFilesOptions = {
  patterns?: never;
  allFiles?: true;
};

type CodeGeneratorYasmlPluginOptions =
  | CodeGeneratorYasmlPluginPatternOptions
  | CodeGeneratorYasmlPluginAllFilesOptions;

export function codeGeneratorYasmlPlugin(
  options: CodeGeneratorYasmlPluginOptions
): PluginOption {
  const linter = new Linter({ cwd: process.cwd(), configType: "eslintrc" });
  let patterns: string[] | RegExp[] = [];

  if ("patterns" in options && typeof options.patterns === "string") {
    patterns = [options.patterns];
  } else if ("patterns" in options && options.patterns instanceof RegExp) {
    patterns = [options.patterns];
  } else if ("allFiles" in options) {
    patterns = [];
  } else if (!patterns && !options.allFiles) {
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
        const matchesPattern = patterns.some((pattern: any) =>
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
