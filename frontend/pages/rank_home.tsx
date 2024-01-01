import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Avatar,
  TextField,
  ListItemAvatar,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Card, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AppLayout from "@/components/AppLayout";
import DBSetup from "@/components/DBSetup";
import { getRankHome } from "@/utils/routes";
import { RankHomeResponse } from "../utils/types";
import Pagination from '@mui/material/Pagination';

export default function HomePage() {

  const [home, setHome] = React.useState<RankHomeResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('latest');

  const fetchData = async (extraParams = '') => {
    try {
      const homeData = await getRankHome(extraParams);
      setHome(homeData);
    } catch (error) {
      console.error("Error fetching home data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Example data - replace with actual data
  const topics = ['All', 'Tech', 'Work', 'Education', 'Personal Finance'];

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
    fetchData(newValue === 'popular' ? 'top_voted=top_voted_true' : '');
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
          >
            <a href="/home">
              <ToggleButton
                value="lists"
              >
                Lists
              </ToggleButton>
            </a>
            <a href="/rank_home">
              <ToggleButton
                value="ranks"
              >
                Ranks
              </ToggleButton>
            </a>
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
                <Stack spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  {home && home.ranks ? (
                    home.ranks.map((rank, i) => (
                      <Grid item xs={12} md={8} key={rank.id}>
                        <Card variant="outlined" sx={{ p: 2, mb: 4 }}>
                          <a href={`/rank?id=${rank.id}`}>
                            <Typography variant="h5" gutterBottom>
                              {rank.name}
                            </Typography>
                          </a>

                          {/* Last activity and watch toggle */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2">
                              Last Activity: {new Date(rank.updated).toLocaleString()}
                            </Typography>
                          </Box>

                          <Typography variant="body1" gutterBottom>
                            {rank.description}
                          </Typography>

                          {/* Overall score */}
                          <Typography variant="body2" gutterBottom>
                            Overall Score: {rank.score}
                          </Typography>

                          {/* Display each element in content */}
                          <List>
                            {Object.values(rank.content).map((element, index) => (
                              <ListItem key={index}>
                                <Grid container alignItems="center">
                                  <Grid item xs>
                                    <ListItemText primary={element.element} />
                                  </Grid>
                                </Grid>
                              </ListItem>
                            ))}
                          </List>
                        </Card>
                      </Grid>
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
        <div>
          <DBSetup></DBSetup>
        </div>
      </AppLayout>
    </>
  );
}
