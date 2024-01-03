import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import AppLayout from "@/components/AppLayout";
import { getWhoToFollow } from "@/utils/routes";
import { WhoToFollowResponse } from "@/utils/types";

export default function WhoToFollowPage() {

  const [whoToFollow, setHome] = React.useState<WhoToFollowResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async (extraParams = '') => {
    try {
      const homeData = await getWhoToFollow(extraParams);
      setHome(homeData);
    } catch (error) {
      console.error("Error fetching whoToFollow data:", error);
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
        <Grid container spacing={3} justifyContent="center" alignItems="center">

            {/* Center - List feed, search, and tabs */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ mb: 2, p: 2 }}>
              <Typography variant="h3" gutterBottom>
                  Browse Users
                </Typography>
                <form onSubmit={handleSearchSubmit} style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for users"
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
                {whoToFollow && (
                  <List>
                  {whoToFollow.users.map((user, index) => (
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
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </AppLayout>
    </>
  );
}
