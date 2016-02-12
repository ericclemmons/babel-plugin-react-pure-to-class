const decorate = (options) => {
  return (Component) => Component;
};

export default decorate({
  doSomething: true,
})(function Component({ children }) {
  return <div>{children}</div>;
});
