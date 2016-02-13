import React from "react";

class Component extends React.Component {
  render() {
    const props = this.props;

    return <div>{props.children}</div>;
  }

}

export default Component;
