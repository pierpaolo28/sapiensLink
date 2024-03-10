import { Container, Typography, Link } from "@mui/material";

import AppLayout from "@/components/AppLayout";

const TechStackPage: React.FC = () => {
  return (
    <AppLayout>
      <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 3 }}>
        <Typography variant="h2" gutterBottom>
          Tech Stack
        </Typography>

        <Typography variant="body1" paragraph>
          SapiensLink was built using the following technologies: Django, Redis,
          Celery, NextJS, TypeScript, and Material UI. If you liked this project, feel free to <Link href="https://github.com/pierpaolo28/sapiensLink">star in on Github</Link> and contribute!
        </Typography>

        <img
          src={"images/architecture_system.png"}
          alt="architecture_system"
          style={{ maxWidth: "100%" }}
        />

        <Typography variant="h2" gutterBottom>
          Our Vision
        </Typography>

        <img
          src={"images/roadmap.png"}
          alt="roadmap"
          style={{ maxWidth: "100%" }}
        />
      </Container>
    </AppLayout>
  );
};

export default TechStackPage;
