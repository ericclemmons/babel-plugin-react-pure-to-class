import React from "react";

export default class Component extends React.Component {
  render() {
    const props = this.props;
    const { name } = this.context;

    return <div>{name}</div>;
  }

}
