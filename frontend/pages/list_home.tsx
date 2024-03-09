import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Chip from "@mui/material/Chip";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/material/Pagination";
import dynamic from "next/dynamic";
import MuiLink from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
const DynamicToggleButton = dynamic(
  () => import("@mui/material/ToggleButton"),
  { ssr: false } // Disable server-side rendering
);

import AppLayout from "@/components/AppLayout";
// import DBSetup from "@/components/DBSetup";
import { getHome } from "@/utils/routes";
import { HomeWithUserDataResponse } from "@/utils/types";
import { isUserLoggedIn } from "@/utils/auth";

export default function ListHome() {
  const [home, setHome] = useState<HomeWithUserDataResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { success, error } = router.query;

  // Function to fetch user data
  const getUserData = async (userId: number) => {
    try {
      const userResponse = await fetch(
        `http://localhost/api/get_user/${userId}/`,
        {
          method: "GET",
          headers: {
            "X-NextJS-Application":
              process.env.NEXT_PUBLIC_X_NEXTJS_APPLICATION!,
            "Content-Type": "application/json",
          },
        }
      );
      const userData = await userResponse.json();
      return userData;
    } catch (error) {
      console.error(`Error fetching user data for user ${userId}:`, error);
      return null;
    }
  };

  const fetchData = async (extraParams = "") => {
    try {
      if (isUserLoggedIn()) {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost/api/home_page/?page=${currentPage}&${extraParams}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const homeData = await response.json();

        // Fetch user data for each commenter
        const listsWithUserData = await Promise.all(
          homeData.lists.map(async (list: any) => {
            const userData = await getUserData(list.author);
            return {
              ...list,
              authorData: userData,
            };
          })
        );

        const updatedData = {
          ...homeData,
          lists: listsWithUserData,
        };
        setHome(updatedData);
      } else {
        // Use the updated currentPage state to fetch the corresponding page
        const updatedParams = `page=${currentPage}&${extraParams}`;
        const homeData = await getHome(updatedParams);

        // Fetch user data for each commenter
        const listsWithUserData = await Promise.all(
          homeData.lists.map(async (list: any) => {
            const userData = await getUserData(list.author);
            return {
              ...list,
              authorData: userData,
            };
          })
        );

        const updatedData = {
          ...homeData,
          lists: listsWithUserData,
        };

        setHome(updatedData);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    }
  };

  useEffect(() => {
    // Parse the query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("q");

    // Set the search term if it exists
    if (queryParam) {
      setSearchTerm(queryParam);
      fetchData(`q=${queryParam}`);
    } else {
      fetchData();
    }
  }, [router.query.q]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("latest");

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async (event: any) => {
    event.preventDefault();
    fetchData(`q=${searchTerm}`);
  };

  const handleTabChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string
  ) => {
    setSelectedTab(newValue);

    let extraParams = "";

    if (newValue === "latest") {
      extraParams = "";
    } else if (newValue === "popular") {
      extraParams = "top_voted=top_voted_true";
      // TODO: In order to make this call the user should be logged in and we need to pass the access token
      // If an user is not logged in the this should be hidden
    } else if (newValue === "follow") {
      extraParams = "follow=follow_true";
    }

    fetchData(extraParams);
  };

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentPage(newPage);
    fetchData(`q=${searchTerm}&page=${newPage}`);
  };

  return (
    <>
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4, px: 0 }}>
          <Grid container spacing={3}>
            {/* Left side - Topics and More */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ mb: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Browse Topics
                </Typography>
                {home && home.topic_counts && (
                  <List>
                    <MuiLink
                      href={`/list_home`}
                      color={"text.secondary"}
                      sx={{
                        transition: ".2s",
                        "&:hover": {
                          color: "text.primary",
                        },
                      }}
                    >
                      <ListItem
                        sx={(theme) => ({
                          transition: ".2s",
                          borderRadius: 1,
                          "&:hover": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.03)"
                                : "rgba(0, 0, 0, 0.05)",
                          },
                        })}
                      >
                        <ListItemText primary={"All"} />
                      </ListItem>
                    </MuiLink>
                    {home.topic_counts.map((topic, index) => (
                      <MuiLink
                        key={index}
                        href={`/list_home?q=${topic[0]}`}
                        color={"text.secondary"}
                        underline={"hover"}
                        sx={{
                          transition: ".2s",
                          "&:hover": {
                            color: "text.primary",
                          },
                        }}
                      >
                        <ListItem
                          sx={(theme) => ({
                            transition: ".2s",
                            borderRadius: 1,
                            "&:hover": {
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255, 255, 255, 0.03)"
                                  : "rgba(0, 0, 0, 0.05)",
                            },
                          })}
                        >
                          <ListItemText primary={topic[0] + " " + topic[1]} />
                        </ListItem>
                      </MuiLink>
                    ))}
                    <Button variant={"outlined"} href="/list_topics">
                      More
                    </Button>
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
                  {isUserLoggedIn() && (
                    <DynamicToggleButton value="follow">
                      Follow List
                    </DynamicToggleButton>
                  )}
                  <ToggleButton value="popular">Popular</ToggleButton>
                </ToggleButtonGroup>

                <form
                  onSubmit={handleSearchSubmit}
                  style={{ marginTop: "16px", marginBottom: "16px" }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for lists"
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
                <Stack spacing={2}>
                  {Array.isArray(success)
                    ? // Handle array case
                      success.map((message, index) => (
                        <Alert key={index} severity="success">
                          <AlertTitle>Success</AlertTitle>
                          {decodeURIComponent(message)}
                        </Alert>
                      ))
                    : // Handle string case
                      success && (
                        <Alert severity="success">
                          <AlertTitle>Success</AlertTitle>
                          {decodeURIComponent(success)}
                        </Alert>
                      )}

                  {Array.isArray(error)
                    ? // Handle array case
                      error.map((message, index) => (
                        <Alert key={index} severity="error">
                          <AlertTitle>Error</AlertTitle>
                          {decodeURIComponent(message)}
                        </Alert>
                      ))
                    : // Handle string case
                      error && (
                        <Alert severity="error">
                          <AlertTitle>Error</AlertTitle>
                          {decodeURIComponent(error)}
                        </Alert>
                      )}
                  <Button variant={"outlined"} href="create_list">
                    Create List
                  </Button>
                  {home && home.lists ? (
                    home.lists.map((list, i) => (
                      <Card key={list.id}>
                        <CardActionArea>
                          <CardContent>
                            <MuiLink
                              href={`/list/${list.id}`}
                              color={"text.secondary"}
                              underline={"hover"}
                              sx={{
                                transition: ".2s",
                                "&:hover": {
                                  color: "text.primary",
                                },
                              }}
                            >
                              <Typography gutterBottom variant="h5">
                                {list.name}
                              </Typography>
                            </MuiLink>
                            {list.authorData && (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ marginTop: 1 }}
                              >
                                <Avatar
                                  src={
                                    "http://localhost/static" +
                                    list.authorData.avatar
                                  }
                                  sx={{ width: 32, height: 32 }}
                                />
                                <Typography variant="subtitle2">
                                  {list.authorData.name}
                                </Typography>
                              </Stack>
                            )}
                            <Typography
                              paragraph
                              color="text.secondary"
                              sx={{ marginTop: 1 }}
                            >
                              {list.description}
                            </Typography>
                            <Grid
                              container
                              spacing={3}
                              alignItems="center"
                              sx={{ marginTop: 1 }}
                            >
                              <Grid item xs>
                                <Stack direction="row" spacing={1}>
                                  {list.topic.map((topic) => (
                                    <Chip key={topic.id} label={topic.name} />
                                  ))}
                                </Stack>
                              </Grid>
                              {list.score !== undefined && (
                                <Grid item xs sx={{ textAlign: "right" }}>
                                  <Typography
                                    variant="subtitle1"
                                    color={
                                      list.score >= 0 ? "primary" : "error"
                                    }
                                  >
                                    {list.score >= 0
                                      ? `+${list.score}`
                                      : list.score}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))
                  ) : (
                    // Render loading state or an error message
                    <Typography
                      sx={{ textAlign: "center", py: 2 }}
                      color={"text.secondary"}
                    >
                      Loading...
                    </Typography>
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
                    {home.users.map((user) => (
                      <ListItem
                        key={user.id}
                        sx={(theme) => ({
                          [theme.breakpoints.down("sm")]: { px: 0 },
                        })}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={"http://localhost/static/" + user.avatar}
                            alt={user.name}
                          />
                        </ListItemAvatar>
                        <MuiLink
                          href={`/user_profile?id=${user.id}`}
                          color={"text.secondary"}
                          underline={"hover"}
                          sx={{
                            transition: ".2s",
                            "&:hover": {
                              color: "text.primary",
                            },
                          }}
                        >
                          <ListItemText primary={user.name} />
                        </MuiLink>
                      </ListItem>
                    ))}
                  </List>
                )}
                <Button variant={"outlined"} href="/who_to_follow">
                  More
                </Button>
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
