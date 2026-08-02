import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_URL } from '../services/api';

const NotificationsContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationsContext);
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = user ? user.username : null;

  useEffect(() => {
    if (!username) return;

    // Fetch initial notifications from DB
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();

    // Initialize WebSocket for notifications
    const token = localStorage.getItem('token');
    const wsUrl = API_URL.replace('/api', '/ws');
    
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function () {
      client.subscribe(`/topic/notifications/${username}`, (message) => {
        if (message.body) {
          try {
            const newNotif = JSON.parse(message.body);
            setNotifications(prev => [newNotif, ...prev]);
          } catch (e) {
            console.error('Error parsing notification', e);
          }
        }
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [username]);

  // addNotification is no longer needed for internal optimistic updates, 
  // as the backend broadcasts them. We keep it empty to prevent crashes in old components.
  const addNotification = () => {};

  const markAllAsRead = async () => {
    // In a real app, we'd have a mark-all-as-read endpoint.
    // For now, we update local state, or loop through unread ones.
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getUserNotifications = () => {
    return notifications;
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
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
