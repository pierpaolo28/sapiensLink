import AppLayout from "@/components/AppLayout";
import React from "react";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";

import DBSetup from "@/components/DBSetup";
import { getHome } from "@/utils/routes";

export default async function Home() {
  const home = await getHome();

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
