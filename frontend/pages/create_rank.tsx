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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import Select from '@mui/material/Select';
import { SelectChangeEvent } from '@mui/material/Select';

import AppLayout from "@/components/AppLayout";
import { CreateRankFormData, ContentItem } from "@/utils/types"
import { getUserIdFromAccessToken, isUserLoggedIn } from "@/utils/auth";

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
// Dynamically import ReactQuill only on the client side
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });


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
  const [currentElement, setCurrentElement] = React.useState('');
  const [editingElementIndex, setEditingElementIndex] = React.useState<number | null>(null);
  const [currentEditedElement, setCurrentEditedElement] = React.useState('');

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
            console.log(JSON.stringify(formData))
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


  const removeElement = (indexToRemove: number) => {
    const newElements = elements.filter((_, index) => index !== indexToRemove);
    const newContent: { [key: string]: ContentItem } = {};

    newElements.forEach((value, index) => {
      const key = String.fromCharCode('a'.charCodeAt(0) + index);
      newContent[key] = {
        element: value,
        user_id: getUserIdFromAccessToken(),
      };
    });

    setElements(newElements);
    handleFormChange('content', newContent);
  };

  const handleQuillKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addElement();
    }
  };

  const handleEditQuillKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEditedElement();
    }
  };

  const addElement = () => {
    // Check if the currentElement is not just empty or whitespace
    console.log(currentElement)
    if (currentElement !== '<p><br></p><p><br></p>') {
      // Sanitize and add the element as before
      let sanitizedElement = currentElement
        .replace(/<br>/g, '')
        .replace(/<\/p><p>/g, '')
        .replace(/<p><br><\/p>$/, '');

      const newElements = [...elements, sanitizedElement];
      setElements(newElements);
      setCurrentElement('');
    } else {
      // Optionally, provide feedback to the user that input is required
      alert('Please enter some text before adding an element.');
    }
  };


  const saveEditedElement = () => {
    // Now save the edited element value to the elements array
    const updatedElements = elements.map((element, index) => {
      if (index === editingElementIndex) {
        let sanitizedElement = currentEditedElement
          .replace(/<br>/g, '')
          .replace(/<\/p><p>/g, '')
          .replace(/<p><br><\/p>$/, '');
        return sanitizedElement;
      }
      return element;
    });

    setElements(updatedElements);
    // Clear the edited values and close the editor
    setCurrentEditedElement('');
    setEditingElementIndex(null);
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
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, width: '100%' }}>
            <Box sx={{ flexGrow: 1, mr: 1 }}> {/* flexGrow allows the box to expand, mr adds some margin to the right */}
              <ReactQuill
                value={currentElement}
                onChange={setCurrentElement}
                onKeyDown={handleQuillKeyDown}
                theme="snow"
              />
            </Box>
            <IconButton onClick={addElement} color="primary" aria-label="add" sx={{ flexShrink: 0 }}> {/* flexShrink ensures the button doesn't shrink */}
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>

          {/* Elements list */}
          {elements.map((element, index) => (
            element && (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                {editingElementIndex === index ? (
                  <>
                    <ReactQuill
                      value={currentEditedElement}
                      onChange={(value) => setCurrentEditedElement(value)}
                      onKeyDown={(event) => handleEditQuillKeyDown(event)}
                      theme="snow"
                    />
                    <IconButton onClick={() => saveEditedElement()} color="primary">
                      <CheckIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography dangerouslySetInnerHTML={{ __html: element }} />
                    <IconButton onClick={() => {
                      setCurrentEditedElement(element);
                      setEditingElementIndex(index);
                    }} color="default">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => removeElement(index)} color="secondary">
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            )))}
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
