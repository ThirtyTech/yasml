import { ESLintUtils, TSESLint, TSESTree } from "@typescript-eslint/utils";
import { RuleFixer } from "@typescript-eslint/utils/dist/ts-eslint";
import ts from "typescript";

const rule = ESLintUtils.RuleCreator(
  (ruleName) => `https://github.com/thirtytech/yasml/${ruleName}`
)({
  name: "match-export-parameters",
  meta: {
    type: "problem",
    docs: {
      description: "Match export parameters",
      recommended: "warn",
    },
    messages: {
      matchExportParameters: "Match export parameters",
      fixTo: 'Update to "{{result}}"',
    },
    hasSuggestions: true,
    fixable: "code",
    schema: [],
  },
  defaultOptions: [],
  create(context: any) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
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
  node: TSESTree.Node,
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
    const v = ts.isFunctionExpression(signature?.declaration as ts.Node);
    if (
      signature &&
      signature.declaration &&
      (signature.declaration as ts.FunctionExpression).name &&
      (signature.declaration.parent?.parent as ts.FunctionExpression)?.name
    ) {
      const declarationName = (signature?.declaration as ts.FunctionExpression)
        .name?.escapedText;
      const parentName = (
        signature.declaration.parent.parent as ts.FunctionExpression
      ).name?.escapedText;
      if (declarationName === "useSelector" && parentName === "yasml") {
        return true;
      }
    }
  }
  return false;
}

function getCallExpression(
  node: TSESTree.Node,
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
    .find(
      (x) => x.type === "VariableDeclarator"
    ) as TSESTree.VariableDeclarator;
  if (variableDeclarator && variableDeclarator.id.type === "ObjectPattern") {
    return variableDeclarator.id;
  }
  return undefined;
}

export default rule;
