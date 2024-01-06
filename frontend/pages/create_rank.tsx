import * as React from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import AppLayout from "@/components/AppLayout";
import { CreateRankFormData, ContentItem } from "@/utils/types"
import { getUserIdFromAccessToken, isUserLoggedIn } from "@/utils/auth";


const CreateRankForm = () => {
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [elements, setElements] = React.useState<string[]>(['']);
  const [formData, setFormData] = React.useState<CreateRankFormData>({
    name: '',
    description: '',
    topic: [],
    contributors: [],
    content: {},
  });
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check if the user is logged in
    if (!isUserLoggedIn()) {
      // Redirect to the sign-in page
      window.location.href = '/signin';
    }
  }, [formData]);

  const handleTopicChange = (event: SelectChangeEvent<string[]>) => {
    const selectedTopicsData = (event.target.value as string[]).map((topicName) => ({ name: topicName }));
    setSelectedTopics(event.target.value as string[]);
    handleFormChange('topic', selectedTopicsData);
  };  
  

  const handleElementChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newElements = [...elements];
    newElements[index] = event.target.value;

    const newContent: { [key: string]: ContentItem } = { ...formData.content };
    const key = String.fromCharCode('a'.charCodeAt(0) + index);

    newContent[key] = {
      element: event.target.value,
      user_id: getUserIdFromAccessToken(),
    };

    setElements(newElements);
    handleFormChange('content', newContent);
  };

  const handleFormChange = (field: keyof CreateRankFormData, value: any) => {
    if (field === 'name') {
      const contributorsArray = [getUserIdFromAccessToken()];
      setFormData((prevData) => ({
        ...prevData,
        name: value,
        contributors: contributorsArray,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };
  

  const addElement = () => {
    const newElements = [...elements];
    const newContent: { [key: string]: ContentItem } = { ...formData.content };
    const key = String.fromCharCode('a'.charCodeAt(0) + newElements.length);

    newElements.push('');
    newContent[key] = {
      element: '',
      user_id: getUserIdFromAccessToken(),
    };

    setElements(newElements);
    handleFormChange('content', newContent);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    // Reset error state on each submission attempt
    setError(null);
  
    // Check if the mandatory fields are filled
    if (formData.name && formData.topic && formData.topic.length > 0) {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch('http://localhost/api/create_rank_page/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          window.location.href = '/rank_home';
        } else {
          // Handle server-side errors
          const responseData = await response.json();

          if (responseData.name) {
            // Display error for the 'name' field
            setError(`Name error: ${responseData.name.join(', ')}`);
          } else if (responseData.error) {
            if (responseData.error === 'Similar ranks found') {
              // Display a user-friendly error message for similar ranks
              setError(`Similar ranks found. Please check the existing ranks: ${responseData.similar_ranks.map((rank: any) => (
                '<a key=' + rank.id + ' href="/rank?id=' + rank.id + '">' + rank.name + '</a>'
              )).join(', ')}`);            
            } else {
              setError(responseData.message || 'Failed to submit the form');
            }
          } else {
            setError('An unexpected error occurred.');
          }
        }
      } catch (error) {
        console.error('Error submitting the form', error);
        setError('An unexpected error occurred.');
      }
    } else {
      setError('Please fill in all mandatory fields (Name and Topic).');
    }
  };
  
  
  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Rank
        </Typography>
        {error && (
          <Typography
          variant="body1"
          color="error"
          gutterBottom
          dangerouslySetInnerHTML={{ __html: error }}
        />        
        )}
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            id="name"
            label="Name"
            margin="normal"
            variant="outlined"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
          />
          <TextField
            fullWidth
            id="description"
            label="Description"
            multiline
            rows={4}
            placeholder="Enter description..."
            margin="normal"
            variant="outlined"
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
          />
          {elements.map((element, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <TextField
              fullWidth
              id={`element-${index}`}
              label="Element"
              value={element}
              onChange={(event) => handleElementChange(index, event)}
              margin="normal"
              variant="outlined"
            />
            {index === elements.length - 1 && (
              <IconButton onClick={addElement} color="primary">
                <AddCircleOutlineIcon />
              </IconButton>
            )}
          </Box>
          ))}
          <FormControl required fullWidth margin="normal" variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="topic-label">Topic</InputLabel>
            <Select
              labelId="topic-label"
              id="topic"
              multiple
              value={selectedTopics}
              onChange={handleTopicChange}
            >
              <MenuItem value="topic1">Topic 1</MenuItem>
              <MenuItem value="topic2">Topic 2</MenuItem>
              {/* ... other topics */}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="outlined" color="secondary" href='/rank_home'>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </AppLayout>
  );
};

export default CreateRankForm;
