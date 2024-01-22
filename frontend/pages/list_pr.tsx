import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Paper from '@mui/material/Paper';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
// Dynamically import ReactQuill only on the client side
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


import AppLayout from "@/components/AppLayout";
import { EditCommentWithUserData, ListPrPageWithUserDataResponse } from '@/utils/types';
import { getUserIdFromAccessToken } from "@/utils/auth";
import { appendLists, isValidListContent, extractWordsFromHTML, extractAddedWords, highlightWordsInHtml } from "@/utils/html";


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


const ListPrPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [listData, setListData] = useState<ListPrPageWithUserDataResponse | null>(null);
    const [newSuggestionText, setNewSuggestionText] = useState('');
    const [commentsMap, setCommentsMap] = useState<Map<number, EditCommentWithUserData[]>>(new Map());
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const handleCloseModal = () => setModalOpen(false);
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    useEffect(() => {
        if (listData) {
            // Create a mapping of suggestion IDs to comments
            const newCommentsMap = new Map();
            listData.pr_comments.forEach((comment) => {
                const commentsForSuggestion = newCommentsMap.get(comment.edit_suggestion) || [];
                newCommentsMap.set(comment.edit_suggestion, [...commentsForSuggestion, comment]);
            });
            setCommentsMap(newCommentsMap);
        }
    }, [listData]);

    // Function to fetch user data
    const getUserData = async (userId: number) => {
        try {
            const userResponse = await fetch(`http://localhost/api/get_user/${userId}/`, {
                method: 'GET',
                headers: {
                    'X-NextJS-Application': 'sapiensLink',
                    'Content-Type': 'application/json',
                },
            });
            const userData = await userResponse.json();
            return userData;
        } catch (error) {
            console.error(`Error fetching user data for user ${userId}:`, error);
            return null;
        }
    };

    const fetchData = async () => {
        const accessToken = localStorage.getItem('access_token');

        try {
            const response = await fetch(`http://localhost/api/list_pr_page/${id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json()

            // Fetch user data for each commenter
            const commentsWithUserData = await Promise.all(data.pr_comments.map(async (comment: any) => {
                const userData = await getUserData(comment.commenter);
                return {
                    ...comment,
                    commenterData: userData,
                };
            }));

            // Fetch user data for the suggested_by field in suggestions
            const suggestionsWithUserData = await Promise.all(data.suggestions.map(async (suggestion: any) => {
                const userData = await getUserData(suggestion.suggested_by);
                return {
                    ...suggestion,
                    suggestedByData: userData,
                };
            }));

            // Update the pr_comments array in the data with the comments containing user data
            // Update the suggestions array in the data with the suggestions containing user data
            const updatedData = {
                ...data,
                pr_comments: commentsWithUserData,
                suggestions: suggestionsWithUserData,
            };
            setListData(updatedData);

        } catch (error) {
            console.error('Error fetching list data:', error);
        }
    }

    useEffect(() => {
        if (id) {
            fetchData()
        }
    }, [id]);

    const handleAcceptSuggestion = async (suggestionId: any) => {
        const accessToken = localStorage.getItem('access_token');

        try {
            const response = await fetch(`http://localhost/api/approve_suggestion_action/${suggestionId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            console.log(`Suggestion ${suggestionId} accepted.`);
            setCurrentSuggestionIndex(0);
            fetchData()

        } catch (error) {
            console.error('Error accepting suggestion:', error);
        }
    };

    const handleRejectSuggestion = async (suggestionId: any) => {
        const accessToken = localStorage.getItem('access_token');

        try {
            const response = await fetch(`http://localhost/api/decline_suggestion_action/${suggestionId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            console.log(`Suggestion ${suggestionId} rejected.`);
            setCurrentSuggestionIndex(0);
            fetchData()

        } catch (error) {
            console.error('Error rejecting suggestion:', error);
        }
    };

    const handleNewSuggestionSubmit = async () => {
        setError(null);
        const accessToken = localStorage.getItem('access_token');
        // Check if listData and listData.list are not null
        if (!listData || !listData.list) {
            console.error("List data is not available.");
            return;
        }

        // Validate content
        if (!isValidListContent(newSuggestionText)) {
            setError('Content must be in bullet or numbered list format.');
            return;
        }

        const updatedContent = appendLists(listData.list.content, newSuggestionText);

        // Validate content
        if (!isValidListContent(updatedContent)) {
            setError('Content must be in bullet or numbered list format.');
            return;
        }

        // Check for duplicate items
        const existingItems = extractWordsFromHTML(listData.list.content);
        const newItems = extractWordsFromHTML(newSuggestionText);

        const duplicateItems = newItems.filter((item: any) => existingItems.includes(item));

        if (duplicateItems.length > 0) {
            setError(`Duplicate items found: ${duplicateItems.join(', ')}`);
            return;
        }

        const payload = {
            edit_suggestion: {
                list: id,
                suggested_by: getUserIdFromAccessToken(),
                suggestion_text: updatedContent,
            },
        };

        try {
            const response = await fetch(`http://localhost/api/list_pr_page/${id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.details.suggestion_text || 'Error submitting suggestion.')
                return;
            }

            // Clear the form and reload the suggestions
            setNewSuggestionText('');
            handleCloseModal()
            fetchData()
        } catch (error) {
            console.error('Error submitting new suggestion:', error);
        }
    };

    const handleNewCommentSubmit = async (commentText: string, suggestionId: number) => {
        const accessToken = localStorage.getItem('access_token');
        const payload = {
            comment: {
                text: commentText,
                edit_suggestion: suggestionId,
                commenter: getUserIdFromAccessToken(),
            },
        };

        try {
            const response = await fetch(`http://localhost/api/list_pr_page/${id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setSnackbarMessage(errorData.details || 'Error submitting comment');
                setSnackbarOpen(true);
                return;
            }

            // Clear the form and reload the comments
            fetchData()
        } catch (error) {
            console.error('Error submitting new comment:', error);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        const accessToken = localStorage.getItem('access_token');

        try {
            const response = await fetch(`http://localhost/api/delete_pr_comment_action/${commentId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Update the commentsMap to remove the deleted comment
            setCommentsMap((prevCommentsMap) => {
                const newCommentsMap = new Map(prevCommentsMap);
                newCommentsMap.forEach((comments, suggestionId) => {
                    const filteredComments = comments.filter((comment) => comment.id !== commentId);
                    newCommentsMap.set(suggestionId, filteredComments);
                });
                return newCommentsMap;
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const goToNextSuggestion = () => {
        setCurrentSuggestionIndex((prevIndex) =>
            prevIndex < listData!.suggestions.length - 1 ? prevIndex + 1 : prevIndex
        );
    };

    const goToPreviousSuggestion = () => {
        setCurrentSuggestionIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    };

    if (!listData) {
        return <Typography>Loading...</Typography>;
    }

    const suggestion = listData.suggestions[currentSuggestionIndex];
    const showPrev = currentSuggestionIndex > 0
    const showNext = currentSuggestionIndex < listData.suggestions.length - 1

    return (<AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
            {listData.suggestions.length > 0 ? (
                <>
                    <Box sx={{ my: 4 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <IconButton onClick={goToPreviousSuggestion} disabled={!showPrev}>
                                    <ArrowBackIosNewIcon />
                                </IconButton>
                            </Grid>
                            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                                <Link href={`/user_profile?id=${listData.suggestions[currentSuggestionIndex].suggested_by}`} passHref>
                                    <ListItemAvatar>
                                        <Avatar src={"http://localhost/static" + listData.suggestions[currentSuggestionIndex].suggestedByData.avatar} alt={listData.suggestions[currentSuggestionIndex].suggestedByData.name} sx={{ marginRight: 1 }} />
                                    </ListItemAvatar>
                                </Link>
                                <Typography variant="h4" gutterBottom>
                                    Suggestion {currentSuggestionIndex + 1}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <IconButton onClick={goToNextSuggestion} disabled={!showNext}>
                                    <ArrowForwardIosIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ my: 4 }}>
                        <Grid container spacing={3} justifyContent="center" alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    Proposed List (additions in yellow)
                                </Typography>
                                <Paper elevation={3} sx={{ p: 2, minHeight: '150px' }}>
                                    <Typography
                                        style={{ whiteSpace: 'pre-wrap' }}
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightWordsInHtml(
                                            suggestion.suggestion_text,
                                            extractAddedWords(listData.list.content, suggestion.suggestion_text)
                                        ))
                                    }}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                            <Button variant="contained" color="primary" onClick={() => handleAcceptSuggestion(suggestion.id)}>
                                Accept
                            </Button>
                            <Button variant="contained" color="secondary" onClick={() => handleRejectSuggestion(suggestion.id)}>
                                Reject
                            </Button>
                        </Box>

                        <Box sx={{ my: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Comments
                            </Typography>
                            <List>
                                {(commentsMap.get(suggestion.id) || []).map((comment) => (
                                    <ListItem key={comment.id} secondaryAction={
                                        getUserIdFromAccessToken() === comment.commenter && (
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteComment(comment.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        )
                                    }>
                                        {/* Display commenter's avatar with spacing */}
                                        {comment.commenterData && (
                                            <Link href={`/user_profile?id=${comment.commenter}`} passHref>
                                                <ListItemAvatar>
                                                    <Avatar src={"http://localhost/static" + comment.commenterData.avatar} alt={comment.commenterData.name} sx={{ marginRight: 1 }} />
                                                </ListItemAvatar>
                                            </Link>
                                        )}
                                        <ListItemText primary={comment.text} secondary={comment.commenterData.name} />
                                    </ListItem>
                                ))}
                            </List>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Add a comment"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && commentText.trim()) {
                                            handleNewCommentSubmit(commentText, suggestion.id);
                                            setCommentText('');
                                        }
                                    }}
                                />
                                <IconButton color="primary" onClick={() => {
                                    handleNewCommentSubmit(commentText, suggestion.id);
                                    setCommentText('');
                                }} disabled={!commentText.trim()}>
                                    <SendIcon />
                                </IconButton>
                            </Box>

                        </Box>

                    </Box>
                </>
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
                {error && (
                    <Typography variant="body1" color="error" gutterBottom>
                        {error}
                    </Typography>
                )}
                {/* Submit Edit Suggestion Section */}
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Typography id="submit-edit-suggestion-modal-description" sx={{ mt: 2 }}>
                                Write here the new elements you want to add.
                            </Typography>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <FormControl fullWidth>
                                    <ReactQuill
                                        id="content"
                                        value={newSuggestionText}
                                        onChange={(value) => setNewSuggestionText(value)}
                                        modules={{
                                            toolbar: [
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                ['link'] // Only allow bullet and numbered lists
                                            ],
                                        }}
                                    />
                                </FormControl>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleNewSuggestionSubmit}
                                >
                                    Submit
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                {listData && listData.list ? (
                                    <>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Preview of your proposal:
                                        </Typography>
                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(appendLists(listData.list.content, newSuggestionText)) }} />
                                    </>
                                ) : (
                                    <Typography>Loading...</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Modal>
        <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
    </AppLayout>
    );
};

export default ListPrPage;
