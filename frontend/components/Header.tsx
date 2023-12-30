import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function Header() {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Typography variant="h6" color="inherit" noWrap>
          <Link href="/">
            <img src="/logo.svg" alt="Sapiens Logo" width={120} />
          </Link>
        </Typography>
        <Box sx={{ flexGrow: 1 }} />{" "}
        {/* This pushes the buttons to the right */}
        <Button color="inherit" href="signin">
          Login
        </Button>
        <Button
          color="primary"
          variant="contained"
          sx={{ marginLeft: "1rem" }}
          href="signup"
        >
          Sign Up
        </Button>
      </Toolbar>
    </AppBar>
  );
}
