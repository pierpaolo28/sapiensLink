import { Box, Grid } from "@mui/material";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleSignIn = () => {
  // Google API client ID
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Function to handle the Google Sign-In response
  const handleCredentialResponse = async (response: any) => {
    try {
      // Extract the ID token from the authentication response
      const id_token = response.getAuthResponse().id_token;

      // Send the ID token to the server for verification
      const serverResponse = await fetch("http://localhost/api/auth/google/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: id_token, name: response.wt.rV }),
      });

      if (!serverResponse.ok) {
        const errorData = await serverResponse.json();
        throw new Error(
          errorData.message ||
            "Failed to sign in. Please check your credentials."
        );
      }

      // Parse and store server response data in local storage
      const data = await serverResponse.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("expiration_time", data.expiration_time.toString());

      window.location.href = "/list_home";
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // useEffect to initialize Google Sign-In on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("gapi-script").then((gapiModule) => {
        const gapi = gapiModule.gapi;

        // Load 'client:auth2' component and initialize Google Auth2
        gapi.load("client:auth2", () => {
          gapi.client
            .init({
              clientId: clientId,
              scope: "profile email",
            })
            .then(() => {
              // Load 'signin2' component and render Google Sign-In button
              gapi.load("signin2", () => {
                gapi.signin2.render("g_id_signin", {
                  scope: "profile email",
                  width: "auto",
                  longtitle: true,
                  theme: "dark",
                  onsuccess: handleCredentialResponse,
                });
              });
            });
        });
      });
    }
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 0 10px rgba(0,0,0,0.08)",
        borderRadius: "8px",
        color: "#667085",
        transition: ".2s",
        "&:hover": {
          color: "#101828",
        },
      }}
    >
      <Grid
        item
        container
        justifyContent={"center"}
        alignItems={"center"}
        gap={1}
        sx={{
          bgcolor: "#fff",
          py: 1,
        }}
      >
        <FcGoogle style={{ width: "30px", height: "30px" }} />
        Sign in with Google
      </Grid>
      <div
        style={{
          opacity: "0",
          position: "absolute",
          width: "100%",
          height: "100%",
          top: "0",
        }}
        id="g_id_signin"
      ></div>
    </Box>
  );
};

export default GoogleSignIn;
