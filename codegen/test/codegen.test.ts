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
  `import { useGlobalState } from "./state/MyState";

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
