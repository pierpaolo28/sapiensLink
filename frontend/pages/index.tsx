'use client';
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Box,
  Paper,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Stack,
  Link as MuiLink,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  SvgIcon,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


// Replace these with your actual color codes and font settings
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    background: {
      default: '#f4f5f7',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.125rem',
      fontWeight: 400,
      margin: '2rem 0',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 400,
      color: '#333',
      margin: '1rem 0',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 700,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
    body1: {
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
        },
        contained: {
          padding: '6px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '2rem',
          textAlign: 'center',
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Typography variant="h6" color="inherit" noWrap>
          <img src="/logo.svg" alt="Sapiens Logo" width={120} />
        </Typography>
        <Box sx={{ flexGrow: 1 }} /> {/* This pushes the buttons to the right */}
        <Button color="inherit">Login</Button>
        <Button color="primary" variant="contained" sx={{ marginLeft: '1rem' }}>
          Sign Up
        </Button>
      </Toolbar>
    </AppBar>

      <Container maxWidth="lg" sx={{ my: 4 }}>
        {/* Main content */}
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Sharing Knowledge One link at a time
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </Typography>
          <Button variant="contained" color="primary" size="large">
            Get Started
          </Button>
        </Box>

        {/* User list with links */}
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          {/* Other content */}

          <Grid container spacing={4} sx={{ my: 4 }}>
            {/* Left section with user list and links */}
            <Grid item xs={12} md={7}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <AccountCircleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Jen O'Connor"
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textPrimary">
                          Design System
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Hi there! Here my collection of resources to start with Design Systems... Enjoy!
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
                  {/* Links here */}
                  <MuiLink href="#" underline="hover" color="primary">
                    www.wix.com/studio/blog/design-system-examples
                  </MuiLink>
                  {/* Add more links */}
                </Box>
              </Paper>
            </Grid>

            {/* Right section with additional text or content */}
            <Grid item xs={12} md={5}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="body1">
                  Create, share and find meaningful resources!
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Lorem ipsum dolor sit amet consectetur. Sem augue.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                  <Button variant="outlined">Learn More</Button>
                  <Button variant="contained">Get Started</Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Footer and other components */}
        </Container>



        {/* Features section */}
        <Typography variant="h2" align="center" gutterBottom>
          In Sapiens Link
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Repeat for each feature */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography gutterBottom variant="h5" component="h3">
                Feature
              </Typography>
              <Typography variant="body1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque massa nunc.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography gutterBottom variant="h5" component="h3">
                Feature
              </Typography>
              <Typography variant="body1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque massa nunc.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography gutterBottom variant="h5" component="h3">
                Feature
              </Typography>
              <Typography variant="body1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque massa nunc.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Call to action */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Start now
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <Button variant="outlined" size="large">
              Learn More
            </Button>
            <Button variant="contained" size="large">
              Get Started
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.default', p: 6 }} component="footer">
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" color="textPrimary" gutterBottom>
                Product
              </Typography>
              <Box>
                <MuiLink href="#" variant="subtitle1" color="textSecondary">
                  Overview
                </MuiLink><br />
                <MuiLink href="#" variant="subtitle1" color="textSecondary">
                  Features
                </MuiLink><br />
                {/* Add more product links here */}
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" color="textPrimary" gutterBottom>
                Company
              </Typography>
              <Box>
                <MuiLink href="#" variant="subtitle1" color="textSecondary">
                  About us
                </MuiLink><br />
                <MuiLink href="#" variant="subtitle1" color="textSecondary">
                  Press
                </MuiLink><br />
                {/* Add more company links here */}
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" color="textPrimary" gutterBottom>
                Resources
              </Typography>
              <Box>
                <MuiLink href="#" variant="subtitle1" color="textSecondary">
                  Tutorials
                </MuiLink><br />
                <MuiLink href="#" variant="subtitle1" color="textSecondary">
                  Support
                </MuiLink><br />
                {/* Add more resources links here */}
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, textAlign: 'center', gap: 2 }}>
            <img src="/logo.svg" alt="Sapiens Logo" width="120" />
            <Typography variant="body2" color="textSecondary">
              © {new Date().getFullYear()} Sapiens Link All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
