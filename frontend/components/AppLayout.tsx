import React from "react";
import { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { CircularProgress } from "@mui/material";

import Header from "./Header";
import Footer from "./Footer";
import ErrorBoundary from "./ErrorBoundary";
import FallbackErrorComponent from "./FallbackErrorComponent";

interface AppLayoutProps {
  children?: React.ReactNode;
}

// Creating a context for the theme mode
export const ThemeModeContext = createContext<{
  mode: "light" | "dark";
  toggleMode: () => void;
}>({
  mode: "light",
  toggleMode: () => {},
});

function getDesignTokens(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#7F56D9",
      },
      secondary: {
        main: mode === "dark" ? "#ffebee" : "#f44336",
        contrastText: mode === "dark" ? "#f44336" : "#ffebee",
      },
      background: {
        default: mode === "dark" ? "#121212" : "#FCFCFC",
        paper: mode === "dark" ? "#121212" : "#FCFCFC",
      },
      text: {
        primary: mode === "dark" ? "#fff" : "#101828",
        secondary: mode === "dark" ? "#E5E5E5" : "#667085", // #FCFCFC
      },
      // Additional colors like error, warning, info, success
      error: {
        main: "#f44336",
      },
      warning: {
        main: "#ff9800",
      },
      info: {
        main: "#2196f3",
      },
      success: {
        main: "#4caf50",
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Arial', sans-serif",
      h1: {
        fontSize: "2.5rem",
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: "2.0rem",
        fontWeight: 500,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 500,
        lineHeight: 1.4,
      },
      // Additional typography settings
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            padding: "12px",
            textAlign: "left",
            borderRadius: 8,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#fff",
            // color: mode === "dark" ? "#fff" : "#333",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "default",
            backgroundImage: "none",
            borderTopLeftRadius: "0",
            borderBottomLeftRadius: "0",
          },
        },
      },
      // Further component customizations
    },
    transitions: {
      easing: {
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
        easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
    shape: {
      borderRadius: 8,
    },
    // Additional global styles or overrides
  });
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState<boolean>(true);

  // Function to read theme mode from localStorage
  const readThemeFromLocalStorage = useCallback((): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("themeMode") as "light" | "dark") || "light";
    }
    return "light";
  }, []);

  useEffect(() => {
    const savedMode = readThemeFromLocalStorage();
    setMode(savedMode);
    setLoading(false);
  }, [readThemeFromLocalStorage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("themeMode", mode);
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(() => getDesignTokens(mode), [mode]);

  if (loading) {
    return <CircularProgress />; // Or any other loading indicator
  }

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary fallback={<FallbackErrorComponent />}>
          <Header />
          <Container maxWidth="lg">{children}</Container>
          <Footer />
        </ErrorBoundary>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default AppLayout;

// #0F1B4C
// #000339
// #101828
// #667085
// #6B3ED0
// #7F56D9
// #AC8DF0
// #F0E4FE
// #F9F5FF
// #FDB022

// light: "#AC8DF0",
// main: mode === "dark" ? "#90caf9" : "#556cd6",
// dark: "#6B3ED0",
// contrastText: "#fff",

// light: "#ff4081",
// main: mode === "dark" ? "#f48fb1" : "#19857b",
// dark: "#c51162",
// contrastText: "#000",
