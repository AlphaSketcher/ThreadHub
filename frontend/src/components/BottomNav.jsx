import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Compass, Plus, LayoutGrid, User } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import './BottomNav.css';

const BottomNav = () => {
  const { openCreateThread } = useModal();
  const navigate = useNavigate();

  const handleCreateClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
    } else {
      openCreateThread();
    }
  };

  return (
    <div className="bottom-nav">
      <div className="nav-item active">
        <Home size={22} />
        <span>Home</span>
      </div>
      <div className="nav-item">
        <Compass size={22} />
        <span>Discover</span>
      </div>
      
      <div className="nav-item create-btn-wrapper" onClick={handleCreateClick}>
        <div className="create-fab">
          <Plus size={24} color="white" />
        </div>
        <span>Create</span>
      </div>

      <div className="nav-item" onClick={() => navigate('/categories')}>
        <LayoutGrid size={22} />
        <span>Categories</span>
      </div>
      <div className="nav-item" onClick={() => navigate('/my-threads')}>
        <User size={22} />
        <span>My Threads</span>
      </div>
    </div>
  );
};

export default BottomNav;
