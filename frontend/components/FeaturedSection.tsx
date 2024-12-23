import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import styled from "@mui/system/styled";
import Typography from "@mui/material/Typography";

import Featured from "./Featured";

export const featuredItems = [
  {
    id: "1",
    img: "images/personal_finance.jpg",
    title: "Personal Finance",
    description: "Learning how to budget your finances and plan for retirement",
  },

  {
    id: "2",
    img: "images/tech_blogs.jpg",
    title: "Tech Blogs",
    description:
      "A collection of interesting tech blogs to learn something new everyday!",
  },

  {
    id: "3",
    img: "images/pitch.jpg",
    title: "Pitch Decks",
    description:
      "Learn from some of the best tech companies how to make your pitch deck",
  },
];

const FeaturedSection = () => {
  const FeaturedSectionBox = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "stretch",
    gap: "1rem",
    marginTop: theme.spacing(5),
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  }));

  const FeaturedSectionTextBox = styled(Box)(({ theme }) => ({
    [theme.breakpoints.down("md")]: {
      textAlign: "center",
    },
  }));

  const Divider = styled(Box)(({ theme }) => ({
    width: "8%",
    height: "5px",
    backgroundColor: theme.palette.mode === "dark" ? "#fff" : "#121212",
    [theme.breakpoints.down("md")]: {
      width: "13%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  }));

  return (
    <Box
      sx={{
        mt: 5,
        py: 10,
      }}
    >
      <Container>
        <FeaturedSectionTextBox>
          <Divider />
          <Typography sx={{ fontSize: "35px", fontWeight: "bold", mt: 3 }}>
            Featured Lists & Ranks
          </Typography>
          <Typography color={"text.secondary"} sx={{ fontSize: "16px", mt: 1 }}>
            Top content from SapiensLink
          </Typography>
        </FeaturedSectionTextBox>

        <FeaturedSectionBox>
          {featuredItems.map((featured) => (
            <Featured
              key={featured.id}
              id={featured.id}
              img={featured.img}
              title={featured.title}
              description={featured.description}
            />
          ))}
        </FeaturedSectionBox>
      </Container>
    </Box>
  );
};

export default FeaturedSection;
