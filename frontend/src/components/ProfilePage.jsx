import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Edit3, MessageCircle, Heart, Users, FileText, Eye, Trash2 } from 'lucide-react';
import { usePosts } from '../context/PostsContext';
import { useNotifications } from '../context/NotificationsContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useModal } from '../context/ModalContext';
import PostItem from './PostItem';
import PostDetailsModal from './PostDetailsModal';
import EditProfileModal from './EditProfileModal';
import { API_URL, userService } from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('Threads');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { posts, deletePost } = usePosts();
  const { savedPosts } = useBookmarks();
  const { openEditThread } = useModal();
  
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isOwnProfile = !paramUsername || (loggedInUser && paramUsername === loggedInUser.username);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const handleUserUpdate = () => {
      const updatedUserStr = localStorage.getItem('user');
      const updatedUser = updatedUserStr ? JSON.parse(updatedUserStr) : null;
      setLoggedInUser(updatedUser);
      if (updatedUser && profileUser) {
        setIsFollowing(updatedUser.following?.includes(profileUser.username) || false);
      }
    };
    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, [profileUser]);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        if (isOwnProfile) {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/auth');
            return;
          }
          const response = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setProfileUser(userData);
            setLoggedInUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } else {
          // Fetch public profile
          const userData = await userService.getPublicProfile(paramUsername);
          setProfileUser(userData);
          if (loggedInUser) {
            setIsFollowing(loggedInUser.following?.includes(userData.username) || false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [paramUsername, isOwnProfile, navigate]);

  const handleFollowToggle = async () => {
    if (!loggedInUser) {
      alert("You must be logged in to follow.");
      navigate('/auth');
      return;
    }
    
    try {
      setIsFollowLoading(true);
      const updatedFollowing = await userService.toggleFollow(profileUser.username);
      
      // Update local storage
      const updatedUser = { ...loggedInUser, following: updatedFollowing };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      
      const newlyFollowed = updatedFollowing.includes(profileUser.username);
      setIsFollowing(newlyFollowed);
      
      // Update profileUser follower count optimistic ui
      setProfileUser(prev => ({
        ...prev,
        followerCount: newlyFollowed ? (prev.followerCount + 1) : Math.max(0, prev.followerCount - 1)
      }));
      
      if (newlyFollowed) {
        addNotification({
          type: 'follow',
          fromUser: loggedInUser.username,
          toUser: profileUser.username,
          postId: null,
          message: `@${loggedInUser.username} started following you!`
        });
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const username = profileUser?.username || paramUsername;
  const myThreads = posts.filter(post => post.author === username);
  const threadsCount = myThreads.length;
  
  let repliesCount = 0;
  posts.forEach(post => {
    (post.comments || []).forEach(comment => {
      if (comment.author === username) repliesCount++;
    });
  });
  
  let likesCount = 0;
  myThreads.forEach(post => {
    likesCount += (post.upvotes?.length || 0);
  });

  const derivedAvatar = posts.find(post => post.author === username)?.authorAvatar;

  const profileData = {
    name: profileUser?.username || paramUsername || 'User',
    username: `@${(profileUser?.username || paramUsername || 'user').toLowerCase().replace(/\s+/g, '')}`,
    bio: profileUser?.bio || 'No bio added yet.',
    location: profileUser?.location || 'Location not set',
    joined: 'July 2026',
    avatar: profileUser?.profileImage || derivedAvatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    stats: {
      threads: threadsCount,
      replies: repliesCount,
      likes: likesCount,
      followers: profileUser?.followerCount || 0
    }
  };

  const openPostModal = (post) => setSelectedPost(post);
  const closePostModal = () => setSelectedPost(null);

  const tabs = ['Threads', 'Replies'];
  if (isOwnProfile) {
    tabs.push('Bookmarks');
  }

  const myReplies = posts.filter(post => 
    post.comments?.some(comment => comment.author === username)
  );

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-banner">
          {/* SVG Wave Background */}
          <svg className="wave-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="rgba(255, 255, 255, 0.4)" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,181.3C384,160,480,96,576,96C672,96,768,160,864,186.7C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="profile-info-section">
          <div className="profile-avatar-container">
            <img src={profileData.avatar} alt={profileData.name} className="profile-avatar-large" />
          </div>
          
          <div className="profile-details">
            <div className="profile-name-row">
              <div>
                <h1 className="profile-name">{profileData.name}</h1>
                <p className="profile-username">{profileData.username}</p>
              </div>
              {isOwnProfile ? (
                <button className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>
                  <Edit3 size={16} /> Edit Profile
                </button>
              ) : (
                <button 
                  className={`edit-profile-btn ${isFollowing ? 'following' : ''}`} 
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  style={{
                    background: isFollowing ? 'transparent' : 'var(--primary)',
                    color: isFollowing ? 'var(--text-dark)' : 'white',
                    border: isFollowing ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  {isFollowLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            
            <p className="profile-bio">{profileData.bio}</p>
            
            <div className="profile-meta">
              <span className="meta-item"><MapPin size={14} /> {profileData.location}</span>
              <span className="meta-dot">•</span>
              <span className="meta-item"><Calendar size={14} /> Joined {profileData.joined}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="profile-stats-card">
        <div className="stat-item">
          <FileText size={20} className="stat-icon purple" />
          <span className="stat-value">{profileData.stats.threads}</span>
          <span className="stat-label">Threads</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <MessageCircle size={20} className="stat-icon blue" />
          <span className="stat-value">{profileData.stats.replies}</span>
          <span className="stat-label">Replies</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <Heart size={20} className="stat-icon red" />
          <span className="stat-value">{profileData.stats.likes}</span>
          <span className="stat-label">Likes</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <Users size={20} className="stat-icon purple" />
          <span className="stat-value">{profileData.stats.followers}</span>
          <span className="stat-label">Followers</span>
        </div>
      </div>

      {/* Profile Content Area */}
      <div className="profile-content-card">
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="profile-tab-content">
          {activeTab === 'Threads' && (
            <div className="profile-threads-list">
              {myThreads.map(post => (
                <div key={post.id} className="profile-thread-item" onClick={() => openPostModal(post)}>
                  <div className="pt-left">
                    <h3 className="pt-title">{post.title}</h3>
                    <p className="pt-snippet">{(post.snippet || '').substring(0, 80)}...</p>
                  </div>
                  <div className="pt-right">
                    <span className="pt-stat"><MessageCircle size={14} /> {post.comments?.length || 0}</span>
                    <span className="pt-stat"><Eye size={14} /> {post.views || 0}</span>
                    <span className="pt-time">2 days ago</span>
                    {isOwnProfile && (
                      <div className="pt-actions" onClick={e => e.stopPropagation()}>
                        <button className="icon-btn edit" onClick={() => openEditThread(post)} title="Edit Thread">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-btn delete" onClick={() => {
                          if (window.confirm('Are you sure you want to delete this thread?')) {
                            deletePost(post.id);
                          }
                        }} title="Delete Thread">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {myThreads.length === 0 && (
                <div className="empty-tab-state">
                  <p>No threads posted yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Replies' && (
            <div className="profile-threads-list">
              {myReplies.map(post => (
                <div key={post.id} className="profile-thread-item" onClick={() => openPostModal(post)}>
                  <div className="pt-left">
                    <h3 className="pt-title">Replied to: {post.title}</h3>
                    <p className="pt-snippet">{(post.snippet || '').substring(0, 80)}...</p>
                  </div>
                  <div className="pt-right">
                    <span className="pt-stat"><MessageCircle size={14} /> {post.comments?.length || 0}</span>
                    <span className="pt-stat"><Eye size={14} /> {post.views || 0}</span>
                    <span className="pt-time">2 days ago</span>
                  </div>
                </div>
              ))}
              {myReplies.length === 0 && (
                <div className="empty-tab-state">
                  <p>No replies yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Bookmarks' && (
            <div className="profile-threads-list">
              {savedPosts.map(post => (
                <div key={post.id} className="profile-thread-item" onClick={() => openPostModal(post)}>
                  <div className="pt-left">
                    <h3 className="pt-title">{post.title}</h3>
                    <p className="pt-snippet">{(post.snippet || '').substring(0, 80)}...</p>
                  </div>
                  <div className="pt-right">
                    <span className="pt-stat"><MessageCircle size={14} /> {post.comments?.length || 0}</span>
                    <span className="pt-stat"><Eye size={14} /> {post.views || 0}</span>
                    <span className="pt-time">2 days ago</span>
                  </div>
                </div>
              ))}
              {savedPosts.length === 0 && (
                <div className="empty-tab-state">
                  <p>No bookmarks yet.</p>
                </div>
              )}
            </div>
          )}
          
          {!['Threads', 'Replies', 'Bookmarks'].includes(activeTab) && (
            <div className="empty-tab-state">
              <p>Nothing to show here yet.</p>
            </div>
          )}
        </div>
      </div>

      {selectedPost && (
        <PostDetailsModal post={selectedPost} onClose={closePostModal} />
      )}
      
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={profileUser}
        onUpdate={(updatedUser) => {
          setProfileUser(updatedUser);
          setLoggedInUser(updatedUser);
        }}
      />
    </motion.div>
  );
};

export default ProfilePage;
