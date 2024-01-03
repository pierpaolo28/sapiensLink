import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Divider from '@mui/material/Divider';
import {Pagination} from '@mui/material';

import AppLayout from "@/components/AppLayout";
import {UserProfilePage} from "@/utils/types";


export default function UserProfilePage() {
    const [userProfile, setUserProfile] = useState<UserProfilePage | null>(null);

    useEffect(() => {
        // Function to fetch user profile data based on the user ID from the previous page's URL
        const fetchUserProfile = async () => {
            try {
                // Get the previous page's URL
                const currentUrl = window.location.href;

                // Extract the user ID from the previous page's URL
                const url = new URL(currentUrl);
                const userId = url.searchParams.get('id');

                // Make the API call
                const response = await fetch(`http://localhost/api/user_profile_page/${userId}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const apiResponse = await response.json();

                // Extract user data from the API response
                setUserProfile(apiResponse);

                // Handle other data fetching if needed...
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        // Call the fetchUserProfile function
        fetchUserProfile();
    }, []);

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

    const recentContributions =
  (userProfile?.lists_contributions?.length ?? 0) + (userProfile?.ranks_contributions?.length ?? 0);
    // Add state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Adjust the number of items per page as needed
    const count = Math.ceil(recentContributions / itemsPerPage); // Calculate the total number of pages

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
                        {userProfile && userProfile.user ? (
                            <Paper sx={{ p: 2, textAlign: 'center', mb: 2 }}>
                                <Avatar
                                    alt={userProfile.user.name}
                                    src={userProfile.user.avatar}
                                    sx={{ width: 80, height: 80, mx: 'auto' }}
                                />
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    {userProfile.user.name}
                                </Typography>
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    {userProfile.user.bio}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    {userProfile.user.followers.length} Followers
                                </Typography>
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    {userProfile.user.following.length} Following
                                </Typography>
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    {userProfile.lists_count} Lists Published
                                </Typography>
                                <Typography variant="body2" sx={{ my: 1 }}>
                                    <Link href={userProfile.user.social} target="_blank" rel="noopener noreferrer">
                                        Social
                                    </Link>
                                </Typography>
                                <Button variant="contained" color="primary" fullWidth sx={{ mb: 1 }}>
                                    Follow
                                </Button>
                                <Button variant="outlined" color="primary" fullWidth>
                                    Edit Account
                                </Button>
                            </Paper>
                        ) : (
                            // Render loading state or an error message
                            <Typography>Loading...</Typography>
                          )}
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
                                {userProfile && userProfile.lists && (
                                <List>
                                    {userProfile.lists.map((list, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={list.name} />
                                        </ListItem>
                                    ))}
                                </List>
                                )}

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
                                {recentContributions > 0 ? (
                                    <List>
                                        {userProfile?.lists_contributions.map((contribution, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={contribution.name} />
                                            </ListItem>
                                        ))}
                                        {userProfile?.ranks_contributions.map((contribution, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={contribution.name} />
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
                                {userProfile &&  userProfile.saved_lists && (
                                <List>
                                    {userProfile.saved_lists.map((list, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={list.name} />
                                        </ListItem>
                                    ))}
                                </List>
                                )}
                            </Paper>

                            {/* Saved Ranks */}
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6">Saved Ranks</Typography>
                                {userProfile && userProfile.saved_ranks && (
                                <List>
                                    {userProfile.saved_ranks.map((rank, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={rank.rank} />
                                        </ListItem>
                                    ))}
                                </List>
                                )}
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
