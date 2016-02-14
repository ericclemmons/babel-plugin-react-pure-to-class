import React from "react";

class Component extends React.Component {
  render() {
    const { children } = this.props;

    return <div>{children}</div>;
  }

}

import decorate from "decorators";

export default decorate({
  something: true
})(Component);
