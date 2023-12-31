import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import AppLayout from "@/components/AppLayout";

export default function CreateListPage() {
  const [listDetails, setListDetails] = useState({
    name: '',
    description: '',
    content: '',
    source: '',
    isPublic: true,
    topic: ''
  });

  const handleInputChange = (event: any) => {
    const { name, value, checked, type } = event.target;
    setListDetails({
      ...listDetails,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();

    // Check if the mandatory fields are filled
    if (listDetails.name && listDetails.topic) {
      // TODO: Validate the "content" field
      const contentRegex = /^(\d+\.\s|-\s|\*\s)?(?:[A-Za-z0-9\s]+|http[s]?:\/\/[^\s]+)/gm;
      if (contentRegex.test(listDetails.content)) {
        console.log(listDetails);
        // Submit logic goes here
      } else {
        alert('Content field should contain ordered/bulleted lists with each item being text or a valid webpage URL.');
      }
    } else {
      alert('Please fill in all mandatory fields (Name and Topic).');
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          Create/Update List
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={listDetails.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={listDetails.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                name="content"
                multiline
                rows={4}
                value={listDetails.content}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Source"
                name="source"
                value={listDetails.source}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={listDetails.isPublic}
                    onChange={handleInputChange}
                    name="isPublic"
                  />
                }
                label="Public"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="topic-label">Topic</InputLabel>
                <Select
                  labelId="topic-label"
                  label="Topic"
                  value={listDetails.topic}
                  onChange={handleInputChange}
                  name="topic"
                  required
                >
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="technology">Technology</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" onClick={() => { /* logic to cancel */ }}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" type="submit" style={{ marginLeft: 8 }}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}
