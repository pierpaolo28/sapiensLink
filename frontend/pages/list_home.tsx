import React, { useState, useEffect } from 'react';
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
  const [home, setHome] = useState<HomeResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async (extraParams = '') => {
    try {
      // Use the updated currentPage state to fetch the corresponding page
      const updatedParams = `page=${currentPage}&${extraParams}`;
  
      const homeData = await getHome(updatedParams);
      setHome(homeData);
    } catch (error) {
      console.error("Error fetching home data:", error);
    }
  };
  

  useEffect(() => {
    // Parse the query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');

    // Set the search term if it exists
    if (queryParam) {
      setSearchTerm(queryParam);
      fetchData(`q=${queryParam}`);
    } else {
      fetchData();
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('latest');

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async (event: any) => {
    event.preventDefault();
    fetchData(`q=${searchTerm}`)
  };

  const handleTabChange = (event: React.MouseEvent<HTMLElement>, newValue: string) => {
    setSelectedTab(newValue);
  
    let extraParams = '';
    
    if (newValue === 'latest') {
      extraParams = '';
    } else if (newValue === 'popular') {
      extraParams = 'top_voted=top_voted_true';
    // TODO: In order to make this call the user should be logged in and we need to pass the access token
    // If an user is not logged in the this should be hidden
    } else if (newValue === 'follow') {
      extraParams = 'follow=follow_true';
    }
  
    fetchData(extraParams);
  };
  

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
    fetchData(`q=${searchTerm}&page=${newPage}`);
  };

  return (
    <>
      <AppLayout>
        <Box display="flex" justifyContent="center" mb={2}>
          <ToggleButtonGroup
            color="primary"
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
                {home && home.topic_counts && (
                  <List>
                    {home.topic_counts.map((topic, index) => (
                       <a href={`/list_home?q=${topic[0]}`}>
                      <ListItem key={index}>
                        <ListItemText primary={topic[0] + " " + topic[1]} />
                      </ListItem>
                      </a>
                    ))}
                    <Button href="/list_topics">More</Button>
                  </List>
                )}
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
                {home && home.users && (
                  <List>
                    {home.users.map((user, index) => (
                      <ListItem key={user.id}>
                        <ListItemAvatar>
                          <Avatar src={user.avatar} alt={user.name} />
                        </ListItemAvatar>
                        <a href={`/user_profile?id=${user.id}`}>
                        <ListItemText primary={user.name} />
                        </a>
                      </ListItem>
                    ))}
                  </List>
                )}
                <Button href="/who_to_follow">More</Button>
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
