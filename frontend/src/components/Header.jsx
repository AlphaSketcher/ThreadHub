import React from 'react';
import { Search, SlidersHorizontal, Bell, MessageSquare, User } from 'lucide-react';
import './Header.css';

import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';
import TimeDisplay from './TimeDisplay';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const { getUserNotifications, getUnreadCount, markAllAsRead } = useNotifications();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="header-wrapper">
      <header className="header">
        <div className="header-left">

          <img src="/logo.png" alt="ThreadHub" className="mobile-logo" />
        </div>

        <div className="search-bar desktop-search">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search for topics, categories, or users..." />
          <div className="shortcut">Ctrl / K</div>
        </div>
        
        <div className="header-actions">
          {token ? (
            <div className="auth-icons">
              <div className="user-menu-container">
                <div className="icon-btn">
                  <MessageSquare size={22} />
                  <span className="badge">3</span>
                </div>
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
              
              <div className="user-menu-container">
                <div className="icon-btn" onClick={() => user && markAllAsRead()}>
                  <Bell size={22} />
                  {user && getUnreadCount() > 0 && (
                    <span className="badge">{getUnreadCount()}</span>
                  )}
                </div>
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
              <div className="user-menu-container">
                <div className="user-profile-btn" title="Profile options">
                  <div className="user-avatar">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="profile-img" />
                    ) : (
                      <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" alt="Default Profile" className="profile-img" />
                    )}
                  </div>
                  <span className="user-name">{user?.username || 'User'}</span>
                </div>
                
                <div className="profile-dropdown">
                  <Link to="#" className="dropdown-header dropdown-header-link">
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

      <div className="mobile-search-container">
        <div className="mobile-search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search for topics, categories, or users..." />
          <SlidersHorizontal size={18} className="search-filter-icon" />
        </div>
      </div>
    </div>
  );
};

export default Header;
