import React from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Box,
  Button,
  Link,
  TextField,
} from "@mui/material";
import { useForm, ValidationError } from "@formspree/react";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

import AppLayout from "@/components/AppLayout";

const TeamMembers = [
  {
    name: "Pier",
    avatar: "images/pier.jpeg",
    position: "Founder",
    url: "https://ppiconsulting.dev",
  },
  {
    name: "Tiph",
    avatar: "",
    position: "Co-founder",
    url: "",
  },
  {
    name: "Frapa",
    avatar: "",
    position: "Web Development",
    url: "",
  },
  {
    name: "Serena",
    avatar: "",
    position: "UX Design",
    url: "",
  },
  {
    name: "Danilo",
    avatar: "",
    position: "DevOps",
    url: "",
  },
];

const AboutPage: React.FC = () => {
  const [state, handleSubmit] = useForm(
    process.env.NEXT_PUBLIC_FORMSPREE_API_KEY!
  );
  if (state.succeeded) {
    window.location.href = "/";
  }

  return (
    <AppLayout>
      <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 3 }}>

        <Typography variant="h2" gutterBottom>
          About Us
        </Typography>

        <Typography variant="body1" paragraph>
          SapiensLink was created by a team of higly interdisciplanary
          individuals who are passionate about learning and sharing knowledge.
          <br />
          <br />
          The main objective is to make complex educational content
          accessible and to empower individual creators to make their creations
          accessible to wider audiences without losing their ownership. In order
          to unlock this vision, we are planning to create a space where
          information can consumed in different possible ways and Sapionauts can
          be provided with automatically generated tests to validate and prove
          newly acquired expertise.
          <br />
          <br />
          If you are interested in joining our team, supporting us or have any feedback, please
          reach out to us at{" "}
          <Link
            href="mailto:sapienslink@gmail.com"
            variant={"button"}
            color={"text.secondary"}
            rel="noopener noreferrer"
            sx={(theme) => ({
              "&:hover": {
                color: theme.palette.mode === "dark" ? "#fff" : "#101828",
              },
              transition: ".2s",
              textTransform: "lowercase",
            })}
            target={"_blank"}
          >
            sapienslink@gmail.com
          </Link>{" "}
          or fill out the form below. We are always looking for ways to improve
          our platform and would love to hear from you! You can learn more about our tech stack <a href="tech_stack">here</a>.
        </Typography>

        <Container maxWidth="sm">
          <Box mt={4}>
            <Typography variant="h5" align="center" gutterBottom>
              Contact Form
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                variant="outlined"
                name="email"
                fullWidth
                margin="normal"
                required
                type="email"
              />
              <ValidationError
                prefix="Email"
                field="email"
                errors={state.errors}
              />
              <TextField
                label="Message"
                variant="outlined"
                name="message"
                fullWidth
                margin="normal"
                required
                multiline
                rows={4}
              />
              <ValidationError
                prefix="Message"
                field="message"
                errors={state.errors}
              />
              <Button
                type="submit"
                variant="contained"
                size={"large"}
                color="primary"
                disabled={state.submitting}
                fullWidth
              >
                Submit
              </Button>
            </form>
          </Box>
        </Container>

        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            Our Contributors
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="space-around">
          {TeamMembers.map((member, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                style={{ padding: "20px", textAlign: "center" }}
              >
                <Avatar
                  alt={member.name}
                  src={member.avatar}
                  sx={{ width: 100, height: 100, margin: "auto" }}
                />
                <Typography variant="h6" gutterBottom>
                  {member.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="textSecondary"
                  gutterBottom
                >
                  {member.position}
                </Typography>
                {/* <Typography variant="body2" paragraph>
                  {member.bio}
                </Typography> */}
                <IconButton
                  component="a"
                  color={"primary"}
                  href={member.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedInIcon color={"primary"} />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>

      </Container>
    </AppLayout>
  );
};

export default AboutPage;
