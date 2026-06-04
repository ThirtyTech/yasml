import { Linter } from "eslint";
import { join } from "path";
import * as parser from "@typescript-eslint/parser";
import rule from "../../eslint/dist/rules/matchExportParameters";
const cwd = process.cwd();
const projectPath = join(cwd, "../");
const fileName = "src/CounterValue.tsx";

const linter = new Linter({ cwd: projectPath, configType: "eslintrc" });

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
const result = linter.verifyAndFix(
  `import { useGlobalState } from "./state/MyState.state";

  export function CounterValue() {
    const { counter } = useGlobalState()
    return <div>{counter}</div>;
  }
`,
  {
    rules: { "@thirtytech/yasml/match-export-parameters": "warn" },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      tsconfigRootDir: projectPath,
      project: join(projectPath, "tsconfig.json"),
    },
  },
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
