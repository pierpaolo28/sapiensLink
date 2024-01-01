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