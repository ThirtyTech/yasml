import { Plugin } from "vite";
const { invoke } = require('eslint_d/lib/linter');

export function codeGeneratorYasmlPlugin(): Plugin {
  return {
    name: "codegen-yasml",
    enforce: "pre",
    async transform(code, id) {
      if ((!id.includes("node_modules") && id.endsWith(".ts")) || id.endsWith(".tsx")) {
        const result = await invoke(process.cwd(), [
          "--no-eslintrc",
          "--parser",
          "@typescript-eslint/parser",
          "--plugin",
          "@thirtytech/yasml",
          "--parser-options",
          "project:true",
          "--rule",
          "@thirtytech/yasml/match-export-parameters:1",
          "--stdin",
          "--fix-to-stdout",
          "--stdin-filename",
          id,
        ], code);
        code = result;
      }
      return code;
    },
  };
}
