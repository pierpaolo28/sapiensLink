import React from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import AppLayout from "@/components/AppLayout";

// TODO: Based on linking url decide if calling rank_report or List_report api endpoints and get from URL the id of the rank/list
const ReportForm = () => {
  return (
    <AppLayout>
    <Container maxWidth="sm">
      <Typography variant="h5" component="h1" gutterBottom>
        Report form for: TODO
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        TODO: Write Community conditions for valid report
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          fullWidth
          id="report-reason"
          label="Report Description"
          multiline
          rows={4}
          placeholder="Describe the issue..."
          margin="normal"
          variant="outlined"
        />
        <Box mt={2}>
          <Button variant="contained" color="primary">
            Report
          </Button>
        </Box>
      </Box>
    </Container>
    </AppLayout>
  );
};

export default ReportForm;
