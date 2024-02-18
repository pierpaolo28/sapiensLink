import React from 'react';
import { Button, Paper, Typography, Box } from '@mui/material';

const FallbackErrorComponent = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px', textAlign: 'center' }}>
      <Typography variant="h5" color="error" gutterBottom>
        Oops! Something went wrong.
      </Typography>
      <Typography variant="body1" gutterBottom>
        An unexpected error has occurred. We apologize for any inconvenience.
      </Typography>
      <Box marginTop={2}>
        <Button variant="contained" color="primary" onClick={handleReload}>
          Reload Page
        </Button>
      </Box>
    </Paper>
  );
};

export default FallbackErrorComponent;