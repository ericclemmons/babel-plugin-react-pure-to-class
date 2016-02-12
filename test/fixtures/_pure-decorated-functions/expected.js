import React from "react";

const decorate = (options) => {
  return (Component) => Component;
};

class Component extends React.Component {
  render() {
    const { children } = this.props

    return <div>{children}</div>;
  }
}

export default decorate({
  doSomething: true,
})(Component);
