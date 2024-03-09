import { Box, styled, Typography, Link } from "@mui/material";
import React from "react";

interface FeaturedProps {
  id: string;
  img: string;
  title: string;
  description: string;
}

const Featured = ({ id, img, title, description }: FeaturedProps) => {
  const FeaturedBox = styled(Box)(({ theme }) => ({
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    overflow: "hidden",
    maxWidth: 350,
    backgroundColor: "#fff",
    textDecoration: "none",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
    margin: theme.spacing(0, 2, 0, 2),
    [theme.breakpoints.down("md")]: {
      margin: theme.spacing(2, 0, 2, 0),
    },
    transition: "0.3s",
    "&:hover img": {
      transform: "scale(1.03)",
      transition: "0.3s",
    },
  }));

  const ImgContainer = styled(Box)(() => ({
    width: "100%",
    overflow: "hidden",
  }));

  return (
    <FeaturedBox>
      <Link href={`/list/${id}`} underline={"none"}>
        <ImgContainer>
          <img
            src={img}
            alt="featuredlist"
            style={{ maxWidth: "100%", transition: "0.3s" }}
          />
        </ImgContainer>

        <Box sx={{ padding: "1rem" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: "700", color: "#101828" }}
          >
            {title}
          </Typography>
          <Typography variant="body2" sx={{ my: 2, color: "#667085" }}>
            {description}
          </Typography>
        </Box>
      </Link>
    </FeaturedBox>
  );
};

export default Featured;
