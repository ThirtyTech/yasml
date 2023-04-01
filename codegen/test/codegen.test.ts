// @ts-ignore
import { invoke } from "eslint_d/lib/linter";
import { join } from 'path'
const cwd = process.cwd();
const projectPath = join(cwd, "../");
const fileName = "src/CounterValue.tsx";

invoke(
  projectPath,
  [
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
    fileName,
  ],
  `
import { useGlobalState } from "./state/MyState";

export function CounterValue() {
  const { counter } = useGlobalState()
  return <div>{counter}</div>;
}
`,
  (err: Error, result: string) => {
    console.error(err);
    console.log(result);
  }
);
