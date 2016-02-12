
export default function({ types: t, template }) {
  const declareParam = (param, i) => {
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

    console.error(param.type, param);
    throw new Error(`Unknown param type: ${param.type}`);
  };

  const declareParams = (params) => params.map(declareParam);
  const hasComponentName = (node) => node.id.type === "Identifier" && node.id.name.match(/^[A-Z]\w+$/);

  const hasJSX = (path) => {
    const state = { jsx: false };

    path.traverse({
      JSXElement(path) {
        this.jsx = true;
        path.stop();
      },
    }, state);

    return state.jsx;
  };

  const importReact = (path) => {
    const react = t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier("React"))],
      t.stringLiteral("react"),
    );

    path.insertBefore(react);
  };

  const isConst = (node) => node.kind === "const";

  const isRootLevel = (path) => path.scope && path.scope.parent && parent.scope.parent.block && path.scope.parent.block.type === "Program";

  const functionToClass = (name, node) => {
    const id = t.identifier(name);
    const superClass = t.identifier("React.Component");
    const decorators = [];
    const body = getClassBody(node);

    return t.classDeclaration(
      id,
      superClass,
      body,
      decorators,
    );
  };

  const getClassBody = (node) => {
    const body = node.body.body;
    const name = t.identifier("render");
    const args = [];

    const render = t.classMethod(
      "method",
      name,
      args,
      t.blockStatement([
        ...declareParams(node.params),
        ...body,
      ], [])
    );

    return t.classBody([
      render,
    ]);
  };

  return {
    visitor: {
      FunctionDeclaration(path) {
        if (
          !isRootLevel(path) ||
          !hasComponentName(path.node) ||
          !hasJSX(path)
        ) {
          return;
        }

        if (!path.scope.parent.references.React) {
          importReact(path.parentPath);
        }

        path.replaceWith(functionToClass(path.node.id.name, path.node));
      },

      VariableDeclaration(path) {
        const declaration = path.node.declarations[0];

        if (
          !isConst(path.node) ||
          !hasComponentName(declaration) ||
          !hasJSX(path)
        ) {
          return;
        }

        if (!path.scope.references.React) {
          importReact(path.parentPath);
        }

        path.replaceWith(functionToClass(declaration.id.name, declaration.init));
      },
    },
  };
}
