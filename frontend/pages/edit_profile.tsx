import React, { ChangeEvent, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

import AppLayout from '@/components/AppLayout';
import { getUserIdFromAccessToken } from "@/utils/auth";

export default function EditProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    social: '',
    password: '',
    confirmPassword: '',
    deletionReason: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isDeletionConfirmed, setIsDeletionConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    // Fetch current user data for prepopulating the form
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost/api/update_user_page/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();

          // Update the state with fetched data
          setProfile({
            name: userData.name,
            email: userData.email,
            bio: userData.bio,
            social: userData.social,
            password: '',
            confirmPassword: '',
            deletionReason: '',
          });
        } else {
          // Handle error cases
          console.error('Failed to fetch user data:', response.statusText);
        }
      } catch (error) {
        console.error('An error occurred during data fetching:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setAvatar(event.target.files[0]);
    } else {
      setAvatar(null);
    }
  };

  const handleClearAvatar = () => {
    setAvatar(null);
  };

  const handleCancel = () => {
    window.location.href = '/list_home';
  };

  const handleUpdateProfile = async () => {
    try {
      // Create FormData object
      const formData = new FormData();

      // Append profile data to FormData
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('bio', profile.bio || '');
      formData.append('social', profile.social || '');
      formData.append('password', profile.password);

      // Append avatar file to FormData if it exists
      if (avatar) {
        formData.append('avatar', avatar);
      }

      // Make a PUT request to update the user profile
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost/api/update_user_page/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        // Handle successful update
        console.log('User profile updated successfully');
        window.location.href = `/user_profile?id=${getUserIdFromAccessToken()}`;
      } else {
        // Handle update failure
        const responseData = await response.json();
        setError(responseData.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('An error occurred during profile update:', error);
      setError('An unexpected error occurred.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Check if the required fields are filled
      if (!profile.confirmPassword || !isDeletionConfirmed) {
        setError('Please fill in all required fields.');
        return;
      }

      // Make a DELETE request to delete the user account
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost/api/delete_user_page/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include the user's access token in the headers for authentication
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          password: profile.confirmPassword,
          confirm_delete: "on",
          feedback: profile.deletionReason,
          access_token: accessToken,
        }),
      });

      if (response.ok) {
        // Handle successful deletion
        console.log('User account deleted successfully');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expiration_time');
        window.location.href = '/list_home';
      } else {
        // Handle deletion failure
        const responseData = await response.json();
        setError(responseData.message || 'Account deletion failed');
      }
    } catch (error) {
      console.error('An error occurred during account deletion:', error);
      setError('An unexpected error occurred.');
    }
  };
  
  

  return (
    <AppLayout>
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Edit your Profile</Typography>
      {error && (
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
        )}
      <Card variant="outlined">
        <CardContent>
          <Box component="form" noValidate autoComplete="off">
            <FormGroup>
              <Typography>Avatar Currently: {avatar ? avatar.name : 'No Avatar'}</Typography>
              <FormControlLabel
                control={<Checkbox checked={avatar !== null} onChange={handleClearAvatar} />}
                label="Clear"
              />
              <Button variant="contained" component="label">
                Choose File
                <input type="file" hidden onChange={handleAvatarChange} />
              </Button>
            </FormGroup>

            <TextField
              fullWidth
              label="Name"
              name="name"
              value={profile.name || ''}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Email address"
              name="email"
              value={profile.email || ''}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={4}
              value={profile.bio || ''} 
              onChange={handleTextAreaChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Social"
              name="social"
              value={profile.social || ''}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Update Password"
              name="password"
              type="password"
              value={profile.password || ''}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
        </CardContent>
        <CardActions>
          <Button color="primary" onClick={handleUpdateProfile}>Update</Button>
          <Button color="error" onClick={handleCancel}>Cancel</Button>
        </CardActions>
      </Card>

      {/* Delete Account Section */}
      <Card variant="outlined" sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Delete Account
          </Typography>
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={profile.confirmPassword}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Reason for Deletion (optional)"
            name="deletionReason"
            value={profile.deletionReason}
            onChange={handleChange}
            margin="normal"
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isDeletionConfirmed}
                  onChange={(e) => setIsDeletionConfirmed(e.target.checked)}
                />
              }
              label="Confirm Deletion"
            />
          </FormGroup>
        </CardContent>
        <CardActions>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={!isDeletionConfirmed}
          >
            Delete Account
          </Button>
        </CardActions>
      </Card>
    </Container>
    </AppLayout>
  );
}
