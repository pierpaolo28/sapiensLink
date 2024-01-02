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

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async (event: any) => {
    event.preventDefault();
    fetchData(`q=${searchTerm}`)
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
                {home && (
                  <List>
                    {home.topic_counts.map((topic, index) => (
                      <ListItem button key={index}>
                        <ListItemText primary={topic[0] + " " + topic[1]} />
                      </ListItem>
                    ))}
                    <Button>More</Button>
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
                  <Button href='create_rank'>Create Rank</Button>
                  {home && home.ranks ? (
                    home.ranks.map((rank, i) => (
                      <Grid item key={rank.id} sx={{ width: '100%' }}>
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
                {home && (
                  <List>
                    {home.users.map((user, index) => (
                      <ListItem key={user.id}>
                        <ListItemAvatar>
                          <Avatar src={user.avatar} alt={user.name} />
                        </ListItemAvatar>
                        <ListItemText primary={user.name} />
                      </ListItem>
                    ))}
                  </List>
                )}
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
