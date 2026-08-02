import React, { createContext, useContext, useState, useEffect } from 'react';
import { postService } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_URL } from '../services/api';

const PostsContext = createContext();

export const usePosts = () => {
  return useContext(PostsContext);
};

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);

  // Load initial data and connect WebSocket
  useEffect(() => {
    let client;
    
    const initialize = async () => {
      try {
        setLoading(true);
        // Load initial posts from the actual database
        const data = await postService.fetchPosts();
        if (data) {
          setPosts(data);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to load posts from API", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }

      // Initialize WebSocket connection
      const token = localStorage.getItem('token');
      
      // Determine ws url from API_URL (replace /api with /ws)
      const wsUrl = API_URL.replace('/api', '/ws');
      
      client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: function (str) {
          // console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = function (frame) {
        // Subscribe to public posts topic
        client.subscribe('/topic/posts', (message) => {
          if (message.body) {
            try {
              const parsed = JSON.parse(message.body);
              handleRealtimeEvent(parsed);
            } catch (e) {
              console.error('Error parsing STOMP message', e);
            }
          }
        });
      };

      client.onStompError = function (frame) {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      };

      client.activate();
      setStompClient(client);
    };

    initialize();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  const handleRealtimeEvent = (event) => {
    const { type, payload } = event;
    
    switch (type) {
      case 'POST_CREATED':
        setPosts((prev) => {
          // Prevent duplicates
          if (prev.some(p => p.id === payload.id)) return prev;
          return [payload, ...prev];
        });
        break;
      case 'POST_UPDATED':
        setPosts((prev) => prev.map(p => p.id === payload.id ? payload : p));
        break;
      case 'POST_DELETED':
        setPosts((prev) => prev.filter(p => p.id !== payload));
        break;
      default:
        break;
    }
  };

  const addPost = async (newPost) => {
    try {
      const tempId = Date.now();
      const optimisticPost = { ...newPost, id: tempId };
      setPosts(prev => [optimisticPost, ...prev]);
      
      const postToSave = { ...newPost };
      delete postToSave.id; // ensure ID is empty for DB
      
      const savedPost = await postService.createPost(postToSave);
      
      // Update the temporary post with the actual saved post from the backend
      // so it never disappears, even if the WebSocket is delayed or fails.
      setPosts(prev => prev.map(p => p.id === tempId ? savedPost : p));
    } catch (err) {
      console.error("Failed to save post to backend", err);
    }
  };

  const updatePost = (id, updatedData) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === id ? { ...post, ...updatedData } : post
    ));
  };

  const toggleVote = async (id, username, type) => {
    try {
      // Optimistic update
      let wasAdded = false;
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id !== id) return post;
        
        let upvotes = [...(post.upvotes || [])];
        let downvotes = [...(post.downvotes || [])];

        if (type === 'up') {
          if (upvotes.includes(username)) {
            upvotes = upvotes.filter(u => u !== username);
          } else {
            upvotes = [...upvotes, username];
            downvotes = downvotes.filter(u => u !== username);
            wasAdded = true;
          }
        } else if (type === 'down') {
          if (downvotes.includes(username)) {
            downvotes = downvotes.filter(u => u !== username);
          } else {
            downvotes = [...downvotes, username];
            upvotes = upvotes.filter(u => u !== username);
            wasAdded = true;
          }
        }
        return { ...post, upvotes, downvotes };
      }));
      
      // Call REST API
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/posts/${id}/vote?type=${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return wasAdded;
    } catch (e) {
      console.error("Vote failed", e);
      return false;
    }
  };

  const addComment = async (postId, parentCommentId, newCommentData) => {
    try {
      const token = localStorage.getItem('token');
      const commentPayload = {
        text: newCommentData.text,
        author: newCommentData.author,
        avatar: newCommentData.avatar
      };
      
      // We will only do single level comments for now as the DB supports it easily
      await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentPayload)
      });
      // The websocket will broadcast the updated post, so UI updates automatically!
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const voteComment = (postId, commentId, username, type) => {
    // Left empty for now - would need a dedicated endpoint
  };

  const deletePost = async (id) => {
    try {
      // Optimistic delete
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  return (
    <PostsContext.Provider value={{ 
      posts, 
      loading,
      setPosts, 
      addPost, 
      updatePost, 
      deletePost, 
      toggleVote, 
      addComment, 
      voteComment 
    }}>
      {children}
    </PostsContext.Provider>
  );
};
