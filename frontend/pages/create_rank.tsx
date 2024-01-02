import * as React from 'react';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import AppLayout from "@/components/AppLayout";

const CreateRankForm = () => {
  const [selectedTopics, setSelectedTopics] = React.useState([]);
  const [elements, setElements] = React.useState(['']);

  const handleTopicChange = (event: any) => {
    setSelectedTopics(event.target.value);
  };

  const handleElementChange = (index: any, event: any) => {
    const newElements = [...elements];
    newElements[index] = event.target.value;
    setElements(newElements);
  };

  const addElement = () => {
    setElements([...elements, '']);
  };

  return (
    <AppLayout>
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create Rank
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          required
          fullWidth
          id="name"
          label="Name"
          margin="normal"
          variant="outlined"
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
            // The renderValue prop is used to display the selected options in chips
            // Add the chip component if you want to show the selected topics as chips
          >
            <MenuItem value="topic1">Topic 1</MenuItem>
            <MenuItem value="topic2">Topic 2</MenuItem>
            {/* ... other topics */}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" color="secondary">
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
