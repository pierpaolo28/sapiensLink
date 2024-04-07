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
import Head from 'next/head';
import { useRouter } from "next/router";

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
  toggleMode: () => { },
});

// You can paste colors in any code formats. For example HEX (#ffffff) or RGB (rgb(255, 255, 255)).
// The main color of the project, which does not change when changing the theme.
export const mainColor = "#7F56D9";

// Main text colors group for light and dark theme. It is preferable to change together with the group of text colors
export const textMainLightThemeColor = "#101828";
export const textMainDarkThemeColor = "#fff";

// Secondary text colors group for light and dark theme. Used mainly on links.
export const textSecondaryLightThemeColor = "#667085";
export const textSecondaryDarkThemeColor = "#E5E5E5";

// Main background colors group for light and dark theme. It is preferable to change together with the group of text colors
export const bgMainLightThemeColor = "#FCFCFC";
export const bgMainDarkThemeColor = "#121212";

export const errorTextLightThemeColor = "#f44336";
export const errorTextDarkThemeColor = "##ffebee";

export const errorBgLightThemeColor = "#ffebee";
export const errorBgDarkThemeColor = "#f44336";

// Main unchangable color for errors.
export const errorColor = "#f44336";
// Main unchangable color for warnings.
export const warningColor = "#ff9800";
// Main unchangable color for info.
export const infoColor = "#2196f3";
// Main unchangable color for success.
export const successColor = "#4caf50";

// Constant headers colors
// If you want to change this constant colors to changable colors depends on theme you need change them into Header coponent.
// For example: headerLinkColor to "text.primary" or, if theme is available - headerPopoverListBgColor to theme.palette.secondary.contrastText;
export const headerLinkColor = "#667085";
export const headerLinkHoverColor = "#101828";
export const headerPopoverListBgColor = "#fff";
export const headerListItemHoverBgColor = "#F5F5F5";
export const headerListItemTextColor = "#121212";

//Colors from Figma Template
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

function getDesignTokens(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mainColor /* If you want to change the main color depending on the theme, replace "mainColor" with this construct: mode === "dark" ? anyColorForDarkTheme : anyColorForLightTheme */,
      },
      secondary: {
        main:
          mode === "dark" ? errorTextDarkThemeColor : errorTextLightThemeColor,
        contrastText:
          mode === "dark" ? errorBgDarkThemeColor : errorBgLightThemeColor,
      },
      background: {
        default: mode === "dark" ? bgMainDarkThemeColor : bgMainLightThemeColor,
        paper: mode === "dark" ? bgMainDarkThemeColor : bgMainLightThemeColor,
      },
      text: {
        primary:
          mode === "dark" ? textMainDarkThemeColor : textMainLightThemeColor,
        secondary:
          mode === "dark"
            ? textSecondaryDarkThemeColor
            : textSecondaryLightThemeColor,
      },
      // Additional colors like error, warning, info, success
      error: {
        main: errorColor,
      },
      warning: {
        main: warningColor,
      },
      info: {
        main: infoColor,
      },
      success: {
        main: successColor,
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
            backgroundColor: headerPopoverListBgColor,
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
      MuiCssBaseline: {
        styleOverrides: {
          a: {
            color: 
              `${mode === "dark" ? textSecondaryDarkThemeColor : textSecondaryLightThemeColor} !important`,
          },
          ".customButton": {
            "&.MuiButton-outlined": {
              color: mainColor + " !important",
              borderColor: mainColor + " !important",
            },
            "&.MuiButton-contained": {
              color: "#fff !important",
              backgroundColor: mainColor + " !important",
            },
          },
          ".customSpanClass": {
            backgroundColor: "yellow",
            color: mode === "dark" ? "#333" : "#000",
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
  const router = useRouter();
  const logoPath = `${router.basePath}/logo.svg`;

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
    return (
      <ThemeProvider theme={theme}>
        <CircularProgress
          color={"primary"}
          sx={{ mx: "auto", display: "block", py: 4 }}
        />
      </ThemeProvider>
    ); // Or any other loading indicator
  }

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary fallback={<FallbackErrorComponent />}>
        <Head>
          <title>SapiensLink</title>
          <meta name="description" content="Sharing knowledge one link at the time." />
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover" />
          <meta name="generator" content="Next.js" />
          <meta property="og:title" content="SapiensLink" />
          <meta property="og:description" content="Sharing knowledge one link at the time." />
          <meta property="og:image" content="https://sapienslink.com/logo.svg" /> 
          <meta property="og:url" content="https://sapienslink.com" /> 
          <meta property="og:type" content="website" />
          <link rel="icon" href={logoPath} />
          <link rel="manifest" href="manifest.json" />

          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.$crisp=[];
                window.CRISP_WEBSITE_ID="6ac9eee4-fd6d-41e9-ad05-9cd9802e7321";
                (function(){
                  var d=document;
                  var s=d.createElement("script");
                  s.src="https://client.crisp.chat/l.js";
                  s.async=1;
                  d.getElementsByTagName("head")[0].appendChild(s);
                })();
              `
            }}
          />
        </Head>
          <Header />
          <Container maxWidth="lg">{children}</Container>
          <Footer />
        </ErrorBoundary>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default AppLayout;
