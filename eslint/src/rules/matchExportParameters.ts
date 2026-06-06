import { ESLintUtils, TSESLint, TSESTree } from "@typescript-eslint/utils";
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

    // Parser services and the type checker are constant for the whole file, so
    // resolve them once here instead of on every CallExpression visit.
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      CallExpression(node: TSESTree.CallExpression) {
        // 1. Cheap name gate.
        if (onlyHooks && !getCalleeName(node).startsWith("use")) {
          return;
        }

        // 1b. Never touch a custom/function selector. Its destructured names are
        //     the selector's *output* keys (often derived or renamed, e.g.
        //     `counterMultiplier`), not source state keys, so rewriting them into
        //     string-key arguments subscribes to contexts that never exist and
        //     renders the missing-provider sentinel. The runtime resolves a
        //     function selector's real dependencies itself, so leave it intact.
        const firstArg = node.arguments[0];
        if (
          firstArg &&
          (firstArg.type === "ArrowFunctionExpression" ||
            firstArg.type === "FunctionExpression")
        ) {
          return;
        }

        // 2. Cheap AST gate. A fix is only ever produced when the call is
        //    destructured into an object pattern whose property count differs
        //    from the current argument count. Everything else is a no-op, so
        //    bail out before doing any (expensive) type resolution.
        const objectPattern = getObjectPattern(context, node);
        if (
          !objectPattern ||
          node.arguments.length === objectPattern.properties.length
        ) {
          return;
        }

        // 3. Expensive gate last: confirm the call resolves into a yasml factory.
        if (!isAncestorOfYasml(node, services, checker)) {
          return;
        }

        const methodName = getMethodName(node);
        // Preserve original behaviour: when clearing all arguments we require a
        // resolvable method name; the general mismatch case keeps its prior
        // shape (which may interpolate an undefined method name).
        if (node.arguments.length === 0 && !methodName) {
          return;
        }

        const missingArguments = objectPattern.properties.map(
          (x: any) => `'${x.key.name}'`
        );
        const result = `${methodName}(${missingArguments.join(", ")})`;
        context.report({
          node,
          messageId: "matchExportParameters",
          fix: (fixer: TSESLint.RuleFixer) => fixer.replaceText(node, result),
        });
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

function getCalleeName(node: TSESTree.CallExpression): string {
  if (node.callee.type === "Identifier") {
    return node.callee.name;
  }
  if (
    node.callee.type === "MemberExpression" &&
    node.callee.property.type === "Identifier"
  ) {
    return node.callee.property.name;
  }
  return "";
}

function isAncestorOfYasml(
  node: TSESTree.CallExpression,
  services: any,
  checker: ts.TypeChecker
) {
  const tsCallExpression = services.esTreeNodeToTSNodeMap.get(
    node
  ) as ts.CallLikeExpression;
  const signature = checker.getResolvedSignature(tsCallExpression);
  if (signature && signature.declaration) {
    return walkParentsForYasmlName(signature.declaration) !== null;
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

function getObjectPattern(
  context: TSESLint.RuleContext<any, any>,
  node: TSESTree.Node
): TSESTree.ObjectPattern | undefined {
  // Walk ancestors from the innermost outward and stop at the nearest
  // VariableDeclarator. Iterating in reverse avoids allocating a reversed copy.
  //
  // `context.getAncestors()` was removed in ESLint 9; the node-scoped
  // `sourceCode.getAncestors(node)` is its replacement and exists on ESLint
  // 8.38+/9/10, so this works across every ESLint we support.
  const ancestors = context.sourceCode.getAncestors(node);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (ancestor.type === "VariableDeclarator") {
      return ancestor.id.type === "ObjectPattern" ? ancestor.id : undefined;
    }
  }
  return undefined;
}

export default rule;
