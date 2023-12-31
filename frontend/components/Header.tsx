import React, { useState } from 'react';
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
  Avatar,
  MenuItem,
  Menu,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationCount, setNotificationCount] = useState(5); // Example count

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // Example notifications data
  const notifications = [
    { id: 1, text: 'New comment on your post.' },
    { id: 2, text: 'New follower.' },
    { id: 3, text: 'Your article has been published.' },
    // ...more notifications
  ];

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const handleProfileClick = (event: any) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    // Perform logout actions
    console.log('User logged out');
    // Redirect to login page or update state accordingly
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

        {/* Notification Icon */}
        <IconButton color="inherit" onClick={handleClick}>
          <Badge badgeContent={notificationCount} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
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
            {notifications.map((notification) => (
              <ListItem key={notification.id} button>
                <ListItemText primary={notification.text} />
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
              <ListItem button component="a" href="/edit_profile">
                <ListItemText primary="Edit Profile" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Log Out" />
              </ListItem>
            </List>
          </Box>
        </Popover>

        <Button color="inherit" href="signin">Login</Button>
        <Button
          color="primary"
          variant="contained"
          sx={{ marginLeft: '1rem' }}
          href="signup"
        >
          Sign Up
        </Button>
      </Toolbar>
    </AppBar>
  );
}
