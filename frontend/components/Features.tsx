import styled from "@mui/system/styled";
import Typography from "@mui/material/Typography";
import Box from "@mui/system/Box";
import Container from "@mui/system/Container";
import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material";

const Features = () => {
  const CustomBox = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(10),
    alignItems: "center",
    marginBottom: "5px",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      textAlign: "center",
      marginBottom: "40px",
      gap: theme.spacing(4),
    },
  }));

  const ImgContainer = styled(Box)(({ theme }) => ({
    width: "100%",
    borderRadius: "15px",
    lineHeight: "0",
    overflow: "hidden",
    [theme.breakpoints.down("md")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  }));

  const LargeText = styled(Typography)(({ theme }) => ({
    fontSize: "64px",
    color: "#000",
    fontWeight: "700",
    [theme.breakpoints.down("md")]: {
      fontSize: "32px",
    },
  }));

  const SmallText = styled(Typography)(({ theme }) => ({
    fontSize: "18px",
    color: "#7B8087",
    fontWeight: "500",
    [theme.breakpoints.down("md")]: {
      fontSize: "14px",
    },
  }));

  const TextFlexbox = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(7),
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(0, 5, 0, 5),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      gap: theme.spacing(5),
    },
  }));

  const Divider = styled(Box)(({ theme }) => ({
    width: "13%",
    height: "5px",
    backgroundColor: theme.palette.mode === "dark" ? "#fff" : "#121212",
    [theme.breakpoints.down("md")]: {
      marginLeft: "auto",
      marginRight: "auto",
    },
  }));

  const theme = useTheme();
  // Add a state variable to track whether the screen size is below "md" breakpoint
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // useEffect to update the isSmallScreen state based on screen width
  useEffect(() => {
    const handleResize = () => {
      // Check if the screen width is below the "md" breakpoint
      setIsSmallScreen(window.innerWidth < theme.breakpoints.values.md);
    };

    // Initial check and attach resize event listener
    handleResize();
    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [theme.breakpoints]);

  return (
    <Box sx={{ py: 10 }}>
      <Container>
        <CustomBox>
          {!isSmallScreen && (
            <ImgContainer>
              <img
                src={"images/list.png"}
                alt="list"
                style={{ maxWidth: "100%" }}
              />
            </ImgContainer>
          )}

          <Box id="lists">
            <Divider />
            <Typography
              color={"text.primary"}
              sx={{
                fontSize: "35px",
                fontWeight: "700",
                my: 3,
              }}
            >
              Lists
            </Typography>

            <Typography
              color={"text.secondary"}
              sx={{
                fontSize: "16px",
                lineHeight: "27px",
              }}
            >
              Share your expertise with your audience, retaining full ownership.
              Get advice and make your contributions memorable.
            </Typography>
          </Box>

          {isSmallScreen && (
            <ImgContainer>
              <img
                src={"images/list.png"}
                alt="list"
                style={{ maxWidth: "100%" }}
              />
            </ImgContainer>
          )}
        </CustomBox>

        <CustomBox>
          <Box id="suggests">
            <Divider />
            <Typography
              color={"text.primary"}
              sx={{
                fontSize: "35px",
                fontWeight: "700",
                my: 3,
              }}
            >
              Suggest Edits
            </Typography>

            <Typography
              color={"text.secondary"}
              sx={{
                fontSize: "16px",
                lineHeight: "27px",
              }}
            >
              Help contributors provide the best possible content and get
              recognized by the community for your support.
            </Typography>
          </Box>

          <ImgContainer>
            <img
              src={"images/suggest_edit.png"}
              alt="suggest_edit"
              style={{ maxWidth: "100%" }}
            />
          </ImgContainer>
        </CustomBox>

        <CustomBox>
          {!isSmallScreen && (
            <ImgContainer>
              <img
                src={"images/rank.png"}
                alt="rank"
                style={{ maxWidth: "100%" }}
              />
            </ImgContainer>
          )}

          <Box id="ranks">
            <Divider />
            <Typography
              color={"text.primary"}
              sx={{
                fontSize: "35px",
                fontWeight: "700",
                my: 3,
              }}
            >
              Ranks
            </Typography>

            <Typography
              color={"text.secondary"}
              sx={{
                fontSize: "16px",
                lineHeight: "27px",
              }}
            >
              Ask for advice to the community and let the vox populi help you
              fostering new ideas.
            </Typography>
          </Box>

          {isSmallScreen && (
            <ImgContainer>
              <img
                src={"images/rank.png"}
                alt="rank"
                style={{ maxWidth: "100%" }}
              />
            </ImgContainer>
          )}
        </CustomBox>
        {/* TODO: To Add back after lunch with real statistics */}
        {/* <TextFlexbox>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <LargeText>2500+</LargeText>
            <SmallText>Lists</SmallText>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <LargeText>3000+</LargeText>
            <SmallText>Ranks</SmallText>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <LargeText>3500+</LargeText>
            <SmallText>Users</SmallText>
          </Box>
        </TextFlexbox> */}
      </Container>
    </Box>
  );
};

export default Features;
