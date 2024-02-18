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
    maxWidth: 350,
    backgroundColor: "#fff",
    margin: theme.spacing(0, 2, 0, 2),
    [theme.breakpoints.down("md")]: {
      margin: theme.spacing(2, 0, 2, 0),
    },
  }));

  const ImgContainer = styled(Box)(() => ({
    width: "100%",
  }));

  return (
    <FeaturedBox>
      <Link href={`/list/${id}`}>
      <ImgContainer>
        <img src={img} alt="housePhoto" style={{ maxWidth: "100%" }} />
      </ImgContainer>

      <Box sx={{ padding: "1rem" }}>
        <Typography variant="body2" sx={{ fontWeight: "700" }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ my: 2 }}>
          {description}
        </Typography>
      </Box>
      </Link>
    </FeaturedBox>
  );
};

export default Featured;
