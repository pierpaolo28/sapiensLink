import classes from "./GridContainer.module.css";

const GridContainer = (props) => {
  return <div className={classes.gridContainer}>{props.children}</div>;
};

export default GridContainer;
