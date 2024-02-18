import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DOMPurify from 'dompurify';
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
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import ReportIcon from '@mui/icons-material/Report';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import NextLink from 'next/link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import { Menu, MenuItem } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import AppLayout from "@/components/AppLayout";
import { ListPageResponse, User, UserComment } from "@/utils/types";
import { getUserIdFromAccessToken, isUserLoggedIn } from "@/utils/auth";


const ListPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [newComment, setNewComment] = useState('');
    const [list, setList] = useState<ListPageResponse | null>(null);
    const [commenters, setCommenters] = useState<UserComment[] | null>(null);
    const [listAuthor, setlistAuthor] = useState<User | null>(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');


    const handleMenuClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };


    // Function to fetch user data
    const getUserData = async (userId: number) => {
        try {
            const userResponse = await fetch(`http://localhost/api/get_user/${userId}/`, {
                method: 'GET',
                headers: {
                    'X-NextJS-Application': process.env.NEXT_PUBLIC_X_NEXTJS_APPLICATION!,
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

    const fetchListData = async () => {
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

            const response = await fetch(`http://localhost/api/list_page/${id}/`, {
                method: 'GET',
                headers: headers,
            });

            const data = await response.json();
            const userData = await getUserData(data.list.author);

            // Fetch user data for each comment
            const commentsWithUserData: UserComment[] = await Promise.all(
                data.list_comments.map(async (comment: any) => {
                    const userData = await getUserData(comment.user);
                    return {
                        id: comment.id,
                        author_id: userData?.id,
                        author: userData?.name || 'Unknown User',
                        text: comment.body,
                        avatar: userData?.avatar,
                        updated: comment.updated,
                    };
                })
            );

            setList(data);
            setlistAuthor(userData);
            setCommenters(commentsWithUserData);
        } catch (error) {
            console.error('Error fetching list data:', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchListData();
        }
    }, [id]);
    

    // Handler for adding new comment
    const handleCommentSubmit = async () => {
        // Check if the user is logged in
        if (!isUserLoggedIn()) {
            // Redirect to the sign-in page
            window.location.href = '/signin';
        }

        if (newComment.trim()) {
            try {
                const accessToken = localStorage.getItem('access_token');
                const response = await fetch(`http://localhost/api/list_page/${id}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ comment: { user: 1, body: newComment } }),
                });

                if (response.ok) {
                    // Fetch updated list data and comments after submitting the comment
                    setNewComment('');
                    fetchListData();
                } else {
                    const errorData = await response.json();
                    setSnackbarMessage(errorData.details || 'Error submitting comment');
                    setSnackbarOpen(true);
                    return;
                }
            } catch (error) {
                console.error('Error submitting comment:', error);
            }

        }
    };

    // Function to delete a comment
    const handleDeleteComment = async (commentId: number) => {
        // Check if the user is logged in
        if (!isUserLoggedIn()) {
            // Redirect to the sign-in page
            window.location.href = '/signin';
        }

        if (list && id) {
            try {
                const accessToken = localStorage.getItem('access_token');
                const response = await fetch(`http://localhost/api/delete_comment_action/${commentId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    // Fetch updated list data after deleting the comment
                    fetchListData();
                } else {
                    console.error('Error deleting comment:', response.status, response.statusText);
                    // Handle the error or provide feedback to the user
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
                // Handle the error or provide feedback to the user
            }
        }
    };

    const handleSaveList = async () => {
        // Check if the user is logged in
        if (!isUserLoggedIn()) {
            // Redirect to the sign-in page
            window.location.href = '/signin';
        }

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
                fetchListData()
            } else {
                console.error(`Error ${isSaved ? 'unsaving' : 'saving'} rank:`, response.status, response.statusText);
                // Handle the error or provide feedback to the user
            }
        } catch (error) {
            console.error(`Error ${isSaved ? 'unsaving' : 'saving'} rank:`, error);
            // Handle the error or provide feedback to the user
        }
    };

    const toggleWatchStatus = async () => {
        // Check if the user is logged in
        if (!isUserLoggedIn()) {
            // Redirect to the sign-in page
            window.location.href = '/signin';
        }

        try {
            const accessToken = localStorage.getItem('access_token');
            const isSubscribed = list?.is_subscribed || false;
            const action = isSubscribed ? 'unsubscribe' : 'subscribe';

            const response = await fetch(`http://localhost/api/manage_subscription/list/${list!.list.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                fetchListData();
            } else {
                console.error('Error toggling watch status:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error toggling watch status:', error);
        }
    };

    // Function to handle upvoting
    const handleUpvote = async () => {
        // Check if the user is logged in
        if (!isUserLoggedIn()) {
            // Redirect to the sign-in page
            window.location.href = '/signin';
        }

        if (list && id) {
            try {
                const accessToken = localStorage.getItem('access_token');
                const response = await fetch(`http://localhost/api/vote_action/${id}/upvote/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    // Fetch updated list data after upvoting
                    fetchListData();
                } else {
                    console.error('Error upvoting:', response.status, response.statusText);
                    // Handle the error or provide feedback to the user
                }
            } catch (error) {
                console.error('Error upvoting:', error);
                // Handle the error or provide feedback to the user
            }
        }
    };

    // Function to handle downvoting
    const handleDownvote = async () => {
        // Check if the user is logged in
        if (!isUserLoggedIn()) {
            // Redirect to the sign-in page
            window.location.href = '/signin';
        }

        if (list && id) {
            try {
                const accessToken = localStorage.getItem('access_token');
                const response = await fetch(`http://localhost/api/vote_action/${id}/downvote/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    // Fetch updated list data after downvoting
                    fetchListData();
                } else {
                    console.error('Error downvoting:', response.status, response.statusText);
                    // Handle the error or provide feedback to the user
                }
            } catch (error) {
                console.error('Error downvoting:', error);
                // Handle the error or provide feedback to the user
            }
        }
    };

    // Function to handle deleting the list
    const handleDeleteList = async () => {
        // Check if the user is logged in
        if (!isUserLoggedIn()) {
            // Redirect to the sign-in page
            window.location.href = '/signin';
        }

        try {
            const accessToken = localStorage.getItem('access_token');

            const response = await fetch(`http://localhost/api/update_list_page/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                // Redirect to a suitable page after successful deletion
                window.location.href = '/list_home';
            } else {
                console.error('Error deleting list:', response.status, response.statusText);
                // Handle the error or provide feedback to the user
            }
        } catch (error) {
            console.error('Error deleting list:', error);
            // Handle the error or provide feedback to the user
        }
    };

    const handleSuggestEdit = () => {
        if (!isUserLoggedIn()) {
            window.location.href = '/signin';
        } else {
            window.location.href = '/list/suggestions/' + id;
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

    const handleEditList = () => {
        window.location.href = `/create_list?id=${id}`;
    };


    return <AppLayout>
        <Container component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    {list && list.list && (
                        <Card variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h5" gutterBottom>
                                        {list.list.name}
                                    </Typography>
                                    <Box>
                                        <IconButton aria-label="watch/unwatch list" onClick={toggleWatchStatus}>
                                            {list.is_subscribed ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                        <IconButton aria-label="save list" onClick={handleSaveList}>
                                            {list.saved_list_ids.includes(list.list.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                        </IconButton>
                                    </Box>
                                </Box>


                                {listAuthor && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            Last activity: {new Date(list.list.updated).toLocaleString()}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Avatar src={`http://localhost/static/${listAuthor.avatar}`} alt="Profile image" sx={{ marginRight: 2 }} />
                                            <Typography variant="subtitle1">
                                                <Link href={`/user_profile?id=${listAuthor.id}`} color="inherit" underline="hover">
                                                    {listAuthor.name}
                                                </Link>
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}


                                {/* Dynamic list of links */}
                                <Box sx={{ mb: 2 }}>
                                    {/* Display HTML content safely */}
                                    {list.list.description}
                                    <Typography dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(list.list.content) }} />
                                </Box>
                                {list.list.source && (
                                    <Typography variant="body2" sx={{ my: 1 }}>
                                        <Link href={list.list.source} target="_blank" rel="noopener noreferrer">
                                            Source
                                        </Link>
                                    </Typography>
                                )}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                    <Box>
                                        <IconButton aria-label="upvote" onClick={handleUpvote}>
                                            <ArrowUpwardIcon />
                                        </IconButton>
                                        <Typography variant="subtitle1" display="inline">
                                            {list && list.list ? list.list.score : 0} {/* Display total score */}
                                        </Typography>
                                        <IconButton aria-label="downvote" onClick={handleDownvote}>
                                            <ArrowDownwardIcon />
                                        </IconButton>
                                    </Box>
                                    <Box>
                                        <Button startIcon={<EditIcon />} size="small" onClick={handleSuggestEdit}>
                                            Suggest Edit
                                        </Button>
                                        <Button startIcon={<ReportIcon />} size="small" onClick={handleReport}>
                                            Report
                                        </Button>
                                        <IconButton onClick={handleCopyLink} color="primary">
                                            <ShareIcon />
                                        </IconButton>
                                        {listAuthor && (listAuthor.id == getUserIdFromAccessToken()) && (
                                            <>
                                                <IconButton
                                                    aria-label="more"
                                                    aria-controls="long-menu"
                                                    aria-haspopup="true"
                                                    onClick={handleMenuClick}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                    id="long-menu"
                                                    anchorEl={anchorEl}
                                                    keepMounted
                                                    open={Boolean(anchorEl)}
                                                    onClose={handleMenuClose}
                                                >
                                                    <MenuItem onClick={() => { handleEditList(); handleMenuClose(); }}>
                                                        Edit List
                                                    </MenuItem>
                                                    <MenuItem onClick={() => { handleDeleteList(); handleMenuClose(); }}>
                                                        Delete List
                                                    </MenuItem>
                                                </Menu>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                            {/* Comment section */}
                            {commenters && (
                                <CardContent>
                                    {/* Comments List */}
                                    <List>
                                        {commenters.map((comment) => (
                                            <ListItem key={comment.id} alignItems="flex-start">
                                                <ListItemAvatar>
                                                    <Avatar alt={comment.author} src={"http://localhost/static/" + comment.avatar} />
                                                </ListItemAvatar>
                                                <Grid container spacing={1} alignItems="center">
                                                    <Grid item xs={12} sm={8}>
                                                        <ListItemText
                                                            primary={comment.author}
                                                            secondary={comment.text}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <Typography variant="caption" color="textSecondary" align="right">
                                                            {new Date(comment.updated).toLocaleString()}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                                {(comment.author_id == getUserIdFromAccessToken()) && (
                                                    <IconButton aria-label="delete" onClick={() => handleDeleteComment(comment.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            label="Add a comment"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && newComment.trim()) {
                                                    handleCommentSubmit();
                                                    setNewComment('');
                                                }
                                            }}
                                        />
                                        <IconButton color="primary" onClick={() => {
                                            handleCommentSubmit();
                                            setNewComment('');
                                        }} disabled={!newComment.trim()}>
                                            <SendIcon />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            )}
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
                                <NextLink key={topic.id} href={`/list_home?q=${topic.name}`} passHref>
                                    <Chip key={topic.id} label={topic.name} variant="outlined" sx={{ margin: '4px' }} />
                                </NextLink>
                            ))}
                        </Box>
                    )}
                    <Typography variant="h6">Participants</Typography>
                    {list && list.participants && (
                        <List>
                            {list.participants.map((participant) => (
                                <ListItem key={participant.name}>
                                    <Avatar src={"http://localhost/static/" + participant.avatar} />
                                    <NextLink href={`/user_profile?id=${participant.id}`} passHref>
                                        <Typography variant="subtitle1" style={{ marginLeft: '10px' }}>
                                            {participant.name}
                                        </Typography>
                                    </NextLink>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Grid>
            </Grid>
        </Container>
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
};

export default ListPage;
