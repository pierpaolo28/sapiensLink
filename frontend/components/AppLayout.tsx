import { ReactElement } from "react";
import { Grid } from "@mui/material";

import Header from "./Header";

interface AppLayoutProps {
  children: ReactElement | string;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Grid container spacing={2}>
      <Grid xs={8}>
        <Header></Header>
      </Grid>
      <Grid xs={4}>{children}</Grid>
      <Grid xs={4}>xs=4</Grid>
      <Grid xs={8}>xs=8</Grid>
    </Grid>
  );
}
