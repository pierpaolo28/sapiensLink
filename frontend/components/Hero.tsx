import Box from "@mui/material/Box";
import styled from "@mui/system/styled";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Button, IconButton, Stack, useTheme } from "@mui/material";
import { Container } from "@mui/system";
import React, { useRef } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import slick from "./slick.module.css";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { IoIosArrowDroprightCircle } from "react-icons/io";

const Hero = () => {
  const CustomBox = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(5),
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      textAlign: "center",
    },
  }));

  const Title = styled(Typography)(({ theme }) => ({
    fontSize: "64px",
    color: "primary",
    fontWeight: "bold",
    [theme.breakpoints.down("sm")]: {
      fontSize: "40px",
    },
  }));

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
    autoplaySpeed: 20000,
  };

  const sliderRef = useRef(null);

  const nextSlide = () => {
    const sl = sliderRef.current! as Slider;
    sl.slickNext();
  };
  const prevSlide = () => {
    const sl = sliderRef.current! as Slider;
    sl.slickPrev();
  };

  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        justifyContent: theme.breakpoints.down("md") ? "start" : "center",
        alignItems: "center",
      })}
    >
      <Container>
        <CustomBox>
          <Stack gap={4} sx={{ flex: 1, minWidth: "40%", my: 10 }}>
            <Typography
              variant="body2"
              color={"text.secondary"}
              sx={{
                fontSize: "18px",
                fontWeight: "500",
              }}
            >
              Welcome to SapiensLink
            </Typography>
            <Title variant="h1">Sharing knowledge one link at the time.</Title>
            <Typography
              variant="body2"
              color={"text.secondary"}
              sx={{ fontSize: "18px" }}
            >
              Create, share and find meaningful resources!
            </Typography>
            <Link href={`/list_home`}>
              <Button
                sx={(theme) => ({
                  [theme.breakpoints.down("md")]: {
                    width: "100%",
                  },
                })}
                color={"primary"}
                variant={"contained"}
                size={"large"}
              >
                Get Started
              </Button>
            </Link>
          </Stack>
          <Box
            sx={(theme) => ({
              flex: 1,
              position: "relative",
              minWidth: "50%",
              [theme.breakpoints.down("md")]: {
                display: "none",
              },
            })}
          >
            <Slider
              {...settings}
              ref={sliderRef}
              dotsClass={`slick-dots ${slick.dots} ${slick.dotsactive}`}
            >
              <div>
                <img
                  src="images/hero1.jpg"
                  alt="Image 1"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              <div>
                <img
                  src="images/hero2.jpg"
                  alt="Image 2"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
              <div>
                <img
                  src="images/hero3.jpg"
                  alt="Image 3"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </Slider>
            <IconButton
              sx={{
                position: "absolute",
                top: "50%",
                left: "-10%",
                transform: "translateY(-50%)",
              }}
              onClick={nextSlide}
              color={"primary"}
            >
              <IoIosArrowDropleftCircle />
            </IconButton>
            <IconButton
              sx={{
                position: "absolute",
                top: "50%",
                right: "-10%",
                transform: "translateY(-50%)",
              }}
              onClick={prevSlide}
              color={"primary"}
            >
              <IoIosArrowDroprightCircle />
            </IconButton>
          </Box>
        </CustomBox>
      </Container>
    </Box>
  );
};

export default Hero;

// import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
// import { Pagination, Navigation, Autoplay } from "swiper/modules";
// import "swiper/css/bundle";

{
  /* <Swiper
  modules={[Navigation, Pagination, Autoplay]}
  pagination={{ clickable: true }}
  navigation={{ prevEl: prevArr.current, nextEl: nextArr.current }}
  autoHeight
  loop
  autoplay={{ delay: 5000, pauseOnMouseEnter: true }}
  speed={500}
>
  <SwiperSlide>Slide 1</SwiperSlide>
  <SwiperSlide>Slide 2</SwiperSlide>
  <SwiperSlide>Slide 3</SwiperSlide>
  <IconButton
    ref={next}
    className={"nextbtn"}
    onClick={() => swiper.slideNext()}
    color={"primary"}
    size={"large"}
  >
    <ArrowLeft />
  </IconButton>
  <IconButton
    ref={prev}
    className={"prevbtn"}
    onClick={() => swiper.slidePrev()}
    color={"primary"}
    size={"large"}
  >
    <ArrowRight />
  </IconButton>
</Swiper>; */
}
