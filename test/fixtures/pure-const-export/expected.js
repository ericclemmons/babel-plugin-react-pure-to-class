import React from "react";
export class Component extends React.Component {
  render() {
    const { children } = this.props;

    return <div>{children}</div>;
  }

}
