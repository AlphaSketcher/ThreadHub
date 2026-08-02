import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const { posts, loading } = usePosts();

  // Carousel and Filter state
  const carouselRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeFilter, setActiveFilter] = useState("For You");

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      
      const cardWidth = 280 + 16; // 280px width + 1rem (16px) gap
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveDot(Math.min(newIndex, 3));
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const cardWidth = 280 + 16;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    handleScroll(); // Check initial scroll state
  }, []);

  const openPostModal = (post) => setSelectedPost(post);
  const closePostModal = () => setSelectedPost(null);

  // Filter posts if viewing a specific category
  const displayedPosts = categoryId 
    ? posts.filter(post => post.category?.toLowerCase() === categoryId.toLowerCase())
    : posts;

  if (loading) {
    return (
      <main className="main-feed" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  return (
    <motion.main 
      className="main-feed"
      variants={feedContainerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero Banner */}
      {!categoryId && (
        <motion.div variants={feedItemVariants} className="hero-banner">
          <h2 className="hero-welcome">Welcome to ThreadHub 👋</h2>
          <h1 className="hero-title">Join the<br/>conversation.</h1>
          <p className="hero-subtitle">Share. Connect. Discover.</p>
          <div className="hero-actions">
            <button className="btn-explore" onClick={() => navigate('/creators')}>Top Creators <ArrowRight size={16} /></button>
            <button className="btn-categories" onClick={() => navigate('/categories')}>Explore Categories</button>
          </div>
        </motion.div>
      )}

      {/* Category Header */}
      {categoryId && (
        <motion.div variants={feedItemVariants} className="category-header" style={{marginBottom: '24px', padding: '0 20px'}}>
          <h2 style={{textTransform: 'capitalize', fontSize: '24px', color: 'var(--text-main)'}}>{categoryId} Threads</h2>
          <p style={{color: 'var(--text-muted)'}}>Explore discussions about {categoryId}.</p>
        </motion.div>
      )}

      {/* Trending Cards */}
      <motion.div variants={feedItemVariants} className="trending-cards-wrapper">
        <div className="trending-cards" ref={carouselRef} onScroll={handleScroll}>
          {[
            { tag: "Health", color: "green", title: "Does wearing mask actually effective?", replies: 128, img: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=300&auto=format&fit=crop" },
            { tag: "Gaming", color: "purple", title: "How to know that your friend is an impostor?", replies: 96, img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&auto=format&fit=crop" },
            { tag: "Music", color: "red", title: "The secret behind creating a good original song.", replies: 74, img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop" },
            { tag: "Lifestyle", color: "yellow", title: "How to ensure that you are not dumb?", replies: 62, img: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=300&auto=format&fit=crop" }
          ].map((card, idx) => (
            <motion.div 
              key={idx}
              className="trend-card" 
              style={{backgroundImage: `url("${card.img}")`}}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-overlay"></div>
              <span className={`card-tag ${card.color}`}>{card.tag}</span>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.replies} replies • Trending</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {canScrollLeft && (
          <button className="scroll-btn left" onClick={() => scrollCarousel('left')}>
            <ChevronLeft size={20} />
          </button>
        )}
        {canScrollRight && (
          <button className="scroll-btn right" onClick={() => scrollCarousel('right')}>
            <ChevronRight size={20} />
          </button>
        )}
        
        <div className="trending-dots">
          {[0, 1, 2, 3].map((dot) => (
            <span key={dot} className={`dot ${activeDot === dot ? 'active' : ''}`}></span>
          ))}
        </div>
      </motion.div>

      {/* Feed Filters */}
      <motion.div variants={feedItemVariants} className="feed-filters-new">
        <div className="filter-pills-row">
          {["For You", "Latest", "Most Popular", "Top Rated", "Following"].map((filter) => (
            <button 
              key={filter} 
              className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {activeFilter === filter && (
                <motion.div
                  layoutId="activeFilterBubble"
                  className="filter-bubble"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {filter === "For You" && <Star size={14} className="pill-icon" />} {filter}
              </span>
            </button>
          ))}
        </div>
        <button className="filter-settings-btn"><Settings2 size={18} /></button>
      </motion.div>

      {/* Posts List */}
      <div className="post-list">
        {displayedPosts.length > 0 ? (
          displayedPosts.map(post => (
            <PostItem key={post.id} post={post} onOpenModal={() => openPostModal(post)} />
          ))
        ) : (
          <div style={{padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
            No posts found in this category yet. Be the first to start a thread!
          </div>
        )}
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
