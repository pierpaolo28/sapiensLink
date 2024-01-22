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
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import { useRouter } from 'next/router';


import AppLayout from "@/components/AppLayout";
// import DBSetup from "@/components/DBSetup";
import { getRankHome } from "@/utils/routes";
import { RankHomeResponse } from "@/utils/types";
import Pagination from '@mui/material/Pagination';

export default function RankHome() {

  const [home, setHome] = React.useState<RankHomeResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const fetchData = async (extraParams = '') => {
    try {
      // Use the updated currentPage state to fetch the corresponding page
      const updatedParams = `page=${currentPage}&${extraParams}`;

      const homeData = await getRankHome(updatedParams);
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
  }, [router.query.q]);

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


  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
    fetchData(`q=${searchTerm}&page=${newPage}`);
  };


  return (
    <>
      <AppLayout>
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
                    <Link href={`/rank_home`} passHref>
                        <ListItem>
                          <ListItemText primary={"All"} />
                        </ListItem>
                      </Link>
                    {home.topic_counts.map((topic, index) => (
                      <Link key={index} href={`/rank_home?q=${topic[0]}`} passHref>
                        <ListItem key={index}>
                          <ListItemText primary={topic[0] + " " + topic[1]} />
                        </ListItem>
                      </Link>
                    ))}
                    <Button href="/rank_topics">More</Button>
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
                    placeholder="Search for ranks"
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
                  <Button href='create_rank'>Create Rank</Button>
                  {home && home.ranks ? (
                    home.ranks.map((rank, i) => (
                      <Card key={rank.id}>
                        <CardActionArea>
                          <CardContent>
                            <Link href={`/rank?id=${rank.id}`} passHref>
                              <Typography gutterBottom variant="h5">
                                {rank.name}
                              </Typography>
                            </Link>
                            <Typography paragraph color="text.secondary">
                              {rank.description}
                            </Typography>
                            <Grid container spacing={3} alignItems="center">
                              <Grid item xs>
                                <Stack direction="row" spacing={1}>
                                  {rank.topic.map((topic) => (
                                    <Chip key={topic.id} label={topic.name} />
                                  ))}
                                </Stack>
                              </Grid>
                              <Grid item>
                                {/* Display the score as text with plus/minus sign */}
                                <Typography variant="subtitle1" color={rank.score >= 0 ? 'primary' : 'error'}>
                                  {rank.score >= 0 ? `+${rank.score}` : rank.score}
                                </Typography>
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
                          <Avatar src={"http://localhost/static/" + user.avatar} alt={user.name} />
                        </ListItemAvatar>
                        <Link href={`/user_profile?id=${user.id}`} passHref>
                          <ListItemText primary={user.name} />
                        </Link>
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
