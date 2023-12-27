import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AppLayout from "../components/AppLayout";
import { getHome } from "../utils/routes";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
// import DBSetup from "@/components/DBSetup";

export default async function Home() {
  const home = await getHome();
  console.log(home);

  return (
    <AppLayout>
      <Stack spacing={2}>
        {home.lists.map((list, i) => (
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
        ))}
      </Stack>
      {/* <div>
        <DBSetup></DBSetup> 
      </div> */}
    </AppLayout>
  );
}
