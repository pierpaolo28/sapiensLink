import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    List,
    ListItem,
    ListItemText,
    IconButton,
    TextField,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Switch,
    FormControlLabel,
    Chip,
    Avatar,
    CardActions
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AppLayout from "@/components/AppLayout";
import { RankPageResponse } from "@/utils/types";

export default function RankPage() {
    const [rank, setRank] = useState<RankPageResponse | null>(null);
    const [newItemText, setNewItemText] = useState('');

    useEffect(() => {
        // Extract the id parameter from the current URL
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        // Fetch rank data based on the extracted id
        const fetchRankData = async () => {
            try {
                const response = await fetch(`http://localhost/api/rank_page/${id}/`);
                const data = await response.json();
                setRank(data);
            } catch (error) {
                console.error('Error fetching rank data:', error);
            }
        };

        if (id) {
            fetchRankData(); // Fetch data if id is present
        }

        // Add any cleanup logic if needed
        return () => {
            // Cleanup logic here
        };
    }, []); // Only fetch data when the component mounts

    const handleVote = async (contentIndex: number, action: string) => {
        try {
            // Extracting the rank IDs from the content object
            const rankIds = Object.keys(rank!.rank.content);
            console.log(rankIds[contentIndex])

            // Using the extracted rank ID for the API call
            const accessToken = localStorage.getItem('access_token');
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
                window.location.reload();
            } else {
                console.error('Vote failed:', response.status, response.statusText);
                // Handle the error or provide feedback to the user
            }
        } catch (error) {
            console.error('Error voting:', error);
            // Handle the error or provide feedback to the user
        }
    };




    const handleNewItemKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log("TODO")
    };

    const handleEdit = (index: number) => {
        console.log('Edit item with index:', index);
        // Implement edit logic
    };

    const handleDelete = (index: number) => {
        console.log("TODO")
    };

    const toggleWatchStatus = () => {
        console.log("TODO")
    };


    // Handler functions for save and report
    const handleSaveRank = () => {
        console.log('Save rank functionality to be implemented.');
        // Implement save functionality here
    };

    const handleReportRank = () => {
        console.log('Report rank functionality to be implemented.');
        // Implement report functionality here
    };

    const contributors = [
        { name: 'Contributor 1', imageUrl: '/path/to/contributor-1.jpg' },
        { name: 'Contributor 2', imageUrl: '/path/to/contributor-2.jpg' },
        // ...more Contributors
    ];

    const topics = ['Personal Finance', 'Technology', 'Health & Wellness']; // Example topics

    return (
        <AppLayout>
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            {rank && (
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
                                                            <Grid container alignItems="center">
                                                                <Grid item xs>
                                                                    <ListItemText primary={sortedElement.element.element} />
                                                                </Grid>
                                                                <Grid item>
                                                                    <IconButton onClick={() => handleVote(sortedElement.originalIndex, 'upvote')}><ArrowUpwardIcon /></IconButton>
                                                                    <IconButton onClick={() => handleVote(sortedElement.originalIndex, 'downvote')}><ArrowDownwardIcon /></IconButton>
                                                                    <IconButton onClick={() => handleEdit(sortedElement.originalIndex)}><EditIcon /></IconButton>
                                                                    <IconButton onClick={() => handleDelete(sortedElement.originalIndex)}><DeleteIcon /></IconButton>
                                                                    <Box component="span" sx={{ ml: 2, mr: 2 }}>
                                                                        {sortedElement.score}
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>
                                                        </ListItem>
                                                    ))}


                                                <ListItem>
                                                    <TextField
                                                        fullWidth
                                                        label="Press enter to add new item"
                                                        value={newItemText}
                                                        onChange={e => setNewItemText(e.target.value)}
                                                        onKeyPress={handleNewItemKeyPress}
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                        <CardActions>
                                            <Button variant="contained" onClick={handleSaveRank} sx={{ mr: 1 }}>
                                                Save
                                            </Button>
                                            <Button variant="outlined" color="error" onClick={handleReportRank} href="report">
                                                Report
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </>
                            )}
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" gutterBottom>
                                List Topics
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                                {topics.map((topic, index) => (
                                    <Chip key={index} label={topic} variant="outlined" sx={{ margin: '4px' }} />
                                ))}
                            </Box>

                            <Typography variant="h6" gutterBottom>
                                Contributors
                            </Typography>
                            <List>
                                {contributors.map((contributor, index) => (
                                    <ListItem key={index}>
                                        <Avatar src={contributor.imageUrl} alt={contributor.name} />
                                        <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                            {contributor.name}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </AppLayout>
    );
}
