import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import AppLayout from "@/components/AppLayout";

const Custom404: React.FC = () => {
  return (
    <AppLayout>
    <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '100px' }}>
      <Typography variant="h1" color="primary">
        404 - Page Not Found
      </Typography>
      <Typography variant="h4" color="textSecondary">
        Oops! The page you are looking for might be in another castle.
      </Typography>
    </Container>
    </AppLayout>
  );
};

export default Custom404;
