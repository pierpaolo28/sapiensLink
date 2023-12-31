"use client";
import React from "react";
import {
  Typography,
  Button,
  Container,
  Grid,
  Box,
  Paper,
  Stack,
  Link,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AppLayout from "@/components/AppLayout";

const testimonials = [
  {
    name: 'John Doe',
    text: 'This service is outstanding! I highly recommend it.',
    image: '/path-to-image1.jpg' // Replace with actual image paths
  },
  {
    name: 'Jane Smith',
    text: 'A truly transformative experience. Excellent support and features.',
    image: '/path-to-image2.jpg'
  },
  // Add more testimonials as needed
];

interface Testimonial {
  text: string;
  image: string;
  name: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {testimonial.text}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Avatar src={testimonial.image} alt={testimonial.name} sx={{ width: 60, height: 60, mr: 2 }} />
        <Typography variant="subtitle1">{testimonial.name}</Typography>
      </Box>
    </Paper>
  );
};

export default function Home() {
  return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ my: 4 }}>
          {/* Main content */}
          <Box sx={{ my: 4, textAlign: "center" }}>
            <Typography variant="h1" component="h1" gutterBottom>
              Sharing Knowledge One link at a time
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" paragraph>
              Lorem ipsum has been the industry&aposs standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </Typography>
            <Button variant="contained" color="primary" size="large" href="home">
              Get Started
            </Button>
          </Box>

          {/* Features section */}
          <Typography variant="h2" align="center" gutterBottom>
            In Sapiens Link
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Repeat for each feature */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
                <Typography gutterBottom variant="h5" component="h3">
                  Lists
                </Typography>
                <Typography variant="body1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Pellentesque massa nunc.
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Button variant="outlined">Learn More</Button>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
                <Typography gutterBottom variant="h5" component="h3">
                  Suggest Edits
                </Typography>
                <Typography variant="body1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Pellentesque massa nunc.
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Button variant="outlined">Learn More</Button>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
                <Typography gutterBottom variant="h5" component="h3">
                  Ranks
                </Typography>
                <Typography variant="body1">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Pellentesque massa nunc.
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Button variant="outlined">Learn More</Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* User list with links */}
          <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* Other content */}
            <Grid
              container
              spacing={4}
              justifyContent="center"
              alignItems="center"
              sx={{ my: 4 }}
            >
              {/* Left section with user list and links */}
              <Grid item xs={12} md={7}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "secondary.main" }}>
                        <AccountCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Jen O&aposConnor"
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            Design System
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Hi there! Here my collection of resources to start with Design
                    Systems... Enjoy!
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
                    {/* Links here */}
                    <Link href="#" underline="hover" color="primary">
                      www.wix.com/studio/blog/design-system-examples
                    </Link>
                    <Link href="#" underline="hover" color="primary">
                      www.wix.com/studio/blog/design-system-examples
                    </Link>
                    <Link href="#" underline="hover" color="primary">
                      www.wix.com/studio/blog/design-system-examples
                    </Link>
                    {/* Add more links */}
                  </Box>
                </Paper>
              </Grid>


              {/* Right section with additional text or content */}
              <Grid item xs={12} md={5}>
                <Typography variant="h2" gutterBottom>
                  Lists
                </Typography>
                <Typography variant="body1">
                  Create, share and find meaningful resources!
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Lorem ipsum dolor sit amet consectetur. Sem augue.
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Button variant="contained" href="list">Get Started</Button>
                </Stack>
              </Grid>
            </Grid>

            <Grid
              container
              spacing={4}
              justifyContent="center"
              alignItems="center"
              sx={{ my: 4 }}
            >
              {/* Right section with additional text or content */}
              <Grid item xs={12} md={5}>
                <Typography variant="h2" gutterBottom>
                  Suggest Edits
                </Typography>
                <Typography variant="body1">
                  Create, share and find meaningful resources!
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Lorem ipsum dolor sit amet consectetur. Sem augue.
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Button variant="contained" href="list_pr">Get Started</Button>
                </Stack>
              </Grid>

              {/* Left section with user list and links */}
              <Grid item xs={12} md={7}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "secondary.main" }}>
                        <AccountCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Jen O&aposConnor"
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            Design System
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Hi there! Here my collection of resources to start with
                    Design Systems... Enjoy!
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
                    {/* Links here */}
                    <Link href="#" underline="hover" color="primary">
                      www.wix.com/studio/blog/design-system-examples
                    </Link>
                    {/* Add more links */}
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Grid
              container
              spacing={4}
              justifyContent="center"
              alignItems="center"
              sx={{ my: 4 }}
            >
              {/* Left section with user list and links */}
              <Grid item xs={12} md={7}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "secondary.main" }}>
                        <AccountCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Jen O&aposConnor"
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            Design System
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Hi there! Here my collection of resources to start with
                    Design Systems... Enjoy!
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
                    {/* Links here */}
                    <Link href="#" underline="hover" color="primary">
                      www.wix.com/studio/blog/design-system-examples
                    </Link>
                    {/* Add more links */}
                  </Box>
                </Paper>
              </Grid>

              {/* Right section with additional text or content */}
              <Grid item xs={12} md={5}>
                <Typography variant="h2" gutterBottom>
                  Ranks
                </Typography>
                <Typography variant="body1">
                  Create, share and find meaningful resources!
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Lorem ipsum dolor sit amet consectetur. Sem augue.
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Button variant="contained" href="rank">Get Started</Button>
                </Stack>
              </Grid>
            </Grid>
          </Container>

          <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h2" align="center" gutterBottom>
              Testimonials
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <TestimonialCard testimonial={testimonial} />
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Call to action */}
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <Typography variant="h2" component="h2" gutterBottom>
              Start now
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <Button variant="outlined" size="large">
                Contact Us
              </Button>
              <Button variant="contained" size="large" href="home">
                Get Started
              </Button>
            </Stack>
          </Box>
        </Container>
      </AppLayout>
  );
}
