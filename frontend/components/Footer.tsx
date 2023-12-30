import { Box, Container, Divider, Grid, Typography, Link } from "@mui/material";
import Copyright from "./Copyright";

export default function Footer(props: any) {
    return (<Box sx={{ bgcolor: 'background.default', py: 6 }} component="footer">
        <Container maxWidth="lg">
            <Divider />
            <Grid container justifyContent="center">
                <Grid item xs={12}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, textAlign: 'center', gap: 2, mt: 4 }}>
                        <Copyright sx={{ mt: 8, mb: 4 }} />
                    </Box>
                </Grid>
            </Grid>
        </Container>
    </Box>
    );
}