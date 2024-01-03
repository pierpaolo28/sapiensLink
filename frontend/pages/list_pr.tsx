import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import AppLayout from "@/components/AppLayout";

interface DiffResult {
    added?: boolean;
    removed?: boolean;
    value: string;
}

interface Comment {
    id: string;
    suggestionId: string;
    text: string;
    author: string;
    avatar: string;
}

interface Suggestion {
    id: string;
    oldList: string;
    newList: string;
    comments: Comment[];
}

// Function to style the modal
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '70%',
    overflow: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};
// Mock data for suggestions and comments
const initialSuggestions: Suggestion[] = [
    {
        id: '1',
        oldList: 'Old list content for suggestion 1...',
        newList: 'New list content for suggestion 1...',
        comments: [
            {
                id: 'c1',
                suggestionId: '1',
                text: 'This is a great suggestion!',
                author: 'Jane Doe',
                avatar: 'path_to_jane_doe_avatar.jpg',
            },
            // More comments associated with suggestion 1
        ],
    },
    {
        id: '2',
        oldList: 'Old list content for suggestion 2...',
        newList: 'New list content for suggestion 2...',
        comments: [
            {
                id: 'c2',
                suggestionId: '2',
                text: 'I think this could be improved.',
                author: 'John Smith',
                avatar: 'path_to_john_smith_avatar.jpg',
            },
            // More comments associated with suggestion 2
        ],
    },
    // More suggestions
];

