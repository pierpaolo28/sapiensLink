import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import AppLayout from "@/components/AppLayout";
import GoogleSignIn from "@/components/GoogleSignIn";
import { styled } from "@mui/material";

export default function SignUp() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("http://localhost/api/register_user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          password1: data.get("password"),
          password2: data.get("confirmPassword"),
        }),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Store tokens in local storage
        localStorage.setItem("access_token", responseData.access_token);
        localStorage.setItem("refresh_token", responseData.refresh_token);
        localStorage.setItem(
          "expiration_time",
          responseData.expiration_time.toString()
        );

        window.location.href = "/list_home";
      } else {
        const responseData = await response.json();

        let errorMessage = "";

        if (responseData.email && responseData.email[0]) {
          errorMessage += responseData.email[0] + " ";
        }

        if (responseData.password2 && responseData.password2[0]) {
          errorMessage += responseData.password2[0] + " ";
        }

        if (responseData.details && responseData.details.email) {
          errorMessage += responseData.details.email + " ";
        }

        if (responseData.details && responseData.details.non_field_errors) {
          errorMessage += responseData.details.non_field_errors + " ";
        }

        if (errorMessage) {
          setError(errorMessage);
        } else {
          setError("Failed to sign up. Please check your information.");
        }
      }
    } catch (error) {
      setError("Account already exists or Password not secure enough.");
    }
  };

  const AuthLink = styled(Link)(({ theme }) => ({
    color: theme.palette.text.secondary,
    cursor: "pointer",
    transition: ".2s",
    "&:hover": {
      color: theme.palette.text.primary,
    },
  }));

  return (
    <AppLayout>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlinedIcon sx={{ color: "#fff" }} />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  name="name"
                  autoComplete="name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              size={"large"}
            >
              Sign Up
            </Button>
            <GoogleSignIn />
            {error && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  bgcolor: "secondary.contrastText",
                  color: "secondary.main",
                  p: 1,
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                {error}
              </Typography>
            )}
            <Grid container justifyContent="flex-end" mt={2}>
              <Grid item>
                <AuthLink variant={"body2"} href={"signin"} underline={"hover"}>
                  Already have an account? Sign in
                </AuthLink>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
}
