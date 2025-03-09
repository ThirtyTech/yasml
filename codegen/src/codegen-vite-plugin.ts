import { PluginOption } from "vite";
import { Linter } from "eslint";
import * as parser from "@typescript-eslint/parser";
import rule from "@thirtytech/eslint-plugin-yasml/dist/rules/matchExportParameters";

type CodeGeneratorYasmlPluginPatternOptions = {
  patterns?: string[] | RegExp[];
};

export function codeGeneratorYasmlPlugin(
  { patterns }: CodeGeneratorYasmlPluginPatternOptions | undefined = {}
): PluginOption {
  const linter = new Linter({ cwd: process.cwd(), configType: "eslintrc" });

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
        const matchesPattern = patterns ? patterns.some((pattern: any) =>
          typeof pattern === "string"
            ? code.includes(pattern)
            : pattern.test(code)
        ) : true;
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
