import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Header from "./Header";
import Footer from "./Footer";

interface AppLayoutProps {
  children?: React.ReactNode;
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    background: {
      default: "#f4f5f7",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h1: {
      fontSize: "2.125rem",
      fontWeight: 400,
      margin: "2rem 0",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 400,
      color: "#333",
      margin: "1rem 0",
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 400,
    },
    h5: {
      fontSize: "1rem",
      fontWeight: 700,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    },
    body1: {
      fontSize: "1rem",
    },
    subtitle1: {
      fontSize: "0.875rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
        },
        contained: {
          padding: "6px 24px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "2rem",
          textAlign: "center",
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      <Header></Header>
      <Container>{children}</Container>
      <Footer></Footer>
      </ThemeProvider>
    </div>
  );
}
