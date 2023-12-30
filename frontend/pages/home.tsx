import {
  Avatar, Grid, Chip, CardActionArea,
  Typography, CardContent, Card, Stack
} from "@mui/material";
import AppLayout from "@/components/AppLayout";
import React from "react";
import DBSetup from "@/components/DBSetup";
import { getHome } from "@/utils/routes";
import { HomeResponse } from "../utils/types";

export default function Home() {

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

  return (
    <AppLayout>
      <Stack spacing={2}>
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
      <div>
        <DBSetup></DBSetup>
      </div>
    </AppLayout>
  );
}
