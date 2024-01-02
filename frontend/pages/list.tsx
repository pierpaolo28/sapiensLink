import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CssBaseline from '@mui/material/CssBaseline';
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

import AppLayout from "@/components/AppLayout";

// Define a type for the participant data
type Participant = {
  name: string;
  imageUrl: string;
};

// Define a type for the comment data
type Comment = {
  id: number;
  author: string;
  text: string;
  profileImageUrl: string;
};

const participants: Participant[] = [
  // Replace with your actual participants data
  { name: 'test2', imageUrl: '/path/to/avatar2.jpg' },
  { name: 'test', imageUrl: '/path/to/avatar.jpg' },
];

const initialComments: Comment[] = [
  // Replace with your actual comments data
  { id: 1, author: 'JaneDoe', text: 'Great article on personal finance!', profileImageUrl: '/path/to/avatar1.jpg' },
  { id: 2, author: 'JohnDoe', text: 'I would like to learn more about FIRE.', profileImageUrl: '/path/to/avatar2.jpg' },
  // ... more comments
];

const handleSaveList = () => {
  // Logic to save the list would go here
  // This could involve setting state or making an API call to your backend
  console.log('List saved!');
};

const HomePage = () => {
  // List of links data
  const linksData = [
    { name: "Retire In Progress", url: "https://retireinprogress.com" },
    { name: "Accidentally Retired", url: "https://accidentallyretired.com" },
    { name: "Portfolio Charts", url: "https://portfoliocharts.com" },
    { name: "Reddit Personal Finance", url: "https://reddit.com/r/personalfinance/wiki/index" },
    { name: "JustETF", url: "https://justetf.com/en" },
    { name: "Morning Star", url: "https://morningstar.com" },
    { name: "ETF.com", url: "https://etf.com/etfanalyticsetf-finder" },
    { name: "JL Collins", url: "https://jlcollinsnh.com" },
    { name: "Mr Money Mustache", url: "https://mrmoneymustache.com" },
    { name: "Mustachian Post Discussion Forum", url: "https://forum.mustachianpost.com" },
    { name: "Early Retirement Extreme", url: "https://earlyretirementextreme.com" },
    { name: "Investopedia", url: "https://investopedia.com" },
    { name: "Global Property Guide", url: "https://globalpropertyguide.com" },
    { name: "Optimized Portfolio", url: "https://optimizedportfolio.com" },
    { name: "Lazy Portfolio ETF", url: "https://lazyportfolioetf.com" },
    { name: "BogleHeads", url: "https://bogleheads.org/index.php" },
    { name: "Portfolio Visualizer (with Backtesting)", url: "https://portfoliovisualizer.com" },
    { name: "Wise Money (EU Investing)", url: "https://bankeronwheels.com" },
    { name: "Index Fund Investor (EU Investing)", url: "https://indexfundinvestor.eu" },
  ];

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');

  // Handler for adding new comment
  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // For demonstration, we're using Date.now() as a fake unique id and a placeholder image
      const newCommentData = {
        id: Date.now(),
        author: 'NewUser',
        text: newComment,
        profileImageUrl: '/path/to/newuser-avatar.jpg',
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

  const [isWatching, setIsWatching] = useState(false);

  const handleWatchToggle = (event: any) => {
    setIsWatching(event.target.checked);
  };


  return <AppLayout>
      <CssBaseline />
      <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Personal Finance & FIRE
                </Typography>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  Last activity: 6 minutes ago
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
                      Username
                    </Link>
                  </Typography>
                </Box>

                {/* Dynamic list of links */}
                <Box sx={{ mb: 2 }}>
                  {linksData.map((link, index) => (
                    <Typography key={index}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.name}
                      </a>
                    </Typography>
                  ))}
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
                    <BookmarkBorderIcon />
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
                        <Avatar alt={comment.author} src={comment.profileImageUrl} />
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
          </Grid>
          <Grid item xs={12} md={4}>
            {/* List Topics */}
            <Typography variant="h6" gutterBottom>
              List Topics
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
              <Chip label="Personal Finance" variant="outlined" sx={{ margin: '4px' }} />
              {/* Add more Chips for each topic */}
            </Box>
            <Typography variant="h6">Participants</Typography>
            <List>
              {participants.map((participant) => (
                <ListItem key={participant.name}>
                  <Avatar src={participant.imageUrl} />
                  <Typography variant="subtitle1" style={{ marginLeft: '10px' }}>
                    {participant.name}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Container>
    </AppLayout>
};

export default HomePage;
