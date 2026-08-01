import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, ChevronLeft, X, MessageSquare, Bookmark, CheckCircle2, MoreHorizontal, ShieldCheck, Rocket, Settings2, BarChart2, Lightbulb, HeartCrack, Reply, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import PostDetailsModal from './PostDetailsModal';
import PostItem from './PostItem';
import { useBookmarks } from '../context/BookmarksContext';
import { usePosts } from '../context/PostsContext';
import './MainFeed.css';

const feedContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const feedItemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const postCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const MainFeed = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const { posts } = usePosts();

  const openPostModal = (post) => setSelectedPost(post);
  const closePostModal = () => setSelectedPost(null);

  return (
    <motion.main 
      className="main-feed"
      variants={feedContainerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero Banner */}
      <motion.div variants={feedItemVariants} className="hero-banner">
        <h2 className="hero-welcome">Welcome to ThreadHub 👋</h2>
        <h1 className="hero-title">Share ideas. Start conversations.<br/>Connect with the world.</h1>
        <p className="hero-subtitle">Be part of meaningful discussions on anything that matters.</p>
        <div className="hero-actions">
          <button className="btn-explore">Explore Trending <ArrowRight size={16} /></button>
          <button className="btn-categories">Explore Categories</button>
        </div>
      </motion.div>

      {/* Trending Cards */}
      <motion.div variants={feedItemVariants} className="trending-cards-wrapper">
        <div className="trending-cards">
          <div className="trend-card" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=300&auto=format&fit=crop")'}}>
            <div className="card-overlay"></div>
            <span className="card-tag green">Health</span>
            <div className="card-content">
              <h3>Does wearing mask actually effective?</h3>
              <p>128 replies • Trending</p>
            </div>
          </div>
          <div className="trend-card" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&auto=format&fit=crop")'}}>
            <div className="card-overlay"></div>
            <span className="card-tag purple">Gaming</span>
            <div className="card-content">
              <h3>How to know that your friend is an impostor?</h3>
              <p>96 replies • Trending</p>
            </div>
          </div>
          <div className="trend-card" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop")'}}>
            <div className="card-overlay"></div>
            <span className="card-tag red">Music</span>
            <div className="card-content">
              <h3>The secret behind creating a good original song.</h3>
              <p>74 replies • Trending</p>
            </div>
          </div>
          <div className="trend-card" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=300&auto=format&fit=crop")'}}>
            <div className="card-overlay"></div>
            <span className="card-tag yellow">Lifestyle</span>
            <div className="card-content">
              <h3>How to ensure that you are not dumb?</h3>
              <p>62 replies • Trending</p>
            </div>
          </div>
        </div>
        <button className="scroll-btn right"><ChevronRight size={20} /></button>
        
        {/* Mock pagination dots for visual completeness */}
        <div className="trending-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </motion.div>

      {/* Feed Filters */}
      <motion.div variants={feedItemVariants} className="feed-filters-new">
        <div className="filter-pills-row">
          <button className="filter-pill active"><Star size={14} className="pill-icon" /> For You</button>
          <button className="filter-pill">Latest</button>
          <button className="filter-pill">Most Popular</button>
          <button className="filter-pill">Top Rated</button>
          <button className="filter-pill">Following</button>
        </div>
        <button className="filter-settings-btn"><Settings2 size={18} /></button>
      </motion.div>

      {/* Posts List */}
      <div className="post-list">
        {posts.map(post => (
          <PostItem key={post.id} post={post} onOpenModal={() => openPostModal(post)} />
        ))}
      </div>

      <AnimatePresence>
        {selectedPost && (
          <PostDetailsModal post={selectedPost} onClose={closePostModal} />
        )}
      </AnimatePresence>
    </motion.main>
  );
};

// Temp star icon for For You filter
const Star = ({size, className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

export default MainFeed;
