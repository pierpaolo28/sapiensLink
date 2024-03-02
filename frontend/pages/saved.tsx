import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";

import AppLayout from "@/components/AppLayout";
import { SavedPageResponse } from "@/utils/types";

export default function SavedPage() {
  const [savedItems, setHome] = React.useState<SavedPageResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async (extraParams = "") => {
    try {
      const currentUrl = window.location.href;
      const url = new URL(currentUrl);
      const userId = url.searchParams.get("id");
      const response = await fetch(
        `http://localhost/api/saved_content_page/${userId}/?${extraParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setHome(data);
    } catch (error) {
      console.error("Error fetching saved data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: any) => {
    event.preventDefault();
    const queryParams = `q=${searchTerm}`;
    fetchData(queryParams);
  };

  return (
    <>
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4, px: 0 }}>
          <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="center"
          >
            {/* Center - List feed, search, and tabs */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ mb: 2, p: 2 }}>
                <Typography variant="h3" gutterBottom>
                  Browse Saved Items
                </Typography>
                <form
                  onSubmit={handleSearchSubmit}
                  style={{ marginTop: "16px", marginBottom: "16px" }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for saved items"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      endAdornment: (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSearchSubmit}
                        >
                          <SearchIcon />
                        </Button>
                      ),
                    }}
                  />
                </form>
                <Stack
                  spacing={2}
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Typography>Saved Lists</Typography>
                  {savedItems &&
                  savedItems.saved_lists &&
                  savedItems.saved_lists.length > 0 ? (
                    <List>
                      {savedItems.saved_lists.map((list, index) => (
                        <ListItem button key={index}>
                          <Link href={`/list/${list.list}`} passHref>
                            <ListItemText primary={list.list_name.name} />
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No saved lists</Typography>
                  )}
                  <Typography>Saved Ranks</Typography>
                  {savedItems &&
                  savedItems.saved_ranks &&
                  savedItems.saved_ranks.length > 0 ? (
                    <List>
                      {savedItems.saved_ranks.map((rank, index) => (
                        <ListItem button key={index}>
                          <Link href={`/rank/${rank.rank}`} passHref>
                            <ListItemText primary={rank.rank_name.name} />
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No saved ranks</Typography>
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
