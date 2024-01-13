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
import Select from '@mui/material/Select';
import { SelectChangeEvent } from '@mui/material/Select';
import { Switch } from '@mui/material';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

import AppLayout from "@/components/AppLayout";
import { getUserIdFromAccessToken, isUserLoggedIn } from "@/utils/auth";
import { ListForm } from "@/utils/types";
import BulletNumberTextArea from '@/components/BulletNumberTextArea';

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
  const [error, setError] = useState<string | null>(null);
  const [selectedEditor, setSelectedEditor] = useState('quill'); // Default to 'quill'

  const handleBulletNumberTextAreaChange = (content: string) => {
    // Initialize a local variable to store the updated content
    let updatedContent = '';
  
    updatedContent = convertPlainTextToHtml(content);
  
    // Update the content in listDetails with the local variable
    setListDetails((prevDetails) => ({
      ...prevDetails,
      content: updatedContent,
    }));
  };
  

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!isUserLoggedIn()) {
      window.location.href = '/signin';
    }

    if (id) {
      fetchListData(id);
    } else {
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
      setIsLoading(false);
    }
  };

  const convertPlainTextToHtml = (plainText: string) => {
    const lines = plainText.split(/\r?\n/);
    let html = '';
  
    let isNumbered = false;
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
  
      if (line.match(/^\d+\./)) {
        // Detect numbered list item
        if (!isNumbered) {
          // Start a numbered list
          html += '<ol>';
          isNumbered = true;
        }
  
        // Remove the numbering (e.g., 1.)
        const textWithoutNumbering = line.replace(/^\d+\.\s*/, '');
  
        // Extract the text and link from the line
        const parts = textWithoutNumbering.split(' ');
        const text = parts.slice(0, parts.length - 1).join(' ');
        const link = parts[parts.length - 1];
  
        if (link.startsWith('http')) {
          // Create an HTML link within a list item if the link is present
          html += `<li><a href="${link}" target="_blank">${text}</a></li>`;
        } else {
          // Create a list item without an href if there is no link
          html += `<li>${textWithoutNumbering}</li>`;
        }
      } else {
        if (isNumbered) {
          // Close the numbered list
          html += '</ol>';
          isNumbered = false;
        }
  
        if (line.startsWith('•')) {
          // Detect bulleted list item
          if (!html.includes('<ul>')) {
            // Start a bulleted list if not already started
            html += '<ul>';
          }
  
          // Remove the bullet character (•)
          const textWithoutBullet = line.replace(/^•\s*/, '');
  
          // Extract the text and link from the line
          const parts = textWithoutBullet.split(' ');
          const text = parts.slice(0, parts.length - 1).join(' ');
          const link = parts[parts.length - 1];
  
          if (link.startsWith('http')) {
            // Create an HTML link within a list item if the link is present
            html += `<li><a href="${link}" target="_blank">${text}</a></li>`;
          } else {
            // Create a list item without an href if there is no link
            html += `<li>${textWithoutBullet}</li>`;
          }
        } else {
          // If the line doesn't start with '•' or numbering, treat it as plain text
          if (html.includes('<ul>')) {
            // Close the bulleted list if it's open
            html += '</ul>';
          } else if (isNumbered) {
            // Close the numbered list if it's open
            html += '</ol>';
          }
          html += `${line}<br>`;
        }
      }
    }
  
    if (isNumbered) {
      // Close the numbered list if it's still open
      html += '</ol>';
    }
  
    if (html.includes('<ul>')) {
      // Close the bulleted list if it's open
      html += '</ul>';
    }
  
    return html;
  };  


  const handleQuillChange = (value: string) => {
    setListDetails((prevDetails) => ({
      ...prevDetails,
      content: value,
    }));
  };

  const handleEditorSwitch = (editor: string) => {
    setSelectedEditor(editor);

    // Clear the content when switching to Quill Editor
    if (editor === 'quill') {
      setListDetails((prevDetails) => ({
        ...prevDetails,
        content: '', // Clear the content
      }));
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
    setListDetails((prevDetails) => ({
      ...prevDetails,
      topic: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const isValidListContent = (content: any) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const items = div.querySelectorAll('ol, ul');
    return div.childNodes.length === items.length; // Check if all child nodes are lists
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (selectedEditor === 'bulletNumberTextArea') {
      // Convert the plain text to HTML
      const contentHtml = convertPlainTextToHtml(listDetails.content);

      // Update the content in listDetails
      setListDetails((prevDetails) => ({
        ...prevDetails,
        content: contentHtml,
      }));
    }

    if (selectedEditor === 'quill') {
      // Validate content
      if (!isValidListContent(listDetails.content)) {
        setError('Content must be in bullet or numbered list format.');
        return;
      }
      // Content comes from Quill Editor
      // Set it in listDetails.content if needed
      setListDetails((prevDetails) => ({
        ...prevDetails,
        content: listDetails.content, // Set content from Quill Editor if needed
      }));
    }

    if (listDetails.name && listDetails.topic && listDetails.topic.length > 0) {
      try {
        const accessToken = localStorage.getItem('access_token');
        let url = 'http://localhost/api/create_list_page';

        if (isUpdateMode) {
          const urlParams = new URLSearchParams(window.location.search);
          const id = urlParams.get('id');
          url = `http://localhost/api/update_list_page/${id}/`;
        }

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
          const responseData = await response.json();
          setError(responseData.message || 'Failed to submit the form');
        }
      } catch (error) {
        console.error('Error creating/updating list:', error);
        setError('An unexpected error occurred.');
      }
    } else {
      setError('Please fill in all mandatory fields (Name, Content, and Topic).');
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
    // TODO: Add more topics as needed
  ];

  return (
    <AppLayout>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          {isUpdateMode ? 'Update List' : 'Create List'}
        </Typography>
        {error && (
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
        )}
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
              <div style={{ marginBottom: '10px' }}>
                <InputLabel id="content-label">Content</InputLabel>
              </div>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedEditor === 'bulletNumberTextArea'}
                    onChange={() => handleEditorSwitch(selectedEditor === 'quill' ? 'bulletNumberTextArea' : 'quill')}
                  />
                }
                label={selectedEditor === 'quill' ? 'Create list' : 'Import list'}
              />

              {/* Conditional Rendering of Editors */}
              {selectedEditor === 'quill' ? (
                <FormControl fullWidth>
                  <ReactQuill
                    id="content"
                    value={listDetails.content}
                    onChange={handleQuillChange}
                    modules={{
                      toolbar: [
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link'] // Only allow bullet and numbered lists
                      ],
                    }}
                  />
                </FormControl>
              ) : (
                <BulletNumberTextArea
                  onContentChange={handleBulletNumberTextAreaChange}
                />
              )}
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
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}> 
              <Button variant="outlined" color="secondary" href="/list_home">
                Cancel
              </Button>
              <Button variant="contained" color="primary" type="submit">
                {isUpdateMode ? 'Update' : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}
