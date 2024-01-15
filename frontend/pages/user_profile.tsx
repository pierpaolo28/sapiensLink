import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
import { Pagination } from '@mui/material';
import NextLink from 'next/link';

import AppLayout from "@/components/AppLayout";
import { UserProfilePage } from "@/utils/types";
import { getUserIdFromAccessToken, isUserLoggedIn } from "@/utils/auth";


export default function UserProfilePage() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfilePage | null>(null);
    const [listVisibility, setListVisibility] = useState('public');
    // Get the previous page's URL
    const currentUserId = getUserIdFromAccessToken();
    let profileUserId: string | null
    let accessToken: string | null
    let userMatches: boolean = false
    if (typeof window !== 'undefined') {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        profileUserId = url.searchParams.get('id');
        accessToken = localStorage.getItem('access_token');
        userMatches = profileUserId == currentUserId
    }
    const [shouldRenderClientOnly, setShouldRenderClientOnly] = useState(false);

    useEffect(() => {
        setShouldRenderClientOnly(true);
    }, []);

    // Function to fetch user profile data based on the user ID from the previous page's URL
    const fetchUserProfile = async () => {
        try {
            const apiEndpoint = listVisibility === 'public'
                ? `http://localhost/api/user_profile_page/${profileUserId}/`
                : `http://localhost/api/private_lists_page/${profileUserId}/`;
    
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
    
            if (isUserLoggedIn()) {
                const accessToken = localStorage.getItem('access_token');
                headers['Authorization'] = `Bearer ${accessToken}`;
            }
    
            const response = await fetch(apiEndpoint, {
                method: 'GET',
                headers: headers,
            });
    
            const apiResponse = await response.json();
            setUserProfile(apiResponse);
    
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };
    

    useEffect(() => {
        fetchUserProfile();
    }, [listVisibility]);

    const handleListVisibility = (event: any, newVisibility: any) => {
        if (newVisibility !== null) {
            setListVisibility(newVisibility);
        }
    };

    const recentContributions =
        (userProfile?.lists_contributions?.length ?? 0) + (userProfile?.ranks_contributions?.length ?? 0);

    const handlePageChange = async (event: React.ChangeEvent<unknown>, page: number) => {
        try {
            const apiEndpoint = listVisibility === 'public'
                ? `http://localhost/api/user_profile_page/${profileUserId}/?page=${page}`
                : `http://localhost/api/private_lists_page/${profileUserId}/?page=${page}`;
            
            const headers: HeadersInit = listVisibility === 'public'
            ? { 'Content-Type': 'application/json' }
            : {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            } as HeadersInit;
    
            const response = await fetch(apiEndpoint, {
                method: 'GET',
                headers: headers,
            });

            if (response.ok) {
                const data = await response.json();
                setUserProfile(data);
            } else {
                console.error('Error fetching user profile:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleFollowUnfollow = async () => {
        if (!isUserLoggedIn()) {
            window.location.href = '/signin';
          }

        try {
            const accessToken = localStorage.getItem('access_token');

            // Make a POST request to toggle the follow status
            const response = await fetch(`http://localhost/api/user_profile_page/${profileUserId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                // Update the follow status in the state
                fetchUserProfile();
                console.log("Follow status updated")
            } else {
                console.error('Error updating follow status:', response.status, response.statusText);
                // Handle the error or provide feedback to the user
            }
        } catch (error) {
            console.error('Error updating follow status:', error);
            // Handle the error or provide feedback to the user
        }
    };

    const handleMoreSaved = () => {
        if (profileUserId) {
            router.push(`/saved?id=${profileUserId}`);
        }
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
                                        src={"http://localhost/static" + userProfile.user.avatar}
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
                                    {userMatches ? (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            fullWidth
                                            href={`/edit_profile`}
                                        >
                                            Edit Account
                                        </Button>
                                    ) : <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{ mb: 1 }}
                                        onClick={handleFollowUnfollow}
                                    >
                                        {userProfile.is_following ? 'Unfollow' : 'Follow'}
                                    </Button>
                                    }
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
                                    {shouldRenderClientOnly && userMatches && (
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
                                    )}
                                </Box>
                                {userProfile && userProfile.lists && (
                                    <>
                                        <List>
                                            {userProfile.lists.map((list, index) => (
                                                <NextLink key={index} href={`/list?id=${list.id}`} passHref>
                                                    <ListItem key={index}>
                                                        <ListItemText primary={list.name} />
                                                    </ListItem>
                                                </NextLink>
                                            ))}
                                        </List>
                                        {/* Pagination for lists */}
                                        <Pagination
                                            count={userProfile?.pagination?.total_pages}
                                            page={userProfile?.pagination?.current_page}
                                            onChange={handlePageChange}
                                            color="primary"
                                            showFirstButton
                                            showLastButton
                                            sx={{ my: 2 }}
                                        />
                                    </>
                                )}

                                {/* Recent Contributions */}
                                {listVisibility === 'public' && (
                                    <>
                                        <Typography variant="h6">Recent Contributions</Typography>
                                        {recentContributions > 0 ? (
                                            <List>
                                                {userProfile?.lists_contributions.map((contribution, index) => (
                                                    <NextLink key={index} href={`/list?id=${contribution.id}`} passHref>
                                                        <ListItem key={index}>
                                                            <ListItemText primary={contribution.name} />
                                                        </ListItem>
                                                    </NextLink>
                                                ))}
                                                {userProfile?.ranks_contributions.map((contribution, index) => (
                                                    <NextLink key={index} href={`/rank?id=${contribution.id}`} passHref>
                                                        <ListItem key={index}>
                                                            <ListItemText primary={contribution.name} />
                                                        </ListItem>
                                                    </NextLink>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body1">No recent contributions.</Typography>
                                        )}
                                    </>
                                )}
                            </Paper>
                        </Grid>

                        {/* Saved Lists */}
                        <Grid item xs={12} sm={12} md={3}>
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6">Saved Lists</Typography>
                                {userProfile && userProfile.saved_lists && (
                                    <List>
                                        {userProfile.saved_lists.map((list, index) => (
                                            <NextLink key={index} href={`/list?id=${list.list}`} passHref>
                                                <ListItem key={index}>
                                                    <ListItemText primary={list.list_name.name} />
                                                </ListItem>
                                            </NextLink>
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
                                            <NextLink key={index} href={`/rank?id=${rank.rank}`} passHref>
                                                <ListItem key={index}>
                                                    <ListItemText primary={rank.rank_name.name} />
                                                </ListItem>
                                            </NextLink>
                                        ))}
                                    </List>
                                )}
                            </Paper>


                            <Button fullWidth variant="outlined" onClick={handleMoreSaved}>
                                More
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </AppLayout>
    );
}
