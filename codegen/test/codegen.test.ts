import { Linter, type Rule } from "eslint";
import { join } from "path";
import * as parser from "@typescript-eslint/parser";
import rule from "../../eslint/dist/rules/matchExportParameters.js";
const cwd = process.cwd();
const projectPath = join(cwd, "../");
const fileName = "src/CounterValue.tsx";

// Flat config (ESLint 9+/10): rule, parser, and options are passed inline to
// `verifyAndFix` — the eslintrc `defineRule`/`defineParser` Linter is gone in 10.
const linter = new Linter({ cwd: projectPath, configType: "flat" });

const config: Linter.Config = {
  // Flat config only lints a file matching some config's `files` key.
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    parser: parser as unknown as Linter.Parser,
    parserOptions: {
      tsconfigRootDir: projectPath,
      project: join(projectPath, "tsconfig.json"),
    },
  },
  plugins: {
    "@thirtytech/yasml": {
      rules: { "match-export-parameters": rule as unknown as Rule.RuleModule },
    },
  },
  rules: { "@thirtytech/yasml/match-export-parameters": "warn" },
};

const result = linter.verifyAndFix(
  `import { useGlobalState } from "./state/MyState.state";

  export function CounterValue() {
    const { counter } = useGlobalState()
    return <div>{counter}</div>;
  }
`,
  config,
  { filename: fileName }
);

console.log(result);

// The rule must rewrite `useGlobalState()` to match the destructured
// properties. Resolving the import to a real yasml factory is what lets the
// rule fire, so this also guards against the type-resolution path silently
// breaking (which previously left the rule a no-op).
const expected = "useGlobalState('counter')";
if (!result.fixed || !result.output.includes(expected)) {
  console.error(
    `Expected output to be fixed and contain ${expected}, got:\n${result.output}`
  );
  process.exit(1);
}
console.log("ok: rule rewrote useGlobalState() to useGlobalState('counter')");

// invoke(
//   projectPath,
//   [
//     "--no-eslintrc",
//     "--parser",
//     "@typescript-eslint/parser",
//     "--plugin",
//     "@thirtytech/yasml",
//     "--parser-options",
//     "project:true",
//     "--rule",
//     "@thirtytech/yasml/match-export-parameters:1",
//     "--stdin",
//     "--fix-to-stdout",
//     "--stdin-filename",
//     fileName,
//   ],
//   `
// import { useGlobalState } from "./state/MyState";

// export function CounterValue() {
//   const { counter } = useGlobalState()
//   return <div>{counter}</div>;
// }
// `,
//   (err: Error, result: string) => {
//     if (err) {
//       console.error(err);
//     }
//     console.log(result);
//   }
// );
