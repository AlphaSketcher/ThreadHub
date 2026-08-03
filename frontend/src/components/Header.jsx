import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Bell, MessageSquare, User } from 'lucide-react';
import './Header.css';

import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';
import { usePosts } from '../context/PostsContext';
import TimeDisplay from './TimeDisplay';
import PostDetailsModal from './PostDetailsModal';

const Header = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });
  const { getUserNotifications, getUnreadCount, markAllAsRead } = useNotifications();
  const { posts } = usePosts();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSelectedPost, setSearchSelectedPost] = useState(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    
    const handleUserUpdate = () => {
      const userStr = localStorage.getItem('user');
      setUser(userStr ? JSON.parse(userStr) : null);
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        mobileSearchInputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('userUpdated', handleUserUpdate);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('userUpdated', handleUserUpdate);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const filteredPosts = searchQuery.trim() === '' ? [] : posts.filter(post => 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.snippet?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5);

  const allUsersMap = {};
  posts.forEach(post => {
    if (post.author) {
      allUsersMap[post.author] = post.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`;
    }
  });

  const filteredUsers = searchQuery.trim() === '' ? [] : Object.entries(allUsersMap)
    .filter(([name]) => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(([name, avatar]) => ({ name, avatar }))
    .slice(0, 3);

  const SearchSuggestions = () => {
    if (!isSearchFocused || searchQuery.trim() === '' || (filteredPosts.length === 0 && filteredUsers.length === 0)) {
      return null;
    }
    
    return (
      <div className="search-dropdown">
        {filteredUsers.length > 0 && (
          <div className="search-section">
            <div className="search-section-title">Users</div>
            {filteredUsers.map(u => (
              <div key={u.name} className="search-user-item" onClick={() => {
                navigate(`/profile/${encodeURIComponent(u.name)}`);
                setIsSearchFocused(false);
                setSearchQuery('');
              }}>
                <img src={u.avatar} alt={u.name} className="search-user-avatar" />
                <span>{u.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {filteredPosts.length > 0 && (
          <div className="search-section">
            <div className="search-section-title">Threads</div>
            {filteredPosts.map(p => (
              <div key={p.id} className="search-thread-item" onClick={() => {
                setSearchSelectedPost(p);
                setIsSearchFocused(false);
                setSearchQuery('');
              }}>
                <Search size={14} className="search-item-icon" />
                <span className="search-thread-title">{p.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="header-wrapper" ref={headerRef}>
      <header className="header">
        <div className="header-left">

          <img src="/logo.png" alt="ThreadHub" className="mobile-logo" />
        </div>

        <div className="search-bar desktop-search" 
          onFocus={() => setIsSearchFocused(true)} 
          onBlur={(e) => {
            // Delay blur to allow clicks on dropdown items
            setTimeout(() => setIsSearchFocused(false), 200);
          }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for topics, categories, or users..." 
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="shortcut">Ctrl / K</div>
          <SearchSuggestions />
        </div>
        
        <div className="header-actions">
          {token ? (
            <div className="auth-icons">
              <div className={`user-menu-container ${openDropdown === 'messages' ? 'open' : ''}`}>
                <button className="icon-btn" onClick={() => toggleDropdown('messages')}>
                  <MessageSquare size={22} />
                  <span className="badge">3</span>
                </button>
                <div className="profile-dropdown">
                  <div className="dropdown-title-header">Messages</div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-empty-state">
                    <p>No new messages</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="#" className="dropdown-view-all">View all messages</Link>
                </div>
              </div>
              
              <div className={`user-menu-container ${openDropdown === 'notifications' ? 'open' : ''}`}>
                <button className="icon-btn" onClick={() => {
                  toggleDropdown('notifications');
                  if (user) markAllAsRead();
                }}>
                  <Bell size={22} />
                  {user && getUnreadCount() > 0 && (
                    <span className="badge">{getUnreadCount()}</span>
                  )}
                </button>
                <div className="profile-dropdown">
                  <div className="dropdown-title-header">Notifications</div>
                  <div className="dropdown-divider"></div>
                  
                  {user && getUserNotifications().length > 0 ? (
                    <div className="notifications-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {getUserNotifications().map(notif => (
                        <div key={notif.id} className={notif.read ? '' : 'unread-notif'} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                          {notif.message}
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            <TimeDisplay timestamp={notif.createdAt || notif.timestamp} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dropdown-empty-state">
                      <p>No new notifications</p>
                    </div>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  <Link to="#" className="dropdown-view-all">View all notifications</Link>
                </div>
              </div>
              <div className={`user-menu-container ${openDropdown === 'profile' ? 'open' : ''}`}>
                <button className="user-profile-btn" title="Profile options" onClick={() => toggleDropdown('profile')}>
                  <div className="user-avatar">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="profile-img" />
                    ) : (
                      <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" alt="Default Profile" className="profile-img" />
                    )}
                  </div>
                  <span className="user-name">{user?.username || 'User'}</span>
                </button>
                
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-header dropdown-header-link" onClick={() => setOpenDropdown(null)}>
                    <div className="dropdown-avatar-large">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="profile-img" />
                      ) : (
                        <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" alt="Default Profile" className="profile-img" />
                      )}
                    </div>
                    <div className="dropdown-name">{user?.username || 'User'}</div>
                    <span className="dropdown-view-profile">View profile</span>
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <Link to="#" className="dropdown-item">Stats</Link>
                  <Link to="#" className="dropdown-item">Account settings</Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    Logout @{user?.username?.toLowerCase() || 'user'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/auth">
                <button className="btn-secondary">Log in</button>
              </Link>
              <Link to="/auth">
                <button className="btn-primary">Sign up</button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="mobile-search-container"
          onFocus={() => setIsSearchFocused(true)} 
          onBlur={(e) => {
            setTimeout(() => setIsSearchFocused(false), 200);
          }}>
        <div className="mobile-search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for topics, categories, or users..." 
            ref={mobileSearchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <SearchSuggestions />
      </div>
      
      {searchSelectedPost && (
        <PostDetailsModal post={searchSelectedPost} onClose={() => setSearchSelectedPost(null)} />
      )}
    </div>
  );
};

export default Header;
