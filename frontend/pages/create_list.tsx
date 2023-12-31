import React, { useState, ChangeEvent } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import AppLayout from "@/components/AppLayout";

type ListDetails = {
  name: string;
  description: string;
  content: string;
  source: string;
  isPublic: boolean;
  topic: string[];
};

export default function CreateListPage() {
  const [listDetails, setListDetails] = useState<ListDetails>({
    name: '',
    description: '',
    content: '',
    source: '',
    isPublic: true,
    topic: []
  });  

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setListDetails(prevDetails => ({
      ...prevDetails,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTopicChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    // 'value' will be a string[] for the multiple select
    setListDetails(prevDetails => ({
      ...prevDetails,
      topic: typeof value === 'string' ? value.split(',') : value,
    }));
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

  const topics = [
    { label: 'Finance', value: 'finance' },
    { label: 'Technology', value: 'technology' },
    { label: 'Health', value: 'health' },
    // Add more topics as needed
  ];

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
        id="topic-select"
        multiple
        value={listDetails.topic}
        onChange={handleTopicChange}
        name="topic"
        renderValue={(selected) => selected.join(', ')} // How the selected items will be displayed in the input
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 224,
              width: 250,
            },
          },
        }}
      >
        {topics.map((topic) => (
          <MenuItem key={topic.value} value={topic.value}>
            {topic.label}
          </MenuItem>
        ))}
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
