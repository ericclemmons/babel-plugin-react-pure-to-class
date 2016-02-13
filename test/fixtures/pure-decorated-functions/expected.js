import React from "react";
import decorate from "decorators";

class Component extends React.Component {
  render() {
    const { children } = this.props;

    return <div>{children}</div>;
  }

}

export default decorate({
  something: true
})(Component);
