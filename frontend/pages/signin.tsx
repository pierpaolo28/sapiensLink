import React, { useState } from "react";
import { useRouter } from "next/router";
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

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login_user/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        let errorMessage = "";

        if (responseData.email) {
          errorMessage += responseData.email + " ";
        }

        if (responseData.message) {
          errorMessage += responseData.message + " ";
        }

        if (errorMessage) {
          setError(errorMessage);
        } else {
          setError("Failed to sign in. Please check your credentials.");
        }
        return;
      }

      const responseData = await response.json();

      // Store tokens in local storage
      localStorage.setItem("access_token", responseData.access_token);
      localStorage.setItem("refresh_token", responseData.refresh_token);
      localStorage.setItem(
        "expiration_time",
        responseData.expiration_time.toString()
      );

      // Check for query parameters and make GET request
      const query = new URLSearchParams(window.location.search);
      const inactiveValue = query.get("inactive");
      const unreadValue = query.get("unread");

      if (inactiveValue !== null && inactiveValue !== undefined) {
        const accessToken = localStorage.getItem("access_token");
        query.delete("inactive");
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/email_unsubscribe/?access_token=${accessToken}&inactive=${inactiveValue}`
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                "Failed to unsubscribe from inactive user emails."
              );
            }
            const successMessage =
              "Successfully unsubscribed from inactive user emails.";
            router.push(
              `/list_home?success=${encodeURIComponent(successMessage)}`
            );
          })
          .catch((error) => {
            console.error(
              "Error while unsubscribing from inactive user emails:",
              error
            );
            const errorMessage =
              "Failed to unsubscribe from inactive user emails. Please try again.";
            router.push(`/list_home?error=${encodeURIComponent(errorMessage)}`);
          });
      }

      if (unreadValue !== null && unreadValue !== undefined) {
        const accessToken = localStorage.getItem("access_token");
        query.delete("unread");
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/email_unsubscribe/?access_token=${accessToken}&unread=${unreadValue}`
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                "Failed to unsubscribe from unread notifications emails."
              );
            }
            const successMessage =
              "Successfully unsubscribed from unread notifications emails.";
            router.push(
              `/list_home?success=${encodeURIComponent(successMessage)}`
            );
          })
          .catch((error) => {
            console.error(
              "Error while unsubscribing from unread notifications emails:",
              error
            );
            const errorMessage =
              "Failed to unsubscribe from unread notifications emails. Please try again.";
            router.push(`/list_home?error=${encodeURIComponent(errorMessage)}`);
          });
      }

      router.push("/list_home");
    } catch (error) {
      console.error("An error occurred while signing in:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const AuthLink = styled(Link)(({ theme }) => ({
    color: theme.palette.text.secondary,
    cursor: "pointer",
    transition: ".2s",
    whiteSpace: "nowrap",
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
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size={"large"}
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <GoogleSignIn />
            <Grid container sx={{ mt: 2, columnGap: "24px", rowGap: "8px" }}>
              <Grid item xs>
                {/* <Link href="reset_password" variant="body2">
                  Forgot password?
                </Link> */}
                <AuthLink
                  variant={"body2"}
                  href={"reset_password"}
                  underline={"hover"}
                >
                  Forgot password?
                </AuthLink>
              </Grid>
              <Grid item>
                {/* <Link href="signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link> */}
                <AuthLink variant={"body2"} href={"signup"} underline={"hover"}>
                  {"Don't have an account? Sign Up"}
                </AuthLink>
              </Grid>
            </Grid>
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
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
}
