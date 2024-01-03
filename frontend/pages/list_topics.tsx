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

import AppLayout from "@/components/AppLayout";
import { getListTopics } from "@/utils/routes";
import { ListTopicsResponse } from "@/utils/types";

export default function ListTopics() {

  const [topics, setHome] = React.useState<ListTopicsResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async (extraParams = '') => {
    try {
      const homeData = await getListTopics(extraParams);
      setHome(homeData);
    } catch (error) {
      console.error("Error fetching topics data:", error);
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
                  Browse Topics
                </Typography>
                <form onSubmit={handleSearchSubmit} style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for topics"
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
                {topics && (
                  <List>
                  <ListItem button>
                    <a href="/rank_home">
                      <ListItemText primary={"All " + topics.all_list_count} />
                    </a>
                  </ListItem>
                  {topics.topic_counts.map((topic, index) => (
                    <ListItem button key={index}>
                      <a href={`/list_home?q=${topic[0]}`}>
                        <ListItemText primary={topic[0] + " " + topic[1]} />
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