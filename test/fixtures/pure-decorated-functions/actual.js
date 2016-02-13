import decorate from "decorators";

export default decorate({
  something: true,
})(function Component({ children }) {
  return <div>{children}</div>;
});
