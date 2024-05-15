import { Plugin } from "vite";
import { promisify } from 'util'
const { invoke } = require('eslint_d/lib/linter');
const invokePromise = promisify(invoke);

export function codeGeneratorYasmlPlugin(): Plugin {
  return {
    name: "codegen-yasml",
    enforce: "pre",
    async transform(code, id) {
      if ((!id.includes("node_modules") && id.endsWith(".ts")) || id.endsWith(".tsx")) {
        const result = await invokePromise(process.cwd(), [
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
