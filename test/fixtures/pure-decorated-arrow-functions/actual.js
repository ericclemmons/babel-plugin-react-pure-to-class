import decorate from "decorators";

const Component = ({ children }) => {
  return <div>{children}</div>;
};

export default decorate({
  something: true,
})(Component)
