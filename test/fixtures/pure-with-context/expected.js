import React from "react";

class Component extends React.Component {
  render() {
    const props = this.props;
    const context = this.context;

    return <div>{context.name}</div>;
  }

}

export default Component;
