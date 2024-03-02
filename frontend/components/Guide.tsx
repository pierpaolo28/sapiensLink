import React from "react";
import Box from "@mui/material/Box";
import styled from "@mui/system/styled";
import Typography from "@mui/material/Typography";
import { Button } from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ListIcon from "@mui/icons-material/List";
import EditIcon from "@mui/icons-material/Edit";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Link from "next/link";
import MuiLink from "@mui/material/Link";

const Guide = () => {
  const CustomBox = styled(Box)(({ theme }) => ({
    width: "30%",
    [theme.breakpoints.down("md")]: {
      width: "85%",
    },
  }));

  const GuidesBox = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-around",
    width: "70%",
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: "0",
      flexDirection: "column",
    },
  }));

  const GuideBox = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(2, 0, 2, 0),
    },
  }));

  const IconOutsideBoxProps = {
    bgcolor: "#F9F5FF",
    m: "0",
    p: "6px",
    lineHeight: "0",
    borderRadius: "50%",
  };
  const IconInsideBoxProps = {
    bgcolor: "#F0E4FE",
    m: "0",
    p: "3px",
    lineHeight: "0",
    borderRadius: "50%",
  };

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
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        mt: 10,
      }}
    >
      <Divider />
      <Typography
        variant="h3"
        color={"text.primary"}
        sx={{
          fontSize: "35px",
          fontWeight: "bold",
          my: 3,
          textAlign: "center",
        }}
      >
        Features in SapiensLink
      </Typography>

      <CustomBox>
        <Typography
          variant="body2"
          color={"text.secondary"}
          sx={{
            fontSize: "16px",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          The home to share knowledge collaboratively.
        </Typography>
      </CustomBox>

      <GuidesBox>
        <GuideBox>
          <Box sx={IconOutsideBoxProps}>
            <Box sx={IconInsideBoxProps}>
              <ListIcon color={"primary"} />
            </Box>
          </Box>
          <Typography
            variant="body2"
            color={"text.primary"}
            sx={{
              fontWeight: "500",
              fontSize: "20px",
              my: 1,
            }}
          >
            Lists
          </Typography>
          <MuiLink
            href="#lists"
            underline={"hover"}
            color={"text.secondary"}
            sx={{
              transition: ".2s",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <Box
              sx={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Guide
              </Typography>
              <ArrowRightAltIcon color={"primary"} />
            </Box>
          </MuiLink>
        </GuideBox>

        <GuideBox>
          <Box sx={IconOutsideBoxProps}>
            <Box sx={IconInsideBoxProps}>
              <EditIcon color={"primary"} />
            </Box>
          </Box>

          <Typography
            variant="body2"
            color={"text.primary"}
            sx={{
              fontWeight: "500",
              fontSize: "20px",
              my: 1,
            }}
          >
            Suggest Edits
          </Typography>
          <MuiLink
            href="#suggests"
            underline={"hover"}
            color={"text.secondary"}
            sx={{
              transition: ".2s",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <Box
              sx={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "14px" }}
              >
                Guide
              </Typography>
              <ArrowRightAltIcon color={"primary"} />
            </Box>
          </MuiLink>
        </GuideBox>

        <GuideBox>
          <Box sx={IconOutsideBoxProps}>
            <Box sx={IconInsideBoxProps}>
              <TrendingUpIcon color={"primary"} />
            </Box>
          </Box>

          <Typography
            variant="body2"
            color={"text.primary"}
            sx={{
              fontWeight: "500",
              fontSize: "20px",
              my: 1,
            }}
          >
            Ranks
          </Typography>
          <MuiLink
            href="#ranks"
            underline={"hover"}
            color={"text.secondary"}
            sx={{
              transition: ".2s",
              "&:hover": {
                color: "text.primary",
              },
            }}
          >
            <Box
              sx={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "14px" }}
              >
                Guide
              </Typography>
              <ArrowRightAltIcon color={"primary"} />
            </Box>
          </MuiLink>
        </GuideBox>
      </GuidesBox>

      {/* <CustomButton {...customButtonProps} /> */}
      <Button color={"primary"} variant={"contained"} size={"large"}>
        Our vision
      </Button>
    </Box>
  );
};

export default Guide;
