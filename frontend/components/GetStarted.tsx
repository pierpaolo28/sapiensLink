import styled from "@mui/system/styled";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material";
import Link from "@mui/material/Link";
import Box from "@mui/system/Box";
import Container from "@mui/system/Container";
import React from "react";

import CustomButton from "./CustomButton";

const GetStarted = () => {
  const theme = useTheme();
  const CustomContainer = styled(Container)(({ theme }) => ({
    backgroundColor: "#17275F",
    height: "416px",
    borderRadius: "15px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      height: "auto",
      flexDirection: "column",
      alignItems: "center",
      padding: theme.spacing(3, 3, 0, 3),
      width: "90%",
    },
  }));

  const CustomBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(10, 0, 10, 0),
    margin: theme.spacing(0, 2, 0, 2),
    [theme.breakpoints.down("md")]: {
      padding: "0",
    },
  }));

  const customButtonProps = {
    backgroundColor: "#fff",
    color: "#17275F",
    buttonText: "Get Started Now",
    getStartedBtn: true,
    theme: theme,
  };

  return (
    <CustomBox>
      <CustomContainer>
        <Box>
          <Typography
            sx={{ fontSize: "35px", color: "white", fontWeight: "700" }}
          >
            Explore List & Ranks
          </Typography>
          <Typography
            sx={{ fontSize: "16px", color: "#ccc", fontWeight: "500", my: 3 }}
          >
            No account required!
          </Typography>
          <Link href={`/list_home`}>
          <CustomButton {...customButtonProps} />
          </Link>
        </Box>

        <img
          src={'media/get_started.png'}
          alt="illustration"
          style={{ maxWidth: "100%" }}
        />
      </CustomContainer>
    </CustomBox>
  );
};

export default GetStarted;
