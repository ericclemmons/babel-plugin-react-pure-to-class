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

  const functionToClass = (id, path, { file }) => {
    const React = findReact(file);

    const superClass = t.memberExpression(
      t.identifier("React"),
      t.identifier("Component"),
    );

    const decorators = [];
    const body = getClassBody(path);

    const Component = t.classDeclaration(
      id,
      superClass,
      body,
      decorators,
    );

    return Component;
  };

  const getClassBody = (path) => {
    const body = (path.node.body.type === "BlockStatement")
      ? path.node.body.body : [t.returnStatement(path.node.body)]
    ;

    const name = t.identifier("render");
    const args = [];

    const render = t.classMethod(
      "method",
      name,
      args,
      t.blockStatement([
        ...declareParams(path.node.params),
        ...body,
      ], [])
    );

    return t.classBody([
      render,
    ]);
  };

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

  const findReact = (file) => {
    const existing = file.path.node.body
      .filter((path) => t.isImportDeclaration(path))
      .map((path) => path.specifiers
        .filter((path) => t.isImportDefaultSpecifier(path))
        .map((path) => path.local)
        .filter((id) => id.name === "React")
        .shift()
      )
      .shift()
    ;

    if (existing) {
      return existing;
    }

    const React = t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier("React"))],
      t.stringLiteral("react"),
    );

    file.path.node.body.unshift(React);

    return React;
  }

  const isCapitalized = (name) => name.match(/^[A-Z]\w+$/);

  const FunctionExpression = (path, { file }) => {
    if (path.parent.type === "CallExpression") {
      FunctionDeclaration(path, { file });
      return;
    }

    const variable = path.parent;

    if (variable.type !== "VariableDeclarator") {
      return;
    }

    const declaration = path.parentPath.parentPath;

    if (declaration.type !== "VariableDeclaration") {
      return;
    }

    if (!declaration.kind === "const") {
      return;
    }

    const { name } = variable.id;

    if (!isCapitalized(name)) {
      return;
    }

    if (!hasJSX(path)) {
      return;
    }

    const id = t.identifier(name);
    const Component = functionToClass(id, path, { file });

    declaration.replaceWith(Component);
  };

  const FunctionDeclaration = (path, { file }) => {
    const { name } = path.node.id;

    if (!isCapitalized(name)) {
      return;
    }

    if (!hasJSX(path)) {
      return;
    }

    const id = t.identifier(name);
    const Component = functionToClass(id, path, { file });

    if (path.parent.type === "ExportDefaultDeclaration") {
      path.parentPath.replaceWith(Component);
      path.parentPath.insertAfter(t.exportDefaultDeclaration(id));
    } else if (path.parent.type === "CallExpression") {
      if (path.parentPath.parentPath.type === "ExportDefaultDeclaration") {
        path.replaceWith(id);
        path.parentPath.parentPath.insertBefore(Component);
      }
    } else {
      throw new Error(`Function => React.Component does not support parent type "${path.parent.type}"`);
    }
  };

  return {
    visitor: {
      // const Component = () => {}
      ArrowFunctionExpression: FunctionExpression,

      // function Component(...)
      FunctionDeclaration,

      // const Component = function(...)
      FunctionExpression,
    }
  }
}
