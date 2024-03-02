import {
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, ValidationError } from "@formspree/react";

import AppLayout from "@/components/AppLayout";

const ContactUsPage: React.FC = () => {
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
          Contact Us
        </Typography>

        <Typography variant="body1" paragraph>
          If you have any questions or feedback, please feel free to reach out
          to us at{" "}
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
          our platform and would love to hear from you!
        </Typography>

        <Container maxWidth="sm">
          <Box mt={4}>
            <Typography variant="h5" align="center" gutterBottom>
              Information Form
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
      </Container>
    </AppLayout>
  );
};

export default ContactUsPage;
