import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, Bookmark, User } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import './BottomNav.css';

const BottomNav = () => {
  const { openCreateThread } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreateClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
    } else {
      openCreateThread();
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="bottom-nav">
      <div className={`nav-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
        <Home size={22} />
        <span>Home</span>
      </div>
      <div className={`nav-item ${isActive('/discover') ? 'active' : ''}`} onClick={() => navigate('/discover')}>
        <Compass size={22} />
        <span>Discover</span>
      </div>
      
      <div className="nav-item create-btn-wrapper" onClick={handleCreateClick}>
        <div className="create-fab">
          <Plus size={24} color="white" />
        </div>
        <span>Create</span>
      </div>

      <div className={`nav-item ${isActive('/bookmarks') ? 'active' : ''}`} onClick={() => navigate('/bookmarks')}>
        <Bookmark size={22} />
        <span>Saved</span>
      </div>
      <div className={`nav-item ${isActive('/my-threads') ? 'active' : ''}`} onClick={() => navigate('/my-threads')}>
        <User size={22} />
        <span>Profile</span>
      </div>
    </div>
  );
};

export default BottomNav;
