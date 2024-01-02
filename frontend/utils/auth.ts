export const isUserLoggedIn = () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const expirationTime = localStorage.getItem('expiration_time');
  
      if (accessToken && refreshToken && expirationTime) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const isAccessTokenValid = currentTimestamp < Number(expirationTime);
  
        return isAccessTokenValid;
      }
    }
  
    return false;
  };

 export const getUserIdFromAccessToken = () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      // Assuming the token is a JWT
    const tokenPayload = JSON.parse(atob(accessToken!.split('.')[1]));

    // Now you can access user ID
    const userId = tokenPayload.user_id;

    return userId;
  } catch (error) {
    console.error('Error decoding access token:', error);
    return null;
  }
  };