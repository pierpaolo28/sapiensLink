import { useState } from "react";
import { useRouter } from "next/router";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import AppLayout from "@/components/AppLayout";

const ResetPasswordPage = () => {
  const router = useRouter();
  const { uidb64, token } = router.query;
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/password_reset_confirm/${uidb64}/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_password: data.get("password"),
          }),
        }
      );

      const message = await response.json();

      if (response.ok) {
        router.push({
          pathname: "/reset/success",
          query: { uidb64 },
        });
      } else {
        setMessage(message.message || "Password reset failed");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage("An error occurred while resetting the password");
    }
  };

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
          <Avatar sx={{ m: 1, bgcolor: "primary.main", color: "#fff" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            New Password
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
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              size={"large"}
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
            {message && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  bgcolor: "error.contrastText",
                  color: "error.main",
                  p: 1,
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                {message}
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default ResetPasswordPage;
