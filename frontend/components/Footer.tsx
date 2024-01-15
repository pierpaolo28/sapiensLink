import React, { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import IconButton from "@mui/material/IconButton";

import Copyright from "./Copyright";

export default function Footer(props: any) {
    const [email, setEmail] = useState("");

    const handleSubscribe = () => {
        // TODO: Implement subscribe logic here
        console.log("Subscribed:", email);
        setEmail(""); // Clear the email field after subscribing
    };

    return (
        <Box sx={{ bgcolor: 'background.default', py: 6 }} component="footer">
            <Container maxWidth="lg">
                <Divider />
                <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
                    <Grid item xs={12} md={4} lg={3}>
                        <Typography variant="h6" color="textPrimary" gutterBottom>
                            Product
                        </Typography>
                        <Link href="#" variant="subtitle1" color="textSecondary">
                            Overview
                        </Link><br />
                        <Link href="#" variant="subtitle1" color="textSecondary">
                            Vision
                        </Link><br />
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                        <Typography variant="h6" color="textPrimary" gutterBottom>
                            Company
                        </Typography>
                        <Link href="#" variant="subtitle1" color="textSecondary">
                            About us
                        </Link><br />
                        <Link href="#" variant="subtitle1" color="textSecondary">
                            Support us
                        </Link><br />
                    </Grid>
                    <Grid item xs={12} md={4} lg={3}>
                        <Typography 
                            variant="h6" 
                            color="textPrimary" 
                            gutterBottom
                            sx={{ fontWeight: 'bold' }}
                        >
                            Subscribe for updates!
                        </Typography>
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            size="small"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            size="medium"
                            onClick={handleSubscribe}
                        >
                            Subscribe
                        </Button>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
                            <IconButton color="primary" component={Link} href="#" target="_blank">
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton color="primary" component={Link} href="#" target="_blank">
                                <TwitterIcon />
                            </IconButton>
                            {/* Add more social icons as needed */}
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textAlign: 'center', gap: 2, mt: 4 }}>
                    <Copyright />
                </Box>
            </Container>
        </Box>
    );
}
