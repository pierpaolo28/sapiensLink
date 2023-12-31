import React, { useState } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Link,
    ToggleButtonGroup,
    ToggleButton,
    Divider
} from '@mui/material';
import { Pagination } from '@mui/material';
import AppLayout from "@/components/AppLayout";

export default function UserProfilePage() {
    // Example user data
    const userProfile = {
        name: 'Jane Doe',
        imageUrl: '/path/to/user-avatar.jpg', // Replace with actual image path
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        followersCount: 120, // Sample data
        followingCount: 75, // Sample data
        listsPublishedCount: 5, // Sample data
        socialMedia: {
            twitter: 'https://twitter.com/janedoe', // Replace with actual Twitter profile link
        },
        // ... other profile data
    };
    // Example data
    const userLists = [
        'List One',
        'List Two',
        // ... more lists
    ];
    const savedLists = [
        'Saved List One',
        'Saved List Two',
        // ... more saved lists
    ];

    const savedRanks = [
        'Rank One',
        'Rank Two',
        // ... more saved ranks
    ];

    const recentContributions = [
        'Contribution One',
        'Contribution Two',
        // ... more contributions
    ];

    const [listVisibility, setListVisibility] = useState('public');

    const handleListVisibility = (event: any, newVisibility: any) => {
        if (newVisibility !== null) {
            setListVisibility(newVisibility);
        }
    };

    // Function to handle 'More' button click
    const handleMoreClick = () => {
        // Logic to handle 'More' button click
        console.log("More button clicked");
        // Potentially update state to show more items or navigate to a different view
    };

    // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust the number of items per page as needed
  const count = Math.ceil(recentContributions.length / itemsPerPage); // Calculate the total number of pages

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // Add logic to fetch data for the new page if necessary
  };

    return (
        <AppLayout>
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Grid container spacing={2}>
                        {/* User profile info and buttons */}
                        <Grid item xs={12} sm={4} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center', mb: 2 }}>
                                <Avatar
                                    alt={userProfile.name}
                                    src={userProfile.imageUrl}
                                    sx={{ width: 80, height: 80, mx: 'auto' }}
                                />
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    {userProfile.name}
                                </Typography>
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    {userProfile.bio}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    {userProfile.followersCount} Followers
                                </Typography>
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    {userProfile.followingCount} Following
                                </Typography>
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    {userProfile.listsPublishedCount} Lists Published
                                </Typography>
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    <Link href={userProfile.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                                        Twitter
                                    </Link>
                                </Typography>
                                <Button variant="contained" color="primary" fullWidth sx={{ mb: 1 }}>
                                    Follow
                                </Button>
                                <Button variant="outlined" color="primary" fullWidth>
                                    Edit Account
                                </Button>
                            </Paper>
                        </Grid>

                        {/* Lists Published by the user + Recent Contributions */}
                        <Grid item xs={12} sm={8} md={6}>
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">Lists Published by the User</Typography>
                                    <ToggleButtonGroup
                                        color="primary"
                                        value={listVisibility}
                                        exclusive
                                        onChange={handleListVisibility}
                                        size="small"
                                    >
                                        <ToggleButton value="public">Public</ToggleButton>
                                        <ToggleButton value="private">Private</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                                <List>
                                    {userLists.map((list, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={list} />
                                        </ListItem>
                                    ))}
                                </List>

                                {/* Pagination for lists */}
            <Pagination
              count={count}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              sx={{ my: 2 }} // Adds margin around the pagination
            />

                                {/* Recent Contributions */}
                                <Typography variant="h6">Recent Contributions</Typography>
                                {recentContributions.length > 0 ? (
                                    <List>
                                        {recentContributions.map((contribution, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={contribution} />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body1">No recent contributions.</Typography>
                                )}
                            </Paper>
                        </Grid>

                        {/* Saved Lists */}
                        <Grid item xs={12} sm={12} md={3}>
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6">Saved Lists</Typography>
                                <List>
                                    {savedLists.map((list, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={list} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>

                            {/* Saved Ranks */}
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6">Saved Ranks</Typography>
                                <List>
                                    {savedRanks.map((rank, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={rank} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>

                            {/* More button */}
                            <Button fullWidth variant="outlined" onClick={handleMoreClick}>
                                More
                            </Button>

                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </AppLayout>
    );
}
