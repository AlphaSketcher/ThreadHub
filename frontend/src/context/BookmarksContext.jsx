import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BookmarksContext = createContext();

export const useBookmarks = () => useContext(BookmarksContext);

export const BookmarksProvider = ({ children }) => {
  const [savedPosts, setSavedPosts] = useState([]);
  const navigate = useNavigate();

  // Load from local storage on mount to persist bookmarks
  useEffect(() => {
    const stored = localStorage.getItem('threadhub_bookmarks');
    if (stored) {
      try {
        setSavedPosts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  // Save to local storage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('threadhub_bookmarks', JSON.stringify(savedPosts));
  }, [savedPosts]);

  const toggleBookmark = (post) => {
    const token = localStorage.getItem('token');
    
    // Enforce Authentication
    if (!token) {
      navigate('/auth');
      return;
    }

    setSavedPosts(prev => {
      const isSaved = prev.some(p => p.id === post.id);
      if (isSaved) {
        return prev.filter(p => p.id !== post.id); // Remove if already saved
      } else {
        return [post, ...prev]; // Add to front of list if newly saved
      }
    });
  };

  const isBookmarked = (postId) => {
    return savedPosts.some(p => p.id === postId);
  };

  return (
    <BookmarksContext.Provider value={{ savedPosts, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
};
