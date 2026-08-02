import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { API_URL } from '../services/api';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const username = params.get('username');
      const email = params.get('email');

      if (token) {
        // Save to local storage exactly like regular login
        localStorage.setItem('token', token);
        
        try {
          const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('user', JSON.stringify({
              username: userData.username,
              email: userData.email,
              bio: userData.bio,
              location: userData.location,
              profileImage: userData.profileImage
            }));
          } else {
            // Fallback if fetch fails
            if (username || email) {
              localStorage.setItem('user', JSON.stringify({ 
                username: username || '', 
                email: email || '' 
              }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch full profile during OAuth", error);
          if (username || email) {
            localStorage.setItem('user', JSON.stringify({ 
              username: username || '', 
              email: email || '' 
            }));
          }
        }

        // Redirect to home page
        navigate('/', { replace: true });
      } else {
        // If something went wrong, go back to auth page
        navigate('/auth', { replace: true });
      }
    };
    handleAuth();
  }, [location, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a', color: 'white' }}>
      <h2>Logging you in...</h2>
    </div>
  );
};

export default OAuth2RedirectHandler;
