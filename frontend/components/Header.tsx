import React, { useState, useEffect, useRef } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useTheme } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import styled from "@mui/system/styled";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ListIcon from "@mui/icons-material/List";
import Divider from "@mui/material/Divider";
import { useRouter } from "next/router";
import Logo from "@/public/logo.svg";

import AccountCircle from "@mui/icons-material/AccountCircle";
import {
  isUserLoggedIn,
  getUserIdFromAccessToken,
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/utils/auth";
import { Notification } from "@/utils/types";
import ThemeToggleButton from "./ThemeToggleButton";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const fetchNotifications = async () => {
    try {
      if (isAccessTokenExpired()) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          await refreshAccessToken(refreshToken);
        } else {
          console.error("Refresh token not available.");
          // Would get infinite refresh using window.location
          router.push("/signin");
        }
      }
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch("http://localhost/api/notifications/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data.notifications);
        setNotificationCount(data.notifications.length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const initWebSocket = () => {
    if (isLoggedIn && !socketRef.current) {
      const newSocket = new WebSocket("ws://localhost/ws/notifications/");

      newSocket.onopen = (event) => {
        console.log("WebSocket is connected.");
        fetchNotifications();
      };

      newSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.receiver_id === getUserIdFromAccessToken()) {
          // setNotifications((prevNotifications) => [...prevNotifications, message]);
          // setNotificationCount((prevCount) => prevCount + 1);
          fetchNotifications();
        }
      };

      newSocket.onclose = (event) => {
        console.log("WebSocket is closed.");
      };

      newSocket.onerror = (event) => {
        console.error("WebSocket error:", event);
      };

      socketRef.current = newSocket;
    }
  };

  function closeWebSocket() {
    if (socketRef.current !== null && socketRef.current !== undefined) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }

  if (typeof window !== "undefined") {
    window.onbeforeunload = function () {
      closeWebSocket(); // Close the WebSocket connection before the page is unloaded
    };
  }

  useEffect(() => {
    if (typeof window !== "undefined" && isLoggedIn) {
      initWebSocket();
      return () => {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoggedIn) {
      if (!window.location.href.includes("signin")) {
        if (!isAccessTokenExpired()) {
          initWebSocket();
          fetchNotifications();
        } else {
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            refreshAccessToken(refreshToken);
          } else {
            window.location.href = "/signin";
          }
        }
      }
    }
  }, [isLoggedIn]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-popover" : undefined;

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      // Send a request to mark the notification as read
      await fetch(
        `http://localhost/api/notifications/${notificationId}/mark_as_read/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include access token in the Authorization header
          },
        }
      );

      // Update the state to reflect the change in notifications
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update the notification count
      setNotificationCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleProfileClick = (event: any) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Get the access token from local storage
      const accessToken = localStorage.getItem("access_token");

      if (accessToken) {
        // Make a POST request to the logout API
        const response = await fetch("http://localhost/api/logout_user/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include access token in the Authorization header
          },
          body: JSON.stringify({
            access_token: accessToken,
          }),
        });

        // Clear tokens from local storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("expiration_time");

        window.location.href = "/";
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };

  const profileOpen = Boolean(profileAnchorEl);
  const profileId = profileOpen ? "profile-popover" : undefined;

  const theme = useTheme();
  const [mobileMenu, setMobileMenu] = useState({
    left: false,
  });

  const toggleDrawer = (anchor: any, open: any) => (event: any) => {
    if (
      event.type === "keydown" &&
      (event.type === "Tab" || event.type === "Shift")
    ) {
      return;
    }

    setMobileMenu({ ...mobileMenu, [anchor]: open });
  };

  const links = [
    "/",
    "/list_home",
    "/rank_home",
    "/vision",
    "/about",
    "/contacts",
  ];
  const list = (anchor: any) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {["Home", "Lists", "Ranks", "Vision", "About Us", "Contact Us"].map(
          (text, index) => (
            <ListItem key={text} disablePadding>
              <Link
                href={links[index]}
                passHref
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  width: "100%",
                }}
              >
                <ListItemButton>
                  <ListItemIcon>
                    {index === 0 && <HomeIcon />}
                    {index === 1 && <ListIcon />}
                    {index === 2 && <TrendingUpIcon />}
                    {index === 3 && <VisibilityIcon />}
                    {index === 4 && <InfoIcon />}
                    {index === 5 && <ContactMailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </Link>
            </ListItem>
          )
        )}
      </List>
    </Box>
  );

  const NavLink = styled(Typography)(({ theme }) => ({
    fontSize: "15px",
    color: "#667085",
    fontWeight: "bold",
    cursor: "pointer",
    transition: ".2s",
    "&:hover": {
      color: "#101828",
    },
  }));

  const NavbarLinksBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(3),
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  }));

  const CustomMenuIcon = styled(MenuIcon)(({ theme }) => ({
    cursor: "pointer",
    display: "none",
    color: "#101828",
    marginRight: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      display: "block",
    },
  }));

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

  const logoPath = `${router.basePath}/logo.svg`;

  return (
    <AppBar
      sx={{ borderRadius: "0" }}
      position="static"
      color="default"
      elevation={0}
    >
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2.5rem",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CustomMenuIcon onClick={toggleDrawer("left", true)} />
            <Drawer
              color={"inherit"}
              anchor="left"
              open={mobileMenu["left"]}
              onClose={toggleDrawer("left", false)}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div>
                  {list("left")}
                  {isSmallScreen && (
                    <Box sx={{ marginTop: "1rem" }}>
                      {!isLoggedIn && (
                        <>
                          <Button
                            sx={{
                              textTransform: "uppercase",
                              fontWeight: "bold",
                            }}
                            variant={"outlined"}
                            color="primary"
                            size={"large"}
                            fullWidth
                            href="signin"
                          >
                            Login
                          </Button>
                          <Button
                            sx={{
                              textTransform: "uppercase",
                              fontWeight: "bold",
                              marginTop: "6px",
                              boxShadow: "none",
                              ":hover": {
                                boxShadow: "none",
                              },
                            }}
                            color="primary"
                            variant="contained"
                            size={"large"}
                            fullWidth
                            href="signup"
                          >
                            Sign Up
                          </Button>
                        </>
                      )}
                    </Box>
                  )}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <Divider sx={{ marginY: "1rem" }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>Toggle Theme</Typography>
                    <ThemeToggleButton />
                  </Box>
                </div>
              </div>
            </Drawer>
            {isSmallScreen ? (
              // Move the logo to the right on small screens
              <div style={{ flexGrow: 1 }} />
            ) : (
              // Display the logo on the left for larger screens
              <Link href="/">
                {/* <img src={logoPath} alt="logo" /> */}
                <Image src={Logo} alt={"Logo"} />
              </Link>
            )}
          </Box>

          <NavbarLinksBox>
            <Link
              href="/list_home"
              passHref
              style={{
                textDecoration: "none",
              }}
            >
              <NavLink variant="body2">Lists</NavLink>
            </Link>
            <Link href="/rank_home" passHref style={{ textDecoration: "none" }}>
              <NavLink variant="body2">Ranks</NavLink>
            </Link>
            <Link href="/vision" passHref style={{ textDecoration: "none" }}>
              <NavLink variant="body2">Vision</NavLink>
            </Link>
            <Link href="/about" passHref style={{ textDecoration: "none" }}>
              <NavLink variant="body2">About Us</NavLink>
            </Link>
            <Link href="/contacts" passHref style={{ textDecoration: "none" }}>
              <NavLink variant="body2">Contacts</NavLink>
            </Link>
          </NavbarLinksBox>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {isSmallScreen ? (
            <div style={{ flexGrow: 1 }} />
          ) : (
            <ThemeToggleButton />
          )}
          {isLoggedIn ? (
            <>
              {/* Notification Icon */}
              <IconButton color="inherit" onClick={handleClick}>
                <Badge
                  sx={{ color: "#101828" }}
                  badgeContent={notificationCount}
                >
                  <NotificationsIcon color={"primary"} />
                </Badge>
              </IconButton>

              {/* Popover with Notifications List */}
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                slotProps={{
                  paper: {
                    sx: {
                      backgroundColor: "#fff",
                    },
                  },
                }}
              >
                <List
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    backgroundImage: "none",
                    bgcolor: "#fff",
                  }}
                >
                  {/* Map through the updated notifications state */}
                  {notifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      button
                      sx={{
                        transition: ".3s",
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "#F5F5F5",
                        },
                      }}
                      onClick={() => {
                        markNotificationAsRead(notification.id);
                        window.location.href = notification.url; // Navigate to the URL
                      }}
                    >
                      {/* Render notification text with styling based on read status */}
                      <ListItemText
                        primary={notification.message}
                        primaryTypographyProps={{
                          style: {
                            fontWeight: notification.read ? "normal" : "bold",
                          },
                        }}
                        sx={{
                          color: "#121212",
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Popover>

              {/* User Profile Icon */}
              <IconButton color="inherit" onClick={handleProfileClick}>
                <AccountCircle color={"primary"} />
              </IconButton>
              <Popover
                id={profileId}
                open={profileOpen}
                anchorEl={profileAnchorEl}
                onClose={handleProfileClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                slotProps={{
                  paper: {
                    sx: {
                      backgroundColor: "#fff",
                    },
                  },
                }}
              >
                <Box>
                  <List component="nav" aria-label="user profile options">
                    <ListItem
                      button
                      sx={{
                        transition: ".3s",
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "#F5F5F5",
                        },
                      }}
                      component="a"
                      href={`/user_profile?id=${getUserIdFromAccessToken()}`}
                    >
                      <ListItemText
                        sx={{
                          color: "#121212",
                        }}
                        primary="Profile Page"
                      />
                    </ListItem>

                    <ListItem
                      sx={{
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "#F5F5F5",
                        },
                      }}
                      button
                      component="a"
                      href="/edit_profile"
                    >
                      <ListItemText
                        sx={{
                          color: "#121212",
                        }}
                        primary="Edit Profile"
                      />
                    </ListItem>
                    <ListItem
                      sx={{
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "#F5F5F5",
                        },
                      }}
                      button
                      onClick={handleLogout}
                    >
                      <ListItemText
                        sx={{
                          color: "#121212",
                        }}
                        primary="Log Out"
                      />
                    </ListItem>
                  </List>
                </Box>
              </Popover>
            </>
          ) : (
            // If not logged in, show Login and Sign Up buttons
            <>
              {!isSmallScreen ? (
                <>
                  <Button
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                    variant="outlined"
                    color="primary"
                    size={"large"}
                    href="signin"
                  >
                    Login
                  </Button>
                  <Button
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                    color="primary"
                    variant="contained"
                    size={"large"}
                    href="signup"
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <Link href="/">
                  <Image src={Logo} alt={"Logo"} />
                  {/* <img src={"logo.svg"} alt="logo" /> */}
                </Link>
              )}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
