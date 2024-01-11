import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import CardActions from '@mui/material/CardActions';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReportIcon from '@mui/icons-material/Report';
import ShareIcon from '@mui/icons-material/Share';
import Link from 'next/link';

import AppLayout from "@/components/AppLayout";
import { RankPageResponse } from "@/utils/types";
import { getUserIdFromAccessToken, isUserLoggedIn } from "@/utils/auth";

// Dynamically import ReactQuill only on the client side
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import the styles for the react-quill component


export default function RankPage() {
    const [rank, setRank] = useState<RankPageResponse | null>(null);
    const [newItemText, setNewItemText] = useState('');
    const [id, setId] = useState<string | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editedElement, setEditedElement] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // Fetch rank data based on the extracted id
    const fetchRankData = async () => {
        try {
            const headers: {
                'Content-Type': string;
                'Authorization'?: string;
            } = {
                'Content-Type': 'application/json',
            };

            // Check if the user is logged in
            if (isUserLoggedIn()) {
                const accessToken = localStorage.getItem('access_token');
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const response = await fetch(`http://localhost/api/rank_page/${id}/`, {
                method: 'GET',
                headers: headers,
            });

            const data = await response.json();
            setRank(data);
        } catch (error) {
            console.error('Error fetching rank data:', error);
            setError('An unexpected error occurred while fetching rank data.');
        }
    };


    useEffect(() => {
        // Extract the id parameter from the current URL
        const urlParams = new URLSearchParams(window.location.search);
        const extractedId = urlParams.get('id');

        // Update the id state if it is different
        if (extractedId !== id) {
            setId(extractedId);
        }

        // Fetch data only if id is present
        if (id) {
            fetchRankData();
        }
    }, [id]);


    const handleVote = async (contentIndex: number, action: string) => {
        if (!isUserLoggedIn()) {
            window.location.href = '/signin';
        }

        try {
            // Extracting the rank IDs from the content object
            const accessToken = localStorage.getItem('access_token');
            const rankIds = Object.keys(rank!.rank.content);

            // Using the extracted rank ID for the API call
            const response = await fetch(`http://localhost/api/vote_rank/${rank!.rank.id}/${rankIds[contentIndex]}/${action}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                console.log(`Vote successful for rank ${rankIds[contentIndex]}, action: ${action}`);
                // Reload the page after a successful vote
                fetchRankData();
            } else {
                console.error('Vote failed:', response.status, response.statusText);
                setError('Failed to vote. Please try again.');
            }
        } catch (error) {
            console.error('Error voting:', error);
            setError('An unexpected error occurred while processing your vote.');
        }
    };

    const handleEdit = (index: number) => {
        const rankIds = Object.keys(rank!.rank.content);
        const elementIndex = rankIds[index];
      
        // Set the initial value of editedElement to the existing value
        setEditedElement(rank!.rank.content[elementIndex].element);
        setEditingIndex(index);
        setIsEditing(true);
      };
      
      const handleBlur = () => {
        // Cancel the edit operation when the component loses focus
        setEditingIndex(null);
        setIsEditing(false);
      };


    const updateElement = async (index: number, editedElement: string) => {
        if (!isUserLoggedIn()) {
            window.location.href = '/signin';
        }

        try {
            // Extracting the rank IDs from the content object
            const accessToken = localStorage.getItem('access_token');
            const rankIds = Object.keys(rank!.rank.content);

            // Using the extracted rank ID for the API call
            const elementIndex = rankIds[index];
            const response = await fetch(`http://localhost/api/rank_page/${rank!.rank.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ edit_element_index: elementIndex, edit_element: editedElement }),
            });

            if (response.ok) {
                fetchRankData();
            } else {
                console.error('Error editing element:', response.status, response.statusText);
                // Handle the error or provide feedback to the user
            }
        } catch (error) {
            console.error('Error editing element:', error);
            // Handle the error or provide feedback to the user
        }
        // Reset the editing index after updating
        setEditingIndex(null);
    };


    const addItem = async (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!isUserLoggedIn()) {
          window.location.href = '/signin';
        }
      
        try {
          if (event.key === 'Enter' && newItemText.trim()) {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost/api/rank_page/${rank!.rank.id}/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ element: newItemText }),
            });
      
            if (response.ok) {
              setNewItemText("");
              fetchRankData();
            } else {
              console.error('Error adding new item:', response.status, response.statusText);
              setError('Failed to add a new item. Please try again.');
            }
          }
        } catch (error) {
          console.error('Error adding new item:', error);
          setError('An unexpected error occurred while adding a new item.');
        }
      };
      

    const handleDelete = async (index: number) => {
        if (!isUserLoggedIn()) {
            window.location.href = '/signin';
        }

        try {
            const elementIndex = Object.keys(rank!.rank.content)[index];
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost/api/rank_page/${rank!.rank.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ delete_element_index: elementIndex }),
            });

            if (response.ok) {
                fetchRankData();
            } else {
                console.error('Error deleting item:', response.status, response.statusText);
                setError('Failed to delete the item. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('An unexpected error occurred while deleting the item.');
        }
    };

    const toggleWatchStatus = async () => {
        if (!isUserLoggedIn()) {
            window.location.href = '/signin';
        }

        try {
            const accessToken = localStorage.getItem('access_token');
            const isSubscribed = rank?.is_subscribed || false;
            const action = isSubscribed ? 'unsubscribe' : 'subscribe';

            const response = await fetch(`http://localhost/api/manage_subscription/rank/${rank!.rank.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                fetchRankData();
            } else {
                console.error('Error toggling watch status:', response.status, response.statusText);
                // Handle the error or provide feedback to the user
            }
        } catch (error) {
            console.error('Error toggling watch status:', error);
            // Handle the error or provide feedback to the user
        }
    };



    const handleSaveUnsaveRank = async () => {
        if (!isUserLoggedIn()) {
            window.location.href = '/signin';
        }

        const isSaved = rank && rank.saved_ranks_ids.includes(rank!.rank.id);
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost/api/rank_page/${rank!.rank.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ [isSaved ? 'unsave' : 'save']: true }),
            });

            if (response.ok) {
                fetchRankData();
            } else {
                console.error(`Error ${isSaved ? 'unsaving' : 'saving'} rank:`, response.status, response.statusText);
                // Handle the error or provide feedback to the user
            }
        } catch (error) {
            console.error(`Error ${isSaved ? 'unsaving' : 'saving'} rank:`, error);
            // Handle the error or provide feedback to the user
        }
    };

    const handleReport = () => {
        if (!isUserLoggedIn()) {
            window.location.href = '/signin';
        } else {
            window.location.href = '/report';
        }
    };

    const handleCopyLink = async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          console.log('Link copied to clipboard');
        } catch (error: any) {
          console.error('Error copying link to clipboard:', error.message);
        }
      };

    return (
        <AppLayout>
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            {error && (
                                <Typography variant="body1" color="error" gutterBottom>
                                    {error}
                                </Typography>
                            )}
                            {rank && rank.rank && (
                                <>
                                    <Typography variant="h4" gutterBottom>
                                        {rank.rank.name}
                                    </Typography>

                                    {/* Last activity and watch toggle */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body1">
                                            Last Activity: {new Date(rank.rank.updated).toLocaleString()}
                                        </Typography>
                                        <FormControlLabel
                                            control={<Switch checked={rank.is_subscribed} onChange={toggleWatchStatus} />}
                                            label={rank.is_subscribed ? 'Unwatch Rank' : 'Watch Rank'}
                                        />
                                    </Box>

                                    <Typography variant="subtitle1" gutterBottom>
                                        {rank.rank.description}
                                    </Typography>

                                    {/* Overall score */}
                                    <Typography variant="body2" gutterBottom>
                                        Overall Score: {rank.rank.score}
                                    </Typography>

                                    <Card variant="outlined" sx={{ mb: 4 }}>
                    <CardContent>
                      <List>
                        {Object.entries(rank.rank.content)
                          .map(([key, element], index) => ({
                            key,
                            element,
                            score: rank.content_scores[key] || 0,
                            originalIndex: index,
                          }))
                          .sort((a, b) => b.score - a.score)
                          .map((sortedElement, index) => (
                            <ListItem key={index}>
                              {editingIndex === sortedElement.originalIndex ? (
                               <ReactQuill
                               value={editedElement}
                               onChange={(value) => setEditedElement(value)}
                               onBlur={handleBlur}
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                   e.preventDefault(); // Prevent the default behavior of adding a new line
                                   updateElement(sortedElement.originalIndex, editedElement);
                                   setIsEditing(false);
                                 }
                               }}
                               modules={{
                                 toolbar: [
                                   [{ 'header': [1, 2, false] }],
                                   ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                   [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                   ['link'],
                                   ['clean'],
                                 ],
                               }}
                               formats={[
                                 'header',
                                 'bold', 'italic', 'underline', 'strike', 'blockquote',
                                 'list', 'bullet', 'indent',
                                 'link',
                               ]}
                             />
                              
                              ) : (
                                <Grid container alignItems="center">
                                  <Grid item xs>
                                    {/* Rendering HTML content correctly */}
                                    <ListItemText primary={<div dangerouslySetInnerHTML={{ __html: sortedElement.element.element }} />} />
                                  </Grid>
                                                                    <Grid item>
                                                                        <IconButton onClick={() => handleVote(sortedElement.originalIndex, 'upvote')}><ArrowUpwardIcon /></IconButton>
                                                                        <IconButton onClick={() => handleVote(sortedElement.originalIndex, 'downvote')}><ArrowDownwardIcon /></IconButton>
                                                                        {(sortedElement.element.user_id == getUserIdFromAccessToken()) && (
                                                                            <>
                                                                                <IconButton onClick={() => handleEdit(sortedElement.originalIndex)}><EditIcon /></IconButton>
                                                                                <IconButton onClick={() => handleDelete(sortedElement.originalIndex)}><DeleteIcon /></IconButton>
                                                                            </>
                                                                        )}
                                                                        <Box component="span" sx={{ ml: 2, mr: 2 }}>
                                                                            {sortedElement.score}
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            )}
                                                        </ListItem>
                                                    ))}
                                                <ListItem>
                          <ReactQuill
                            value={newItemText}
                            onChange={(value) => setNewItemText(value)}
                            onKeyDown={(e) => addItem(e)} 
                            modules={{
                              toolbar: [
                                [{ 'header': [1, 2, false] }],
                                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                ['link'],
                                ['clean'],
                              ],
                            }}
                            formats={[
                              'header',
                              'bold', 'italic', 'underline', 'strike', 'blockquote',
                              'list', 'bullet', 'indent',
                              'link',
                            ]}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                                        <CardActions>
                                            <Button variant="contained" onClick={handleSaveUnsaveRank} sx={{ mr: 1 }}>
                                                {rank && rank.saved_ranks_ids.includes(rank!.rank.id) ? 'Unsave' : 'Save'}
                                            </Button>
                                            <Button startIcon={<ReportIcon />} size="small" onClick={handleReport}>
                                                Report
                                            </Button>
                                            <IconButton onClick={handleCopyLink} color="primary">
                  <ShareIcon />
                </IconButton>
                                        </CardActions>
                                    </Card>
                                </>
                            )}
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" gutterBottom>
                                Rank Topics
                            </Typography>
                            {rank && rank.rank && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                                    {rank.rank.topic.map((topic) => (
                                        <Link key={topic.id} href={`/rank_home?q=${topic.name}`} passHref>
                                            <Chip key={topic.id} label={topic.name} variant="outlined" sx={{ margin: '4px' }} />
                                        </Link>
                                    ))}
                                </Box>
                            )}

                            <Typography variant="h6" gutterBottom>
                                Contributors
                            </Typography>
                            {rank && rank.contributors && (
                                <List>
                                    {rank.contributors.map((contributor, index) => (
                                        <ListItem key={index}>
                                            <Avatar src={`http://localhost/static/${contributor.avatar}`} alt={contributor.name} />
                                            <Link key={contributor.id} href={`/user_profile?id=${contributor.id}`} passHref>
                                                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                                    {contributor.name}
                                                </Typography>
                                            </Link>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </AppLayout>
    );
}
