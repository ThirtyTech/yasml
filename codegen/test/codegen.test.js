"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const linter_1 = require("eslint_d/lib/linter");
const path_1 = require("path");
const cwd = process.cwd();
const projectPath = (0, path_1.join)(cwd, "../");
const fileName = "src/CounterValue.tsx";
(0, linter_1.invoke)(projectPath, [
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
], `
import { useGlobalState } from "./state/MyState";

export function CounterValue() {
  const { counter } = useGlobalState()
  return <div>{counter}</div>;
}
`, (err, result) => {
    console.error(err);
    console.log(result);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWdlbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29kZWdlbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsYUFBYTtBQUNiLGdEQUE2QztBQUM3QywrQkFBMkI7QUFDM0IsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFCLE1BQU0sV0FBVyxHQUFHLElBQUEsV0FBSSxFQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNyQyxNQUFNLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQztBQUV4QyxJQUFBLGVBQU0sRUFDSixXQUFXLEVBQ1g7SUFDRSxlQUFlO0lBQ2YsVUFBVTtJQUNWLDJCQUEyQjtJQUMzQixVQUFVO0lBQ1YsbUJBQW1CO0lBQ25CLGtCQUFrQjtJQUNsQixjQUFjO0lBQ2QsUUFBUTtJQUNSLDZDQUE2QztJQUM3QyxTQUFTO0lBQ1QsaUJBQWlCO0lBQ2pCLGtCQUFrQjtJQUNsQixRQUFRO0NBQ1QsRUFDRDs7Ozs7OztDQU9ELEVBQ0MsQ0FBQyxHQUFVLEVBQUUsTUFBYyxFQUFFLEVBQUU7SUFDN0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3RCLENBQUMsQ0FDRixDQUFDIn0=