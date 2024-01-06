import React from 'react';
import { createContext } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';

import Header from './Header';
import Footer from './Footer';

interface AppLayoutProps {
  children?: React.ReactNode;
}

// Creating a context for the theme mode
export const ThemeModeContext = createContext<{
  mode: 'light' | 'dark';
  toggleMode: () => void;
}>({
  mode: 'light',
  toggleMode: () => {},
});

function getDesignTokens(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#556cd6',
        contrastText: '#fff',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#19857b',
        contrastText: '#000',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#eaeaea',
        paper: mode === 'dark' ? '#1d1d1d' : '#fff',
      },
      text: {
        primary: mode === 'dark' ? '#fff' : '#2c2c2c',
        secondary: mode === 'dark' ? '#a7a7a7' : '#6c6c6c',
      },
      // ... other colors like error, warning, etc.
    },
    typography: {
      fontFamily: "'Roboto', 'Arial', sans-serif",
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      // ... other typography styles
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            textTransform: 'none',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            padding: '20px',
            textAlign: 'left',
            borderRadius: 8,
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#333' : '#fff',
            color: mode === 'dark' ? '#fff' : '#333',
          },
        },
      },
    },
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        // ... other easing curves
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        // ... other durations
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
    shape: {
      borderRadius: 8,
    },
    // ... other theme configurations
  });
}

const AppLayout = ({ children }: AppLayoutProps) => {
  // Initialize state with 'light' mode as default
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for the saved theme mode in localStorage and update the state
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('themeMode') as 'light' | 'dark' : 'light';
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    // Save the theme mode to localStorage when it changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', mode);
    }
  }, [mode]);

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const theme = useMemo(() => getDesignTokens(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header />
        <Container maxWidth="lg">{children}</Container>
        <Footer />
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default AppLayout;