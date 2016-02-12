import React from "react";

export default class Component extends React.Component {
  render() {
    const props = this.props;
    const context = this.context;

    return <div>{context.name}</div>;
  }

}
