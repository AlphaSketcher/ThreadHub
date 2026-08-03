const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8080/api' : 'https://threadhub.onrender.com/api');

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

export const postService = {
  async fetchPosts() {
    const response = await fetch(`${API_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return await response.json();
  },

  async createPost(postData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return await response.json();
  },

  async deletePost(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return true;
  },

  async incrementView(id) {
    const response = await fetch(`${API_URL}/posts/${id}/view`, {
      method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to increment view');
    return await response.json();
  }
};

export const userService = {
  async toggleFollow(targetUsername) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/follow/${targetUsername}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to toggle follow');
    return await response.json(); // Returns updated following list
  },

  async getFollowing() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/following`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch following');
    return await response.json();
  },

  async getPublicProfile(username) {
    const response = await fetch(`${API_URL}/users/profile/${username}`, {
      method: 'GET'
    });
    if (!response.ok) throw new Error('Failed to fetch public profile');
    return await response.json();
  }
};
