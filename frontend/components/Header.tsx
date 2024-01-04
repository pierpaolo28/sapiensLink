import React, { useState, useEffect, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/router';

import AccountCircle from '@mui/icons-material/AccountCircle';
import { isUserLoggedIn, getUserIdFromAccessToken, isAccessTokenExpired, refreshAccessToken } from '@/utils/auth';
import { Notification } from "@/utils/types";


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
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await refreshAccessToken(refreshToken);
        } else {
          console.error('Refresh token not available.');
          // Would get infinite refresh using window.location
          router.push('/signin');
        }
      }
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch('http://localhost/api/notifications/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        console.log(data)
        setNotifications(data.notifications);
        setNotificationCount(data.notifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const initWebSocket = () => {
    if (isLoggedIn && !socketRef.current) {
      const newSocket = new WebSocket('ws://localhost/ws/notifications/');

      newSocket.onopen = (event) => {
        console.log('WebSocket is connected.');
        fetchNotifications();
      };

      newSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.receiver_id === getUserIdFromAccessToken()){
          // setNotifications((prevNotifications) => [...prevNotifications, message]);
          // setNotificationCount((prevCount) => prevCount + 1);
          fetchNotifications();
        }
      };

      newSocket.onclose = (event) => {
        console.log('WebSocket is closed.');
      };

      newSocket.onerror = (event) => {
        console.error('WebSocket error:', event);
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


  if (typeof window !== 'undefined') {
    window.onbeforeunload = function () {
      closeWebSocket(); // Close the WebSocket connection before the page is unloaded
    };
  }


  useEffect(() => {
    if (typeof window !== 'undefined' && isLoggedIn) {
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
    if (typeof window !== 'undefined' && isLoggedIn) {
      if (!window.location.href.includes('signin')) {
        if (!isAccessTokenExpired()) {
          initWebSocket();
          fetchNotifications();
        } else {
          const refreshToken = localStorage.getItem('refresh_token');
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
  const id = open ? 'notification-popover' : undefined;

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      // Send a request to mark the notification as read
      await fetch(`http://localhost/api/notifications/${notificationId}/mark_as_read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Include access token in the Authorization header
        }
      });

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
      console.error('Error marking notification as read:', error);
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
      const accessToken = localStorage.getItem('access_token');

      if (accessToken) {
        // Make a POST request to the logout API
        const response = await fetch('http://localhost/api/logout_user/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Include access token in the Authorization header
          },
          body: JSON.stringify({
            access_token: accessToken,
          }),
        });

        if (response.ok) {
          // Clear tokens from local storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('expiration_time');

          window.location.href = '/';
        } else {
          // Handle error cases
          console.error('Logout failed:', response.statusText);
        }
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
    }
  };

  const profileOpen = Boolean(profileAnchorEl);
  const profileId = profileOpen ? 'profile-popover' : undefined;


  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Typography variant="h6" color="inherit" noWrap>
          <Link href="/">
            <img src="/logo.svg" alt="Sapiens Logo" width={120} />
          </Link>
        </Typography>
        <Box sx={{ flexGrow: 1 }} />

        {isLoggedIn ? (
          <>
            {/* Notification Icon */}
            <IconButton color="inherit" onClick={handleClick}>
              <Badge badgeContent={notificationCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Popover with Notifications List */}
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {/* Map through the updated notifications state */}
                {notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    button
                    onClick={() => {
                      markNotificationAsRead(notification.id);
                      window.location.href = notification.url; // Navigate to the URL
                    }}
                  >
                    {/* Render notification text with styling based on read status */}
                    <ListItemText
                      primary={notification.message}
                      primaryTypographyProps={{
                        style: { fontWeight: notification.read ? 'normal' : 'bold' },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Popover>



            {/* User Profile Icon */}
            <IconButton color="inherit" onClick={handleProfileClick}>
              <AccountCircle />
            </IconButton>
            <Popover
              id={profileId}
              open={profileOpen}
              anchorEl={profileAnchorEl}
              onClose={handleProfileClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Box sx={{ p: 2 }}>
                <List component="nav" aria-label="user profile options">
                  <ListItem button component="a" href={`/user_profile?id=${getUserIdFromAccessToken()}`}>
                    <ListItemText primary="Profile Page" />
                  </ListItem>

                  <ListItem button component="a" href="/edit_profile">
                    <ListItemText primary="Edit Profile" />
                  </ListItem>
                  <ListItem button onClick={handleLogout}>
                    <ListItemText primary="Log Out" />
                  </ListItem>
                </List>
              </Box>
            </Popover>
          </>
        ) : (
          // If not logged in, show Login and Sign Up buttons
          <>
            <Button color="inherit" href="signin">
              Login
            </Button>
            <Button
              color="primary"
              variant="contained"
              sx={{ marginLeft: '1rem' }}
              href="signup"
            >
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}