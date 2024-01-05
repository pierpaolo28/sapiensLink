import React, { useEffect, useState, ChangeEvent } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import AppLayout from "@/components/AppLayout";
import { getUserIdFromAccessToken } from "@/utils/auth";
import { ListForm } from "@/utils/types";


export default function CreateListPage() {
  const [listDetails, setListDetails] = useState<ListForm>({
    name: '',
    description: '',
    content: '',
    source: '',
    public: true,
    topic: [],
  });
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
      // If ID exists, fetch data for update mode
      fetchListData(id);
    } else {
      // If no ID, set loading to false
      setIsLoading(false);
    }
  }, []);

  const fetchListData = async (id: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost/api/update_list_page/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setListDetails({
          name: data.name,
          description: data.description,
          content: data.content,
          source: data.source,
          public: data.public,
          topic: data.topic.map((topic: any) => topic.name),
        });
        setIsUpdateMode(true);
      } else {
        console.error('Error fetching list data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching list data:', error);
    } finally {
      // Set loading to false once data is fetched or an error occurs
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setListDetails((prevDetails) => ({
      ...prevDetails,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  

  const handleTopicChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    // 'value' will be a string[] for the multiple select
    setListDetails((prevDetails) => ({
      ...prevDetails,
      topic: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if the mandatory fields are filled
    if (listDetails.name && listDetails.topic) {
      // TODO: Validate the "content" field
      const contentRegex = /^(\d+\.\s|-\s|\*\s)?(?:[A-Za-z0-9\s]+|http[s]?:\/\/[^\s]+)/gm;
      if (contentRegex.test(listDetails.content)) {
        try {
          const accessToken = localStorage.getItem('access_token');
          let url = 'http://localhost/api/create_list_page';

          if (isUpdateMode) {
            const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
            url = `http://localhost/api/update_list_page/${id}/`;
          }

          // Include the participants field with the user ID of the current user
          const updatedListDetails = {
            ...listDetails,
            participants: [getUserIdFromAccessToken()],
            topic: listDetails.topic.map((topicName) => ({ name: topicName })),
          };

          const response = await fetch(url, {
            method: isUpdateMode ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updatedListDetails),
          });

          if (response.ok) {
            window.location.href = '/list_home';
          } else {
            console.error('Error creating/updating list:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error creating/updating list:', error);
        }
      } else {
        alert(
          'Content field should contain ordered/bulleted lists with each item being text or a valid webpage URL.'
        );
      }
    } else {
      alert('Please fill in all mandatory fields (Name and Topic).');
    }
  };
  
  if (isLoading) {
    // Render a loading screen while fetching data
    return <div>Loading...</div>;
  }

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
          {isUpdateMode ? 'Update List' : 'Create List'}
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
                    checked={listDetails.public}
                    onChange={handleInputChange}
                    name="public"
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
        renderValue={(selected) => selected.join(', ')}
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
              <Button variant="outlined" href="/list_home">
                Cancel
              </Button>
              <Button variant="contained" color="primary" type="submit" style={{ marginLeft: 8 }}>
                {isUpdateMode ? 'Update' : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}
