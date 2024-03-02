// pages/about.tsx
import React from "react";
import Head from "next/head";
import { Container, Typography } from "@mui/material";

import AppLayout from "@/components/AppLayout";

const VisionPage: React.FC = () => {
  return (
    <AppLayout>
      <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 3, px: 0 }}>
        <Head>
          <title>Our Vision</title>
          <meta
            name="description"
            content="Learn more about SapiensLink vision."
          />
        </Head>

        <Typography variant="h2" gutterBottom>
          Our Vision
        </Typography>

        <div style={{ textAlign: "center" }}>
          <img
            src={"images/sapiensnaut.png"}
            alt="architecture_system"
            style={{
              maxWidth: "50%",
              display: "block",
              margin: "auto",
              marginBottom: "20px",
            }}
          />
        </div>

        <Typography variant="body1" paragraph>
          SapiensLink main objective is to make complex educational content
          accessible and to empower individual creators to make their creations
          accessible to wider audiences without losing their ownership. In order
          to unlock this vision, we are planning to create a space where
          information can consumed in different possible ways and Sapionauts can
          be provided with automatically generated tests to validate and prove
          newly acquired expertise.
        </Typography>

        <Typography variant="h4" gutterBottom>
          TODO: Roadmap Image
        </Typography>
      </Container>
    </AppLayout>
  );
};

export default VisionPage;
