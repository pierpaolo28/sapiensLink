import React, { useState } from "react";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import AppLayout from "@/components/AppLayout";
import GoogleSignIn from "@/components/GoogleSignIn";


export default function SignIn() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch('http://localhost/api/login_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.get('email'),
          password: data.get('password'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to sign in. Please check your credentials.');
        return;
      }

      const responseData = await response.json();

      // Store tokens in local storage
      localStorage.setItem('access_token', responseData.access_token);
      localStorage.setItem('refresh_token', responseData.refresh_token);
      localStorage.setItem('expiration_time', responseData.expiration_time.toString());

      window.location.href = '/list_home';
    } catch (error) {
      console.error('An error occurred while signing in:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <AppLayout>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <GoogleSignIn/>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
}
