// pages/about.tsx
import React from 'react';
import Head from 'next/head';
import { Container, Typography, Grid, Paper, Avatar, IconButton } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

import AppLayout from "@/components/AppLayout";

const TeamMembers = [
  {
    name: 'Pier',
    avatar: '',
    position: 'CEO',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.',
    url: 'https://ppiconsulting.dev',
  },
  {
    name: 'Tiph',
    avatar: '',
    position: 'CMO',
    bio: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
    url: '',
  },
  {
    name: 'Frapa',
    avatar: '',
    position: 'CTO',
    bio: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
    url: '',
  },
  {
    name: 'Serena',
    avatar: '',
    position: 'CPO',
    bio: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
    url: '',
  },
  {
    name: 'Danilo',
    avatar: '',
    position: 'DevOps',
    bio: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
    url: '',
  },
];

const AboutPage: React.FC = () => {
  return (
    <AppLayout>
    <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 3 }}>
      <Head>
        <title>About Us</title>
        <meta name="description" content="Learn more about our team and company." />
      </Head>

      <Typography variant="h2" gutterBottom>
        About Us
      </Typography>

      <Typography variant="body1" paragraph>
        SapiensLink was created by a team of higly interdisciplanary individuals who are passionate about learning and sharing knowledge. 
        If you are interested in joining our team or supporting us, please reach out to us directly or through or contacts page.
      </Typography>

      <Typography variant="h4" gutterBottom>
        Our Team
      </Typography>

      <Grid container spacing={3} justifyContent='space-around'>
        {TeamMembers.map((member, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
              <Avatar alt={member.name} src={member.avatar} sx={{ width: 100, height: 100, margin: 'auto' }} />
              <Typography variant="h6" gutterBottom>
                {member.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {member.position}
              </Typography>
              <Typography variant="body2" paragraph>
                {member.bio}
              </Typography>
              <IconButton component="a" href={member.url} target="_blank" rel="noopener noreferrer">
                <LinkedInIcon />
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
