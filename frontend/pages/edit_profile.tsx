import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import AppLayout from "@/components/AppLayout";

export default function EditProfilePage() {
  // State for form fields
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

  // Handlers for form inputs
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Check if files are selected and if the first file exists
    if (event.target.files && event.target.files.length > 0) {
      // Set the avatar state to the first file
      setAvatar(event.target.files[0]);
    } else {
      // If no files are selected, set the avatar state back to null
      setAvatar(null);
    }
  };
  

  const handleClearAvatar = () => {
    setAvatar(null);
  };

  // Handlers for form submission
  const handleUpdateProfile = () => {
    // Implement profile update logic here
    console.log('Profile updated with:', profile);
    if (avatar) {
      console.log('Avatar to be uploaded:', avatar.name);
    }
  };

  const [isDeletionConfirmed, setIsDeletionConfirmed] = useState(false);


  const handleDeleteAccount = () => {
    if (isDeletionConfirmed) {
      // Implement account deletion logic here
      console.log('Account deletion confirmed. Deleting account...');
      // Your logic to delete the account
    } else {
      console.log('Account deletion not confirmed. Please confirm deletion.');
      // Optionally show an alert or message asking the user to confirm deletion
    }
  };
  

  return (
    <AppLayout>
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Edit your Profile</Typography>

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
              value={profile.name}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Email address"
              name="email"
              value={profile.email}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={4}
              value={profile.bio}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Social"
              name="social"
              value={profile.social}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Update Password"
              name="password"
              type="password"
              value={profile.password}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
        </CardContent>
        <CardActions>
          <Button color="primary" onClick={handleUpdateProfile}>Update</Button>
          <Button color="error" onClick={handleDeleteAccount}>Cancel</Button>
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
