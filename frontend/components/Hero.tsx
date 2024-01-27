import Box from "@mui/material/Box";
import styled from "@mui/system/styled";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material";
import { Container } from "@mui/system";
import React from "react";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import CustomButton from "./CustomButton";

const Hero = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 20000
  };

  const CustomBox = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(5),
    minHeight: '60vh',
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },
  }));

  const Title = styled(Typography)(({ theme }) => ({
    fontSize: "64px",
    color: "#000336",
    fontWeight: "bold",
    margin: theme.spacing(4, 0, 4, 0),
    [theme.breakpoints.down("sm")]: {
      fontSize: "40px",
    },
  }));

  const customButtonProps = {
    backgroundColor:"#0F1B4C", 
    color:"#fff",
    buttonText:"Get Started", 
    heroBtn:true,
    theme: theme,
  };

  return (
    <Box sx={{ 
      // backgroundColor: "#E6F0FF", 
      minHeight: "80vh", 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: isSmallScreen ? 'start' : 'center',
      alignItems: 'center',
    }}>
      <Container>
        <CustomBox>
          <Box sx={{ flex: 1, minWidth: "40%" }}>
            <Typography variant="body2" sx={{ fontSize: "18px", color: "#687690", fontWeight: "500", mt: 10, mb: 4 }}>
              Welcome to SapiensLink
            </Typography>
            <Title variant="h1">Sharing knowledge one link at the time.</Title>
            <Typography variant="body2" sx={{ fontSize: "18px", color: "#5A6473", my: 4 }}>
              Create, share and find meaningful resources!
            </Typography>
            <Link href={`/list_home`}>
            <CustomButton {...customButtonProps} />
            </Link>
          </Box>

          {!isSmallScreen && (
            <Box sx={{ flex: 1, minWidth: "50%" }}>
              <Slider {...settings}>
                <div><img src="images/hero1.jpeg" alt="Image 1" style={{ width: "100%", height: "auto" }} /></div>
                <div><img src="images/hero2.jpeg" alt="Image 2" style={{ width: "100%", height: "auto" }} /></div>
                <div><img src="images/hero3.jpeg" alt="Image 3" style={{ width: "100%", height: "auto" }} /></div>
              </Slider>
            </Box>
          )}
        </CustomBox>
      </Container>
    </Box>
  );
};

export default Hero;
