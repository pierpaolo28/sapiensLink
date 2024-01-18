import { Box, Button, Container, TextField, Typography } from '@mui/material';

import AppLayout from "@/components/AppLayout";

const TechStackPage: React.FC = () => {

    return (
        <AppLayout>
            <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 3 }}>

<Typography variant="h2" gutterBottom>
        Tech Stack
      </Typography>

      <Typography variant="body1" paragraph>
        SapiensLink was built using the following technologies: Django, Redis, Celery, NextJS, TypeScript, and Material UI.
      </Typography>

      <img src={'media/architecture_system.png'} alt="architecture_system" style={{ maxWidth: "100%" }} />

        </Container>
        </AppLayout>
    );
};

export default TechStackPage;
