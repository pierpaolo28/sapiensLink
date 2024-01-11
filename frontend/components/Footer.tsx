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

    return (<Box sx={{ bgcolor: 'background.default', py: 6 }} component="footer">
        <Container maxWidth="lg">
            <Divider />
            <Grid container justifyContent="center" spacing={4}>
                <Grid item xs={12} sm={5}>
                    <Grid container spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                        <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6" color="textPrimary" gutterBottom>
                                Product
                            </Typography>
                            <Box>
                                <Link href="#" variant="subtitle1" color="textSecondary">
                                    Overview
                                </Link><br />
                                <Link href="#" variant="subtitle1" color="textSecondary">
                                    Features
                                </Link><br />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6" color="textPrimary" gutterBottom>
                                Company
                            </Typography>
                            <Box>
                                <Link href="#" variant="subtitle1" color="textSecondary">
                                    About us
                                </Link><br />
                                <Link href="#" variant="subtitle1" color="textSecondary">
                                    Press
                                </Link><br />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="h6" color="textPrimary" gutterBottom>
                                Resources
                            </Typography>
                            <Box>
                                <Link href="#" variant="subtitle1" color="textSecondary">
                                    Tutorials
                                </Link><br />
                                <Link href="#" variant="subtitle1" color="textSecondary">
                                    Support
                                </Link><br />
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={4}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    mt: 4, // increased top margin
                }}>
                    <Typography 
                        variant="h6" 
                        color="textPrimary" 
                        gutterBottom
                        sx={{ fontWeight: 'bold' }} // make the title bold
                    >
                        Subscribe to Mailing List
                    </Typography>
                    <Box sx={{ width: '100%', mt: 2 }}> {/* full width and margin top */}
                        <TextField
                            fullWidth // make the text field full width
                            label="Email"
                            variant="outlined"
                            size="small"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }} // margin bottom to separate from button
                        />
                        <Button
                            fullWidth // make the button full width
                            variant="contained"
                            color="secondary" // change color for emphasis
                            size="medium" // slightly larger button
                            onClick={handleSubscribe}
                        >
                            Subscribe
                        </Button>
                    </Box>

                        {/* Social Icons */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <IconButton color="primary" component={Link} href="#" target="_blank">
                                <LinkedInIcon />
                            </IconButton>
                            <IconButton color="primary" component={Link} href="#" target="_blank">
                                <TwitterIcon />
                            </IconButton>
                            {/* Add more social icons as needed */}
                        </Box>
                    </Box>
                </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, textAlign: 'center', gap: 2, mt: 4 }}>
                    <Copyright sx={{ mt: 8, mb: 4 }} />
                </Box>
        </Container>
    </Box>
    );
}