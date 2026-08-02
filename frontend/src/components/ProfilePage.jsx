import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Edit3, FileText, MessageCircle, Heart, Users, Eye } from 'lucide-react';
import { usePosts } from '../context/PostsContext';
import PostItem from './PostItem';
import PostDetailsModal from './PostDetailsModal';
import EditProfileModal from './EditProfileModal';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('My Threads');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { posts } = usePosts();
  
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  // Mock profile data for what's not in localStorage
  const profileData = {
    name: user?.username || 'User',
    username: `@${(user?.username || 'user').toLowerCase()}`,
    bio: user?.bio || 'Student Developer | Passionate about building web apps and learning new technologies.',
    location: user?.location || 'Nigeria',
    joined: 'July 2026',
    avatar: user?.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    stats: {
      threads: 15,
      replies: 42,
      likes: 120,
      followers: 28
    }
  };

  // Filter posts to simulate user's threads
  const myThreads = posts.slice(0, 3); // Just grabbing first 3 for demo as user might not have created any

  const openPostModal = (post) => setSelectedPost(post);
  const closePostModal = () => setSelectedPost(null);

  const tabs = ['My Threads', 'Replies', 'Bookmarks', 'Liked', 'About'];

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
              <button className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>
                <Edit3 size={16} /> Edit Profile
              </button>
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
          {activeTab === 'My Threads' && (
            <div className="profile-threads-list">
              {myThreads.map(post => (
                <div key={post.id} className="profile-thread-item" onClick={() => openPostModal(post)}>
                  <div className="pt-left">
                    <h3 className="pt-title">{post.title}</h3>
                    <p className="pt-snippet">{post.content.substring(0, 80)}...</p>
                  </div>
                  <div className="pt-right">
                    <span className="pt-stat"><MessageCircle size={14} /> {post.comments?.length || Math.floor(Math.random() * 30)}</span>
                    <span className="pt-stat"><Eye size={14} /> {Math.floor(Math.random() * 500) + 100}</span>
                    <span className="pt-time">2 days ago</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab !== 'My Threads' && (
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
        user={user}
        onUpdate={(updatedUser) => setUser(updatedUser)}
      />
    </motion.div>
  );
};

export default ProfilePage;
