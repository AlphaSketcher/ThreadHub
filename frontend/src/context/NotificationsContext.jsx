import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationsContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationsContext);
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('threadhub_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('threadhub_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = ({ type, fromUser, toUser, postId, message }) => {
    // Only send notification if it's to another user
    if (fromUser === toUser) return;
    
    // Prevent duplicate exact notifications for likes (spam prevention)
    if (type === 'like') {
      const isDuplicate = notifications.some(
        n => n.type === 'like' && n.fromUser === fromUser && n.postId === postId
      );
      if (isDuplicate) return;
    }

    const newNotification = {
      id: Date.now().toString(),
      type,
      fromUser,
      toUser,
      postId,
      message,
      read: false,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAllAsRead = (username) => {
    setNotifications(prev => 
      prev.map(n => n.toUser === username ? { ...n, read: true } : n)
    );
  };

  // Filter notifications for a specific user
  const getUserNotifications = (username) => {
    return notifications.filter(n => n.toUser === username);
  };

  const getUnreadCount = (username) => {
    return notifications.filter(n => n.toUser === username && !n.read).length;
  };

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      addNotification, 
      markAllAsRead, 
      getUserNotifications, 
      getUnreadCount 
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
