import * as babel from "babel-core";
import expect from "expect";

const actual = `
export default function Component({ children }) {
  return <p>{children}</p>;
}
`;

const expected = `
import _reactTransformHmr from "react-transform-hmr";
import React from "react";
const _components = {
  Component: {
    displayName: "Component"
  }
};

const _reactTransformHmr2 = _reactTransformHmr({
  filename: "unknown",
  components: _components,
  locals: [module],
  imports: [React]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformHmr2(Component, id);
  };
}

const Component = _wrapComponent("Component")(class Component extends React.Component {
  render() {
    const { children } = this.props;

    return <p>{children}</p>;
  }

});

export default Component;
`;

const options = {
  passPerPreset: true,
  presets: [
    {
      plugins: [
        "syntax-jsx",
        "./src/plugin.js",
      ]
    },
    {
      plugins: [
        ["react-transform", {
          transforms: [{
            transform: "react-transform-hmr",
            imports: ["react"],
            locals: ["module"],
          }],
        }],
      ],
    },
  ],
};

const trim = (str) => str.replace(/^\s+|\s+$/g, "");

describe("react-transform-hmr", () => {
  it.only("should modify the transformed Class", () => {
    const transformed = babel.transform(actual, options).code;

    expect(trim(transformed)).toEqual(trim(expected));
  });
});
