const Container = (props) => {
  return (
    <div
      className={`container-w px-4 mx-auto ${
        props.className ? props.className : ""
      }`}
    >
      {props.children}
    </div>
  );
};

export default Container;
