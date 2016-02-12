import React from "react";

export default class Component extends React.Component {
  render() {
    const props = this.props;

    return <div>{props.children}</div>;
  }

}
