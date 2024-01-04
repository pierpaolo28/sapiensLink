import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Link,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { isUserLoggedIn, getUserIdFromAccessToken, isAccessTokenExpired, refreshAccessToken } from '@/utils/auth';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  url: string;
}


export default function Header() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const fetchNotifications = async () => {
    try {
      if (isAccessTokenExpired()) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            await refreshAccessToken(refreshToken);
        } else {
            console.error('Refresh token not available.');
            window.location.href = "/signin";
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
        setNotifications((prevNotifications) => [...prevNotifications, ...data.notifications]);
        setNotificationCount((prevCount) => prevCount + data.notifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const initWebSocket = () => {
    if (!socketRef.current) {
      const newSocket = new WebSocket('ws://localhost/ws/notifications/');

      newSocket.onopen = (event) => {
        console.log('WebSocket is connected.');
        fetchNotifications();
      };

      newSocket.onmessage = (event) => {
        const message = event.data;
        console.log('Received message:', message);
        fetchNotifications();
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
    if (socketRef !== null) {
      socketRef.current!.close();
      socketRef.current = null;
    }
}

if (typeof window !== 'undefined') {
window.onbeforeunload = function () {
  closeWebSocket(); // Close the WebSocket connection before the page is unloaded
};
}

  useEffect(() => {
    initWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []); // Run on mount and clean up on unmount

  useEffect(() => {
    fetchNotifications();
  }, [socketRef.current]); // Run when socket changes

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

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    // Perform the check on the client side once the component is mounted
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

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

          // Redirect or perform other actions after successful logout
          // For example, redirect to the login page
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

  if (typeof window !== 'undefined') {
  if (!window.location.href.includes('signin')) {
    window.onload = function () {
        if (!isAccessTokenExpired()) {
            initWebSocket(); // Initialize the WebSocket connection on page load if the token is not expired
        } else {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                refreshAccessToken(refreshToken);
            }
            else{
                window.location.href = "/signin";
            }
        }
    };
  }
}

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