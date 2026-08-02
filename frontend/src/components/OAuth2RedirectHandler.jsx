import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const username = params.get('username');
    const email = params.get('email');

    if (token) {
      // Save to local storage exactly like regular login
      localStorage.setItem('token', token);
      
      if (username || email) {
        localStorage.setItem('user', JSON.stringify({ 
          username: username || '', 
          email: email || '' 
        }));
      }

      // Redirect to home page
      navigate('/', { replace: true });
    } else {
      // If something went wrong, go back to auth page
      navigate('/auth', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a', color: 'white' }}>
      <h2>Logging you in...</h2>
    </div>
  );
};

export default OAuth2RedirectHandler;
