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

  function getExpirationTime(token: string): number | null {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    if (decodedToken && decodedToken.exp) {
      return decodedToken.exp * 1000; // Convert to milliseconds
    }
    return null;
  }
  
  // TODO: Check if after the token is updated it's necessary to refresh the page.
  // It seems that after the token is refreshed, the first notification doesn't work and thereafter works
  async function refreshAccessToken(refreshToken: string): Promise<void> {
    try {
      const response = await fetch('/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (!response.ok) {
        console.error('Failed to refresh access token');
        if (!window.location.href.includes('login')) {
          console.error('Redirecting to login page');
          window.location.href = "/signin"; // Replace with actual login URL
        }
        return;
      }
  
      const data = await response.json();
      localStorage.setItem('access_token', data.access); // Store the new access token
      const expirationTime = getExpirationTime(data.access);
      
      if (expirationTime) {
        localStorage.setItem('expiration_time', expirationTime.toString()); // Update the expiration time in localStorage
      }
      
      // Update the token variable (Assuming 'token' is declared somewhere)
      return data.access;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      // Handle the error as needed
      // For example, redirect the user to the login page or display an error message
    }
  }
  
  function isAccessTokenExpired(): boolean {
    // Implement the logic to check if the access token is expired
    // Compare the expiration time with the current time
    const expirationTime = Number(localStorage.getItem('expiration_time')); // Get the token expiration time from localStorage
    const currentTime = new Date().getTime(); // Get the current time
    return currentTime > expirationTime; // Compare the current time with the expiration time
  }
  
  export { getExpirationTime, refreshAccessToken, isAccessTokenExpired };
  