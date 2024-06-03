import { ESLintUtils, TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleFixer } from "@typescript-eslint/utils/dist/ts-eslint";
import ts from "typescript";

const rule = ESLintUtils.RuleCreator(
  (ruleName) => `https://github.com/thirtytech/yasml/eslint/docs/${ruleName}`
)({
  name: "match-export-parameters",
  meta: {
    type: "problem",
    hasSuggestions: true,
    docs: {
      description: "Match export parameters",
      recommended: "recommended",
    },
    messages: {
      matchExportParameters: "Match export parameters",
      fixTo: 'Update to "{{result}}"',
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          onlyHooks: {
            type: "boolean",
            default: true,
          },
        },
      },
    ],
  },
  defaultOptions: [],
  create(context: any) {
    const options = context.options[0] || {};
    const onlyHooks =
      typeof options.onlyHooks === "boolean" ? options.onlyHooks : true;

    return {
      CallExpression(node: TSESTree.CallExpression) {
        let functionName = "";

        // Check if the callee is an Identifier (like a simple function call)
        if (node.callee.type === "Identifier") {
          functionName = node.callee.name;
        }
        // Check if the callee is a MemberExpression (like a method or property access)
        else if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
          functionName = node.callee.property.name;
        }

        if (!onlyHooks || (functionName.startsWith("use"))) {
          const isYasml = isAncestorOfYasml(node, context);
          if (isYasml) {
            const callExpression = getCallExpression(node, context);
            const objectPattern = getObjectPattern(context);
            if (
              callExpression &&
              callExpression.arguments.length === 0 &&
              objectPattern &&
              objectPattern.properties.length > 0
            ) {
              const missingArguments = objectPattern.properties.map(
                (x: any) => `'${x.key.name}'`
              );

              const methodName = getMethodName(callExpression);
              if (methodName) {
                const result = `${methodName}(${missingArguments.join(", ")})`;
                context.report({
                  node: callExpression,
                  messageId: "matchExportParameters",
                  fix: (fixer: RuleFixer) =>
                    fixer.replaceText(callExpression, result),
                  suggest: [
                    {
                      messageId: "fixTo",
                      data: { result },
                      fix(fixer: RuleFixer) {
                        return fixer.replaceText(
                          callExpression as TSESTree.Node,
                          result
                        );
                      },
                    },
                  ],
                });
              }
            }
          }
        }
      },
    };
  },
});

function getMethodName(callExpression: TSESTree.CallExpression) {
  if (
    callExpression.callee.type === "MemberExpression" &&
    callExpression.callee.object.type === "Identifier" &&
    callExpression.callee.property.type === "Identifier"
  ) {
    const objectName = callExpression.callee.object.name;
    const methodName = callExpression.callee.property.name;
    return `${objectName}.${methodName}`;
  } else if (callExpression.callee.type === "Identifier") {
    return callExpression.callee.name;
  }
  return undefined;
}

function isAncestorOfYasml(
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<any, any>
) {
  const services = ESLintUtils.getParserServices(context);
  const tc = services.program.getTypeChecker();
  const callExpression = getCallExpression(node, context);
  if (callExpression) {
    const tsCallExpression = services.esTreeNodeToTSNodeMap.get(
      callExpression
    ) as ts.CallLikeExpression;
    const signature = tc.getResolvedSignature(tsCallExpression);
    if (signature && signature.declaration) {
      const isYasmlFound = walkParentsForYasmlName(signature.declaration);
      if (isYasmlFound) {
        return true;
      }
    }
  }
  return false;
}

function walkParentsForYasmlName(node: ts.Node): ts.FunctionExpression | null {
  const parent = node.parent;
  if (!parent) {
    return null;
  }
  if (
    parent &&
    (parent as ts.FunctionExpression).name?.escapedText === "yasml"
  ) {
    return parent as ts.FunctionExpression;
  }
  return walkParentsForYasmlName(node.parent);
}

function getCallExpression(
  node: TSESTree.CallExpression,
  context: TSESLint.RuleContext<any, any>
): TSESTree.CallExpression | undefined {
  const callExpression =
    node.type === "CallExpression"
      ? node
      : (context
          .getAncestors()
          .find((x) => x.type === "CallExpression") as TSESTree.CallExpression);
  if (callExpression) {
    return callExpression;
  }
  return undefined;
}

function getObjectPattern(
  context: TSESLint.RuleContext<any, any>
): TSESTree.ObjectPattern | undefined {
  const variableDeclarator = context
    .getAncestors()
    .reverse()
    .find(
      (x) => x.type === "VariableDeclarator"
    ) as TSESTree.VariableDeclarator;
  if (variableDeclarator && variableDeclarator.id.type === "ObjectPattern") {
    return variableDeclarator.id;
  }
  return undefined;
}

export default rule;
