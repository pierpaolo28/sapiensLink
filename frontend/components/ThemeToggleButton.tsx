import React from "react";
import { useContext } from "react";
import { Switch } from "@mui/material";
import { ThemeModeContext } from "./AppLayout";

const ThemeToggleButton = () => {
  const { mode, toggleMode } = useContext(ThemeModeContext);

  return (
    <Switch checked={mode === "dark"} onChange={toggleMode} color="primary" />
  );
};

export default ThemeToggleButton;
