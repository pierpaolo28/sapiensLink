import React, { useState } from 'react';
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
    CardActions,
    Chip,
    Avatar
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AppLayout from "@/components/AppLayout";

export default function RankPage() {
    const [rank, setRank] = useState({
        title: 'Rank Title',
        description: 'Rank description...',
        items: [
            { id: 1, text: 'Item 1', score: 0 },
            { id: 2, text: 'Item 2', score: 0 },
            // ... more items
        ],
        watched: false, // Initial watch status
        lastActivity: new Date(), // Replace with actual last activity date
    });
    const [newItemText, setNewItemText] = useState('');

    // Calculate overall score
    const overallScore = rank.items.reduce((total, item) => total + item.score, 0);

    const handleVote = (id: any, delta: any) => {
        setRank(prevRank => ({
            ...prevRank,
            items: prevRank.items.map(item => item.id === id ? { ...item, score: item.score + delta } : item)
                .sort((a, b) => b.score - a.score), // Sort items by score in descending order
        }));
    };

    const handleNewItemKeyPress = (event: any) => {
        if (event.key === 'Enter' && newItemText.trim()) {
            const newItem = { id: Date.now(), text: newItemText, score: 0 };
            setRank(prevRank => ({
                ...prevRank,
                items: [...prevRank.items, newItem],
            }));
            setNewItemText('');
        }
    };

    const handleEdit = (id: any) => {
        // Implement edit logic
        console.log('Edit item with id:', id);
    };

    const handleDelete = (id: any) => {
        setRank(prevRank => ({
            ...prevRank,
            items: prevRank.items.filter(item => item.id !== id)
                .sort((a, b) => b.score - a.score), // Ensure the sort order is maintained after deletion
        }));
    };

    const toggleWatchStatus = () => {
        setRank(prevRank => ({
            ...prevRank,
            watched: !prevRank.watched,
        }));
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
                            <Typography variant="h4" gutterBottom>
                                {rank.title}
                            </Typography>

                            {/* Last activity and watch toggle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body1">
                                    Last Activity: 12/31/2023
                                </Typography>
                                <FormControlLabel
                                    control={<Switch checked={rank.watched} onChange={toggleWatchStatus} />}
                                    label={rank.watched ? 'Unwatch Rank' : 'Watch Rank'}
                                />
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                {rank.description}
                            </Typography>

                            {/* Overall score */}
                            <Typography variant="body2" gutterBottom>
                                Overall Score: {overallScore}
                            </Typography>

                            <Card variant="outlined" sx={{ mb: 4 }}>
                                <CardContent>
                                    <List>
                                        {rank.items.map(item => (
                                            <ListItem key={item.id}>
                                                <Grid container alignItems="center">
                                                    <Grid item xs>
                                                        <ListItemText primary={item.text} />
                                                    </Grid>
                                                    <Grid item>
                                                        <IconButton onClick={() => handleVote(item.id, 1)}><ArrowUpwardIcon /></IconButton>
                                                        <IconButton onClick={() => handleVote(item.id, -1)}><ArrowDownwardIcon /></IconButton>
                                                        <IconButton onClick={() => handleEdit(item.id)}><EditIcon /></IconButton>
                                                        <IconButton onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
                                                        <Box component="span" sx={{ ml: 2, mr: 2 }}>
                                                            {item.score}
                                                        </Box>
                                                        {/* Include Edit/Delete icons here if necessary */}
                                                    </Grid>
                                                </Grid>
                                            </ListItem>
                                        ))}
                                        <ListItem>
                                            <TextField
                                                fullWidth
                                                label="Press enter to add new item"
                                                value={newItemText}
                                                onChange={(e) => setNewItemText(e.target.value)}
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
                        </Grid>

                        {/* List Topics and Contributors */}
                        <Grid item xs={12} md={4}>
                            {/* List Topics */}
                            <Typography variant="h6" gutterBottom>
                                List Topics
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                                {topics.map((topic, index) => (
                                    <Chip key={index} label={topic} variant="outlined" sx={{ margin: '4px' }} />
                                ))}
                            </Box>

                            {/* Contributors */}
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