export default function ListPr() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
    const [selectedSuggestionId, setSelectedSuggestionId] = useState<string>('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [newCommentText, setNewCommentText] = useState('');

    useEffect(() => {
        if (suggestions.length > 0) {
            const firstSuggestion = suggestions[0];
            setSelectedSuggestionId(firstSuggestion.id);
            setComments(firstSuggestion.comments);
            // ... set other states based on the first suggestion if needed
        }
    }, [suggestions]);

    useEffect(() => {
        const selectedSuggestion = suggestions.find(s => s.id === selectedSuggestionId);
        if (selectedSuggestion) {
            setComments(selectedSuggestion.comments);
            // ... set other states based on the selected suggestion if needed
        }
    }, [selectedSuggestionId]);

    const [diffResults, setDiffResults] = useState<DiffResult[]>([]);


    const handleAccept = () => {
        console.log('Accepted suggestion with id:', selectedSuggestionId);
        // Handle accept logic here
    };

    const handleReject = () => {
        console.log('Rejected suggestion with id:', selectedSuggestionId);
        // Handle reject logic here
    };

    // Placeholder function for diffing text
    const calculateDiff = (oldText: string, newText: string): DiffResult[] => {
        // Use a real diffing library here
        return [
            { added: true, value: 'This line was added.\n' },
            { removed: true, value: 'This line was removed.\n' },
            { value: 'This line is unchanged.\n' }
        ];
    };

    const handleAddComment = () => {
        const newComment: Comment = {
            id: `comment-${Date.now()}`, // This is a placeholder for a real unique ID
            suggestionId: selectedSuggestionId,
            text: newCommentText,
            author: 'Current User', // Replace with the actual author's name
            avatar: '/path/to/avatar.jpg', // Replace with the actual avatar path
        };
        setComments(prevComments => [...prevComments, newComment]);
        setNewCommentText('');
        // Here you would also add the new comment to the corresponding suggestion in your backend
    };

    const findSuggestionIndex = (id: any) => suggestions.findIndex((s) => s.id === id);

    const handlePrevSuggestion = () => {
        const currentIndex = findSuggestionIndex(selectedSuggestionId);
        if (currentIndex > 0) {
            const prevSuggestion = suggestions[currentIndex - 1];
            setSelectedSuggestionId(prevSuggestion.id);
            const diff = calculateDiff(prevSuggestion.oldList, prevSuggestion.newList);
            setDiffResults(diff);
        }
    };

    const handleNextSuggestion = () => {
        const currentIndex = findSuggestionIndex(selectedSuggestionId);
        if (currentIndex < suggestions.length - 1) {
            const nextSuggestion = suggestions[currentIndex + 1];
            setSelectedSuggestionId(nextSuggestion.id);
            const diff = calculateDiff(nextSuggestion.oldList, nextSuggestion.newList);
            setDiffResults(diff);
        }
    };

    useEffect(() => {
        if (suggestions.length > 0) {
            setSelectedSuggestionId(suggestions[0].id);
            const diff = calculateDiff(suggestions[0].oldList, suggestions[0].newList);
            setDiffResults(diff);
        }
    }, []); // Empty dependency array ensures this effect runs once on mount

    // State for the new suggestion input
    const [editSuggestion, setEditSuggestion] = useState('');

    // State to manage the currently selected suggestion's old list
    const [currentOldList, setCurrentOldList] = useState('');

    // Whenever the selected suggestion changes, update the current old list
    useEffect(() => {
        const selectedSuggestion = suggestions.find(s => s.id === selectedSuggestionId);
        if (selectedSuggestion) {
            setCurrentOldList(selectedSuggestion.oldList);
            setEditSuggestion(selectedSuggestion.oldList); // Prepopulate with old list
        }
    }, [selectedSuggestionId, suggestions]);

    // Function to handle submit of the edit suggestion
    const handleSubmitEditSuggestion = () => {
        // Here you would handle the submission, such as sending it to a server
        console.log('Submitting edit suggestion:', editSuggestion);
    };

    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    return (
            <AppLayout>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Grid item>
                        <Typography variant="h5" gutterBottom>
                            Existing Edit Suggestions
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={handleOpenModal}>
                            New Suggestion
                        </Button>
                    </Grid>
                </Grid>
                {suggestions.length > 0 ? (
                    <>
                        <Box sx={{ my: 4 }}>
                            <Grid container justifyContent="space-between" alignItems="center">
                                <Grid item>
                                    <IconButton onClick={handlePrevSuggestion} disabled={findSuggestionIndex(selectedSuggestionId) === 0}>
                                        <ArrowBackIosNewIcon />
                                    </IconButton>
                                </Grid>
                                <Grid item>
                                    <Typography variant="h4" gutterBottom>
                                        Suggestion {selectedSuggestionId}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <IconButton onClick={handleNextSuggestion} disabled={findSuggestionIndex(selectedSuggestionId) === suggestions.length - 1}>
                                        <ArrowForwardIosIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Box>

                        {selectedSuggestionId && (
                            <Box sx={{ my: 4 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>
                                            Old List
                                        </Typography>
                                        <Paper elevation={3} sx={{ p: 2, minHeight: '150px' }}>
                                            <Typography style={{ whiteSpace: 'pre-wrap' }}>{suggestions.find(s => s.id === selectedSuggestionId)?.oldList}</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>
                                            New List
                                        </Typography>
                                        <Paper elevation={3} sx={{ p: 2, minHeight: '150px' }}>
                                            <Typography style={{ whiteSpace: 'pre-wrap' }}>{suggestions.find(s => s.id === selectedSuggestionId)?.newList}</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                <Box sx={{ my: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Differences
                                    </Typography>
                                    <Paper elevation={3} sx={{ p: 2 }}>
                                        {diffResults.map((change, index) => (
                                            <Typography
                                                key={index}
                                                sx={{
                                                    display: 'block',
                                                    backgroundColor: change.added ? '#e6ffed' : change.removed ? '#ffeef0' : 'none',
                                                    color: change.removed ? '#cb2431' : 'inherit',
                                                    textDecoration: change.removed ? 'line-through' : 'none',
                                                }}
                                            >
                                                {change.value}
                                            </Typography>
                                        ))}
                                    </Paper>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                                    <Button variant="contained" color="primary" onClick={handleAccept}>
                                        Accept
                                    </Button>
                                    <Button variant="contained" color="secondary" onClick={handleReject}>
                                        Reject
                                    </Button>
                                </Box>

                                <Box sx={{ my: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Comments
                                    </Typography>
                                    <List>
                                        {comments.map((comment) => (
                                            <ListItem key={comment.id}>
                                                <ListItemAvatar>
                                                    <Avatar src={comment.avatar} alt={comment.author} />
                                                </ListItemAvatar>
                                                <ListItemText primary={comment.text} secondary={comment.author} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Add a comment"
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && newCommentText.trim()) {
                                                    handleAddComment();
                                                }
                                            }}
                                        />
                                        <IconButton color="primary" onClick={handleAddComment} disabled={!newCommentText.trim()}>
                                            <SendIcon />
                                        </IconButton>
                                    </Box>
                                </Box>

                            </Box>

                        )} </>
                ) : (
                    <Box sx={{ my: 4 }}>
                        <Typography variant="h6" align="center">
                            No suggestions available.
                        </Typography>
                    </Box>
                )}

            </Container>

            {/* Modal for submitting a new edit suggestion */}
            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="submit-edit-suggestion-modal"
                aria-describedby="submit-edit-suggestion-modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="submit-edit-suggestion-modal" variant="h6" component="h2">
                        Submit New Edit Suggestion
                    </Typography>
                    <Typography id="submit-edit-suggestion-modal-description" sx={{ mt: 2 }}>
                        Fill in the details for your new edit suggestion.
                    </Typography>
                    {/* Submit Edit Suggestion Section */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <TextField
                                        label="New List"
                                        multiline
                                        fullWidth
                                        rows={8}
                                        variant="outlined"
                                        value={editSuggestion}
                                        onChange={(e) => setEditSuggestion(e.target.value)}
                                        sx={{ mb: 2 }} // margin bottom
                                    />
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmitEditSuggestion}
                                    >
                                        Submit
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Old List
                                    </Typography>
                                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{currentOldList}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
            </AppLayout>
    );
}
