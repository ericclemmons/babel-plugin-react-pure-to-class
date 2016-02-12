export default function({ types: t }) {
  return {
    visitor: {
      FunctionDeclaration(path) {
        // Must be Capitalized
        if (!path.node.id.name.match(/^[A-Z]\w+$/)) {
          return;
        }

        const state = {
          hasJSX: false,
        };

        path.traverse({
          JSXElement(path) {
            this.hasJSX = true;
            path.stop();
          }
        }, state);

        if (!state.hasJSX) {
          return;
        }

        // Only support root-level Components
        if (path.scope.parent.block.type !== "Program") {
          return;
        }

        if (!path.scope.parent.references.React) {
          const react = t.importDeclaration(
            [
              t.importDefaultSpecifier(t.identifier("React"))
            ],
            t.stringLiteral("react"),
          );

          path.parentPath.insertBefore(react);
        }

        path.replaceWith(
          t.classDeclaration(
            // id
            t.identifier(path.node.id.name),

            // superClass
            t.identifier("React.Component"),

            // body
            t.classBody([
              t.classMethod(
                // kind
                "method",

                // key
                t.identifier("render"),

                // params
                [],

                // body
                t.blockStatement([
                  ...path.node.params.map((param, i) => {
                    if (param.type === "Identifier") {
                      return t.variableDeclaration(
                        "const",
                        [
                          t.variableDeclarator(
                            t.identifier(param.name),
                            t.memberExpression(
                              t.thisExpression(),
                              t.identifier(param.name),
                            ),
                          ),
                        ],
                      );
                    }

                    if (param.type === "ObjectPattern") {
                      return t.variableDeclaration(
                        "const",
                        [
                          t.variableDeclarator(
                            param,
                            t.memberExpression(
                              t.thisExpression(),
                              t.identifier(i === 0 ? "props" : "context"),
                            ),
                          ),
                        ],
                      )
                    }

                    console.log(param.type, param);
                    throw new Error(`Unknown param type: ${param.type}`);
                  }),

                  ...path.node.body.body,
                ], [])
              ),
            ]),

            // decorators
            []
          ),
        );
      }
    },
  };
}
