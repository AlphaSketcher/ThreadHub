import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Hash, Home, Compass, Grid, Bookmark, MessageSquare, Users,
  Code, Terminal, Microscope, Coffee, BookOpen, Gamepad2,
  Trophy, Calendar, HelpCircle, Info, Mail, Edit3
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
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
          <Link to="/category/technology" className="nav-item">
            <div className="cat-icon tech"><Code size={14} /></div>
            <span>Technology</span>
            <span className="count">2.3K</span>
          </Link>
          <Link to="/category/programming" className="nav-item">
            <div className="cat-icon prog"><Terminal size={14} /></div>
            <span>Programming</span>
            <span className="count">1.8K</span>
          </Link>
          <Link to="/category/science" className="nav-item">
            <div className="cat-icon sci"><Microscope size={14} /></div>
            <span>Science</span>
            <span className="count">1.1K</span>
          </Link>
          <Link to="/category/lifestyle" className="nav-item">
            <div className="cat-icon life"><Coffee size={14} /></div>
            <span>Lifestyle</span>
            <span className="count">987</span>
          </Link>
          <Link to="/category/education" className="nav-item">
            <div className="cat-icon edu"><BookOpen size={14} /></div>
            <span>Education</span>
            <span className="count">1.3K</span>
          </Link>
          <Link to="/category/gaming" className="nav-item">
            <div className="cat-icon game"><Gamepad2 size={14} /></div>
            <span>Gaming</span>
            <span className="count">743</span>
          </Link>
        </div>
        <Link to="/" className="see-all" style={{display: 'block'}}>See all categories &rarr;</Link>
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
