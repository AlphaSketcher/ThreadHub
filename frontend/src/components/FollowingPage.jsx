import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePosts } from '../context/PostsContext';
import { useModal } from '../context/ModalContext';
import { userService } from '../services/api';
import PostItem from './PostItem';
import PostDetailsModal from './PostDetailsModal';
import { Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FollowingPage.css';

const FollowingPage = () => {
  const { posts, loading } = usePosts();
  const { isModalOpen, selectedPost, openModal, closeModal } = useModal();
  const navigate = useNavigate();
  
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const fetchFollowing = async () => {
      try {
        setIsLoadingUsers(true);
        const users = await userService.getFollowing();
        setFollowingUsers(users);
      } catch (err) {
        console.error('Failed to fetch following users', err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchFollowing();
  }, [navigate]);

  // Filter posts to only show those from followed authors
  const followedUsernames = followingUsers.map(u => u.username);
  const followingPosts = posts.filter(post => followedUsernames.includes(post.author));

  return (
    <div className="following-page-container">
      <div className="following-header">
        <h1>Following</h1>
        <p>Stay updated with the creators you follow.</p>
      </div>

      {!isLoadingUsers && followingUsers.length === 0 ? (
        <div className="empty-following">
          <div className="empty-following-icon">
            <Users size={32} />
          </div>
          <h2>You aren't following anyone yet</h2>
          <p>Discover interesting creators and build your personalized feed.</p>
          <button className="explore-btn" onClick={() => navigate('/creators')}>
            Explore Creators
          </button>
        </div>
      ) : (
        <>
          {followingUsers.length > 0 && (
            <div className="following-users-carousel">
              {followingUsers.map((followedUser, idx) => (
                <motion.div 
                  key={followedUser.id || idx} 
                  className="following-user-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {/* could navigate to their profile */}}
                >
                  <img 
                    src={followedUser.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                    alt={followedUser.username} 
                    className="following-user-avatar" 
                  />
                  <div className="following-user-name">@{followedUser.username}</div>
                  <div className="following-user-bio">{followedUser.bio || 'Creator'}</div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="following-feed-section">
            <h2 className="following-feed-title"><Activity size={20} /> Latest from your network</h2>
            
            {loading ? (
              <div className="loading-spinner">Loading feed...</div>
            ) : followingPosts.length > 0 ? (
              followingPosts.map(post => (
                <PostItem 
                  key={post.id} 
                  post={post} 
                  onOpenModal={() => openModal(post)} 
                />
              ))
            ) : (
              <div className="empty-state" style={{ marginTop: '2rem' }}>
                <p>No recent posts from the people you follow.</p>
              </div>
            )}
          </div>
        </>
      )}

      {isModalOpen && selectedPost && (
        <PostDetailsModal post={selectedPost} onClose={closeModal} />
      )}
    </div>
  );
};

export default FollowingPage;
