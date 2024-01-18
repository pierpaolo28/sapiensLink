import { Box, Button, Container, TextField, Typography } from '@mui/material';

import AppLayout from "@/components/AppLayout";

const ContactUsPage: React.FC = () => {
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // TODO Handle form submission logic here
    };

    return (
        <AppLayout>
            <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 3 }}>

                <Typography variant="h2" gutterBottom>
                    Contact Us
                </Typography>

                <Typography variant="body1" paragraph>
                    If you have any questions or feedback, please feel free to reach out to us at <a href="mailto:sapienslink@gmail.com">sapienslink@gmail.com</a> or fill out the form below.
                    We are always looking for ways to improve our platform and would love to hear from you!
                </Typography>

                <Container maxWidth="sm">
                    <Box mt={4}>
                        <Typography variant="h5" align="center" gutterBottom>
                            Information Form
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Name"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                required
                            />
                            <TextField
                                label="Email"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                required
                                type="email"
                            />
                            <TextField
                                label="Message"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                required
                                multiline
                                rows={4}
                            />
                            <Button type="submit" variant="contained" color="primary" fullWidth>
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
