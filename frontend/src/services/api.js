export const API_URL = 'http://localhost:8080/api';

export const authService = {
  async register(username, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Registration failed');
    }
    
    return await response.json();
  },

  async login(identifier, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }
    
    return await response.json();
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  }
};
