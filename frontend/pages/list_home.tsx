import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import Pagination from '@mui/material/Pagination';

import AppLayout from "@/components/AppLayout";
// import DBSetup from "@/components/DBSetup";
import { getHome } from "@/utils/routes";
import { HomeResponse } from "@/utils/types";


export default function HomePage() {
  const [home, setHome] = React.useState<HomeResponse | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const homeData = await getHome();
        setHome(homeData);
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    }

    fetchData();
  }, []);

  // Example data - replace with actual data
  const topics = ['All', 'Tech', 'Work', 'Education', 'Personal Finance'];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('latest');

  // Example user data for "Who to Follow"
  const usersToFollow = [
    { name: 'User One', img: '/user1.jpg' },
    { name: 'User Two', img: '/user2.jpg' },
    // ... other users
  ];

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: any) => {
    event.preventDefault();
    // Call API with searchTerm
  };

  const handleTabChange = (event: any, newValue: any) => {
    setSelectedTab(newValue);
  };

  // Handle change page
  const handleChangePage = (event: any, newPage: any) => {
    // Fetch new lists based on newPage, or update the lists displayed from the state
    console.log(home!.pagination.next_page)
  };

  return (
    <>
      <AppLayout>
        <Box display="flex" justifyContent="center" mb={2}>
          <ToggleButtonGroup
            color="primary"
            value={selectedTab}
            exclusive
            aria-label="list type"
            sx={{ width: '100%' }}
          >
            <ToggleButton value="lists" onClick={() => window.location.href = "/list_home"} sx={{ width: '50%' }}>
              Lists
            </ToggleButton>
            <ToggleButton value="ranks" onClick={() => window.location.href = "/rank_home"} sx={{ width: '50%' }}>
              Ranks
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Left side - Topics and More */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ mb: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Browse Topics
                </Typography>
                <List>
                  {topics.map((topic, index) => (
                    <ListItem button key={index}>
                      <ListItemText primary={topic} />
                    </ListItem>
                  ))}
                  <Button>More</Button>
                </List>
              </Paper>
            </Grid>

            {/* Center - List feed, search, and tabs */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ mb: 2, p: 2 }}>
                <ToggleButtonGroup
                  color="primary"
                  value={selectedTab}
                  exclusive
                  onChange={handleTabChange}
                  aria-label="list type"
                >
                  <ToggleButton value="latest">Latest</ToggleButton>
                  <ToggleButton value="follow">Follow List</ToggleButton>
                  <ToggleButton value="popular">Popular</ToggleButton>
                </ToggleButtonGroup>

                <form onSubmit={handleSearchSubmit} style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for lists"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      endAdornment: (
                        <Button variant="contained" color="primary" onClick={handleSearchSubmit}>
                          <SearchIcon />
                        </Button>
                      ),
                    }}
                  />
                </form>
                <Stack spacing={2}>
                  <Button href='create_list'>Create List</Button>
                  {home && home.lists ? ( // Check if home and home.lists are available
                    home.lists.map((list, i) => (
                      <Card key={list.id}>
                        <CardActionArea>
                          <CardContent>
                            <Typography gutterBottom variant="h5">
                              {list.name}
                            </Typography>
                            <Typography paragraph color="text.secondary">
                              {list.description}
                            </Typography>
                            <Grid container spacing={3} alignItems="center">
                              <Grid item xs>
                                <Stack direction="row" spacing={1}>
                                  {list.topic.map((topic) => (
                                    <Chip key={topic.id} label={topic.name} />
                                  ))}
                                </Stack>
                              </Grid>
                              <Grid item xs></Grid>
                              <Grid item xs>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  justifyContent="end"
                                >
                                  <Avatar sx={{ width: 32, height: 32 }} />
                                  <div>{list.author}</div>
                                </Stack>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))
                  ) : (
                    // Render loading state or an error message
                    <Typography>Loading...</Typography>
                  )}
                </Stack>
                {/* Pagination component */}
                {home && home.pagination && (
                  <Pagination
                    count={home.pagination.total_pages}
                    page={home.pagination.current_page}
                    onChange={handleChangePage}
                    color="primary"
                    sx={{ marginTop: 2 }} // Add some margin at the top
                  />
                )}
              </Paper>
            </Grid>

            {/* Right side - Who to follow and more */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ mb: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Who to Follow
                </Typography>
                <List>
                  {usersToFollow.map((user, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar src={user.img} alt={user.name} />
                      </ListItemAvatar>
                      <ListItemText primary={user.name} />
                    </ListItem>
                  ))}
                </List>
                <Button>More</Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
        {/* <div>
          <DBSetup></DBSetup>
        </div> */}
      </AppLayout>
    </>
  );
}
