import React, { useState } from "react";
import { FormEvent } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import IconButton from "@mui/material/IconButton";
import jsonp from "jsonp";

import Copyright from "./Copyright";

export default function Footer(props: any) {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = process.env.NEXT_PUBLIC_MAILCHIMP_API_KEY;
    jsonp(`${url}&EMAIL=${email}`, { param: "c" }, (error: any, data: any) => {
      if (error) {
        console.error("Error:", error);
        return;
      }

      // Check if data is defined and has the expected structure
      if (data && data.msg) {
        const { msg, result } = data;
        alert(msg);
      } else {
        console.error("Unexpected response:", data);
      }
    });

    console.log("Subscribed:", email);
    setEmail(""); // Clear the email field after subscribing
  };

  return (
    <Box sx={{ bgcolor: "background.default", py: 6 }} component="footer">
      <Container maxWidth="lg">
        <Divider />
        <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
          {/* <Grid item > */}
          <Grid item xs={6} md={4} lg={3}>
            <Typography variant="h6" color="textPrimary" gutterBottom>
              Product
            </Typography>
            <Link
              href="vision"
              variant="subtitle1"
              color="textSecondary"
              underline={"hover"}
              sx={{
                transition: ".2s",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              Vision
            </Link>
            <br />
            <Link
              href="tech_stack"
              variant="subtitle1"
              color="textSecondary"
              underline={"hover"}
              sx={{
                transition: ".2s",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              Tech Stack
            </Link>
            <br />
          </Grid>
          <Grid item xs={6} md={4} lg={3}>
            <Typography variant="h6" color="textPrimary" gutterBottom>
              Company
            </Typography>
            <Link
              href="about"
              variant="subtitle1"
              color="textSecondary"
              underline={"hover"}
              sx={{
                transition: ".2s",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              About us
            </Link>
            <br />
            <Link
              href="contacts"
              variant="subtitle1"
              color="textSecondary"
              underline={"hover"}
              sx={{
                transition: ".2s",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              Contacts
            </Link>
            <br />
          </Grid>
          {/* </Grid> */}
          <Grid item xs={12} md={4} lg={3}>
            <form onSubmit={handleSubscribe}>
              <Typography
                variant="h6"
                color="textPrimary"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Subscribe for updates!
              </Typography>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                size="small"
                name="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="medium"
              >
                Subscribe
              </Button>
            </form>
            <Box
              sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "center" }}
            >
              <IconButton
                color="primary"
                component={Link}
                href="#"
                target="_blank"
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                color="primary"
                component={Link}
                href="#"
                target="_blank"
              >
                <TwitterIcon />
              </IconButton>
              {/* Add more social icons as needed */}
            </Box>
          </Grid>
        </Grid>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            textAlign: "center",
            gap: 2,
            mt: 4,
          }}
        >
          <Copyright />
        </Box>
      </Container>
    </Box>
  );
}
