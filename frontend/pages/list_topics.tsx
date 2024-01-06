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
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';

import AppLayout from "@/components/AppLayout";
import { getListTopics } from "@/utils/routes";
import { ListTopicsResponse } from "@/utils/types";
import ListRankSwitcher from '@/components/ListRankSwitcher';

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
      <ListRankSwitcher />

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
                    <Link href={`/rank_home`} passHref>
                      <ListItemText primary={"All " + topics.all_list_count} />
                    </Link>
                  </ListItem>
                  {topics.topic_counts.map((topic, index) => (
                    <ListItem button key={index}>
                      <Link href={`/list_home?q=${topic[0]}`} passHref>
                        <ListItemText primary={topic[0] + " " + topic[1]} />
                      </Link>
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
