import React from "react";

class Component extends React.Component {
  render() {
    const { children } = this.props;

    return <div>{children}</div>;
  }

}
