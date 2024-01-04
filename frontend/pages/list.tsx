import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Link from '@mui/material/Link';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import ReportIcon from '@mui/icons-material/Report';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

import AppLayout from "@/components/AppLayout";
import { ListPageResponse } from "@/utils/types";

// Define a type for the comment data
type Comment = {
  id: number;
  author: string;
  text: string;
  avatar: string;
};

const initialComments: Comment[] = [
  // Replace with your actual comments data
  { id: 1, author: 'JaneDoe', text: 'Great article on personal finance!', avatar: '/path/to/avatar1.jpg' },
  { id: 2, author: 'JohnDoe', text: 'I would like to learn more about FIRE.', avatar: '/path/to/avatar2.jpg' },
  // ... more comments
];

const ListPage = () => {

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [list, setRank] = useState<ListPageResponse | null>(null);
  const [id, setId] = useState<string | null>(null);

  // Fetch list data based on the extracted id
  const fetchListData = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost/api/list_page/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setRank(data);
    } catch (error) {
      console.error('Error fetching list data:', error);
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
      fetchListData();
    }

    // Add any cleanup logic if needed
    return () => {
      // Cleanup logic here
    };
  }, [id]);

  // Handler for adding new comment
  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // For demonstration, we're using Date.now() as a fake unique id and a placeholder image
      const newCommentData = {
        id: Date.now(),
        author: 'NewUser',
        text: newComment,
        avatar: '/path/to/newuser-avatar.jpg',
      };
      setComments([...comments, newCommentData]);
      setNewComment('');
    }
  };

  const [votes, setVotes] = useState({ upvotes: 36, downvotes: 2 }); // Sample initial votes

  const handleVote = (voteType: 'up' | 'down') => {
    if (voteType === 'up') {
      setVotes((prevVotes) => ({ ...prevVotes, upvotes: prevVotes.upvotes + 1 }));
    } else {
      setVotes((prevVotes) => ({ ...prevVotes, downvotes: prevVotes.downvotes + 1 }));
    }
  };

  const handleSaveList = async () => {
    const isSaved = list && list.saved_list_ids.includes(list!.list.id);
    try {
      const accessToken = localStorage.getItem('access_token');

      const response = await fetch(`http://localhost/api/list_page/${list!.list.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ [isSaved ? 'unsave' : 'save']: true }),
      });

      if (response.ok) {
        fetchListData();
      } else {
        console.error(`Error ${isSaved ? 'unsaving' : 'saving'} rank:`, response.status, response.statusText);
        // Handle the error or provide feedback to the user
      }
    } catch (error) {
      console.error(`Error ${isSaved ? 'unsaving' : 'saving'} rank:`, error);
      // Handle the error or provide feedback to the user
    }
  };

  const [isWatching, setIsWatching] = useState(false);

  const handleWatchToggle = (event: any) => {
    setIsWatching(event.target.checked);
  };


  return <AppLayout>
    <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          {list && list.list && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {list.list.name}
                </Typography>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  Last activity: {new Date(list.list.updated).toLocaleString()}
                </Typography>

                <Box>
                  <Typography component="span" sx={{ mr: 1 }}>
                    {isWatching ? 'Unwatch' : 'Watch'} List
                  </Typography>
                  <Switch
                    checked={isWatching}
                    onChange={handleWatchToggle}
                    color="primary"
                  />
                </Box>

                <Box
                  display="flex"
                  justifyContent="center" // Centers horizontally
                  alignItems="center" // Centers vertically
                  mb={2}
                >
                  <Avatar src="/path/to/profile-image.jpg" alt="Profile image" sx={{ marginRight: 2 }} />
                  <Typography variant="subtitle1">
                    <Link href="/user_profile" color="inherit" underline="hover">
                      {list.list.author}
                    </Link>
                  </Typography>
                </Box>

                {/* Dynamic list of links */}
                <Box sx={{ mb: 2 }}>
                  <Typography>
                    {list.list.content}
                  </Typography>
                </Box>

                <CardActions>
                  <IconButton aria-label="upvote" onClick={() => handleVote('up')}>
                    <ArrowUpwardIcon />
                  </IconButton>
                  <Typography variant="subtitle1">
                    {votes.upvotes - votes.downvotes} {/* Display total score */}
                  </Typography>
                  <IconButton aria-label="downvote" onClick={() => handleVote('down')}>
                    <ArrowDownwardIcon />
                  </IconButton>
                  <IconButton aria-label="save list" onClick={handleSaveList}>
                    {list && list.saved_list_ids.includes(list!.list.id) ? (
                      <BookmarkIcon /> // Use the icon for saved state, e.g., BookmarkIcon
                    ) : (
                      <BookmarkBorderIcon /> // Use the icon for unsaved state
                    )}
                  </IconButton>

                  <Button startIcon={<EditIcon />} size="small" href="list_pr">
                    Suggest Edit
                  </Button>
                  <Button startIcon={<ReportIcon />} size="small" href="report">
                    Report
                  </Button>
                </CardActions>
              </CardContent>
              {/* Comment section */}
              <CardContent>
                {/* Comments List */}
                <List>
                  {comments.map((comment) => (
                    <ListItem key={comment.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar alt={comment.author} src={comment.avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={comment.author}
                        secondary={comment.text}
                      />
                    </ListItem>
                  ))}
                </List>
                {/* Comment Input Section */}
                <Box sx={{ my: 2 }}>
                  <TextField
                    label="Add a comment"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    margin="normal"
                  />
                  <Button variant="contained" color="primary" onClick={handleCommentSubmit}>
                    Post Comment
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {/* List Topics */}
          <Typography variant="h6" gutterBottom>
            List Topics
          </Typography>
          {list && list.list && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
              {list.list.topic.map((topic) => (
                <a key={topic.id} href={`/list_home?q=${topic.name}`}>
                  <Chip key={topic.id} label={topic.name} variant="outlined" sx={{ margin: '4px' }} />
                </a>
              ))}
            </Box>
          )}
          <Typography variant="h6">Participants</Typography>
          {list && list.participants && (
            <List>
              {list.participants.map((participant) => (
                <ListItem key={participant.name}>
                  <Avatar src={participant.avatar} />
                  <a href={`/user_profile?id=${participant.id}`}>
                    <Typography variant="subtitle1" style={{ marginLeft: '10px' }}>
                      {participant.name}
                    </Typography>
                  </a>
                </ListItem>
              ))}
            </List>
          )}
        </Grid>
      </Grid>
    </Container>
  </AppLayout>
};

export default ListPage;
