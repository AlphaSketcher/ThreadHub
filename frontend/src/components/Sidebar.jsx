import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Hash, Home, Compass, Grid, Bookmark, MessageSquare, Users,
  Code, Terminal, Microscope, Coffee, BookOpen, Gamepad2,
  Trophy, Calendar, HelpCircle, Info, Mail, Edit3
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { usePosts } from '../context/PostsContext';
import './Sidebar.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Sidebar = () => {
  const { openCreateThread } = useModal();
  const { posts } = usePosts();
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
    <motion.aside 
      className="sidebar"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="logo-container">
        <img src="/logo.png" alt="ThreadHub Logo" className="logo-image" />
      </motion.div>

      <motion.div variants={itemVariants} className="nav-section">
        <div className="nav-list">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={18} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/discover" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Compass size={18} />
            <span>Discover</span>
          </NavLink>
          <NavLink to="/bookmarks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bookmark size={18} />
            <span>Bookmarks</span>
          </NavLink>
          <NavLink to="/my-threads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MessageSquare size={18} />
            <span>My Threads</span>
          </NavLink>
          <NavLink to="/following" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Following</span>
          </NavLink>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="sidebar-create-btn-wrapper">
        <button className="sidebar-create-btn" onClick={handleCreateClick}>
          <Edit3 size={18} /> Create Thread
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="nav-section">
        <h3 className="section-title">CATEGORIES</h3>
        <div className="nav-list category-list">
          {[
            { id: 'Technology', name: 'Technology', icon: Code, colorClass: 'tech' },
            { id: 'Programming', name: 'Programming', icon: Terminal, colorClass: 'prog' },
            { id: 'Science', name: 'Science', icon: Microscope, colorClass: 'sci' },
            { id: 'Lifestyle', name: 'Lifestyle', icon: Coffee, colorClass: 'life' },
            { id: 'Education', name: 'Education', icon: BookOpen, colorClass: 'edu' },
            { id: 'Gaming', name: 'Gaming', icon: Gamepad2, colorClass: 'game' },
            { id: 'Others', name: 'Others', icon: Hash, colorClass: 'others' }
          ].map((cat) => {
            const Icon = cat.icon;
            const count = posts.filter(p => p.category === cat.name).length;
            return (
              <NavLink 
                key={cat.id} 
                to={`/category/${cat.id.toLowerCase()}`} 
                className={({ isActive }) => `nav-item category-sidebar-item ${isActive ? 'active' : ''}`}
              >
                <div className={`cat-icon ${cat.colorClass}`}>
                  <Icon size={14} />
                </div>
                <span className="cat-name">{cat.name}</span>
                <span className="count">{count}</span>
              </NavLink>
            );
          })}
        </div>
        <Link to="/categories" className="see-all" style={{display: 'block'}}>See all categories &rarr;</Link>
      </motion.div>

      <motion.div variants={itemVariants} className="nav-section">
        <h3 className="section-title">COMMUNITY</h3>
        <div className="nav-list">
          <Link to="/leaderboard" className="nav-item">
            <Trophy size={18} />
            <span>Leaderboard</span>
          </Link>
          <Link to="/events" className="nav-item">
            <Calendar size={18} />
            <span>Events</span>
          </Link>
          <Link to="/faqs" className="nav-item">
            <HelpCircle size={18} />
            <span>FAQs</span>
          </Link>
          <Link to="/about" className="nav-item">
            <Info size={18} />
            <span>About ThreadHub</span>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bottom-card">
        <div className="card-content">
          <h4>Join Newsletter <Mail size={14} style={{display: 'inline', marginLeft: '4px'}}/></h4>
          <p>Get the best threads delivered to your inbox daily.</p>
          <button className="btn-primary" style={{width: '100%', marginTop: '12px'}}>Subscribe</button>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;
