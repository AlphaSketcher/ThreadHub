import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, MessageSquare, Bookmark, CheckCircle2, MoreHorizontal, ShieldCheck, Rocket, BarChart2, Lightbulb, HeartCrack, Reply, ThumbsUp, ThumbsDown, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { useBookmarks } from '../context/BookmarksContext';
import { usePosts } from '../context/PostsContext';
import { useModal } from '../context/ModalContext';
import { useNotifications } from '../context/NotificationsContext';
import { useNavigate } from 'react-router-dom';
import TimeDisplay from './TimeDisplay';

const postCardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const PostItem = ({ post, onOpenModal }) => {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { deletePost, toggleVote } = usePosts();
  const { openEditThread } = useModal();
  const { addNotification } = useNotifications();
  const saved = isBookmarked(post.id);
  const navigate = useNavigate();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if current user is author
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAuthor = user && user.username === post.author;

  // Determine if post is long
  const isLongText = post.snippet && post.snippet.length > 250;

  // Derived vote states
  const upvotes = post.upvotes || [];
  const downvotes = post.downvotes || [];
  
  const voteStatus = user ? (upvotes.includes(user.username) ? 'up' : downvotes.includes(user.username) ? 'down' : 'none') : 'none';
  const displayVoteCount = (post.initialVoteCount || 0) + upvotes.length;
  const displayDownvoteCount = (post.initialDownvoteCount || 0) + downvotes.length;

  const categoryColor = post.categoryColor || { bg: "#f1f5f9", text: "#475569" };

  const handleVote = async (type) => {
    if (!user) {
      alert("You must be logged in to vote.");
      navigate('/auth');
      return;
    }
    
    const wasAdded = await toggleVote(post.id, user.username, type);
    
    // Only send notification on a NEW like (not removal, and not downvote)
    if (wasAdded && type === 'up') {
      addNotification({
        type: 'like',
        fromUser: user.username,
        toUser: post.author,
        postId: post.id,
        message: `@${user.username} liked your post "${post.title}"`
      });
    }
  };

  useEffect(() => {
    if (lightboxOpen) {
      document.body.classList.add('no-scroll');
      document.documentElement.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    };
  }, [lightboxOpen]);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = (e) => {
    e.stopPropagation();
    if (post.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (post.images && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const renderPhotoCollage = () => {
    if (!post.images || post.images.length === 0) return null;

    const imgCount = post.images.length;
    
    if (imgCount === 1) {
      return (
        <div className="post-image-container single" onClick={() => openLightbox(0)}>
          <img src={post.images[0]} alt="Post" className="post-hero-image" />
        </div>
      );
    }

    const maxDisplay = 4;
    const displayImages = post.images.slice(0, maxDisplay);
    const extraCount = imgCount > maxDisplay ? imgCount - maxDisplay : 0;
    
    const layoutClass = imgCount >= 4 ? 'layout-4' : `layout-${imgCount}`;

    return (
      <div className={`photo-collage ${layoutClass}`}>
        {displayImages.map((img, index) => {
          const isLastSlot = index === maxDisplay - 1;
          return (
            <div 
              key={index} 
              className={`collage-item ${isLastSlot && extraCount > 0 ? 'has-overlay' : ''}`}
              onClick={() => openLightbox(index)}
            >
              <img src={img} alt={`Post item ${index + 1}`} />
              {isLastSlot && extraCount > 0 && (
                <div className="collage-more-overlay">
                  +{extraCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div 
      className="post-card"
      variants={postCardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="post-meta">
        <div className="post-meta-left">
          <img src={post.avatar} alt="User" className="post-avatar" />
          <div className="post-header-info">
            <div className="post-author">{post.author} {post.verified && <CheckCircle2 size={14} color="#3b82f6" className="verified-icon" />}</div>
            <div className="post-time">
              <TimeDisplay timestamp={post.createdAt || post.time} /> in <span className="post-category">{post.category}</span>
            </div>
          </div>
        </div>
        <div className="post-meta-right">
          <div className="orbit-wrapper">
            <button className="orbit-btn"><Rocket size={14} /> Orbit</button>
            <div className="orbit-tooltip">
              <div className="tooltip-header">
                <h4>Orbit this user</h4>
                <span className="close-tooltip">×</span>
              </div>
              <p>See their threads appear in your orbit feed.</p>
            </div>
          </div>
          
          <div className="post-options-wrapper" style={{ position: 'relative' }}>
            <button 
              className="post-options-btn" 
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            >
              <MoreHorizontal size={20} />
            </button>
            
            {/* Options Dropdown */}
            <AnimatePresence>
              {isOptionsOpen && (
                <motion.div 
                  className="post-options-dropdown"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.5rem',
                    backgroundColor: 'var(--panel-bg)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-color)',
                    minWidth: '150px',
                    zIndex: 50,
                    overflow: 'hidden'
                  }}
                >
                  {isAuthor ? (
                    <>
                      <button 
                        className="dropdown-item"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: '0.9rem', textAlign: 'left' }}
                        onClick={() => {
                          setIsOptionsOpen(false);
                          openEditThread(post);
                        }}
                      >
                        <Edit size={16} /> Edit Thread
                      </button>
                      <button 
                        className="dropdown-item"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.9rem', textAlign: 'left' }}
                        onClick={() => {
                          setIsOptionsOpen(false);
                          if(window.confirm('Are you sure you want to delete this thread?')) {
                            deletePost(post.id);
                          }
                        }}
                      >
                        <Trash2 size={16} /> Delete Thread
                      </button>
                    </>
                  ) : (
                    <button 
                      className="dropdown-item"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: '0.9rem', textAlign: 'left' }}
                    >
                      Report Post
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className="post-body">
        <h3 className="post-title">
          {post.title} {post.hasShield && <ShieldCheck size={18} className="title-shield" />}
        </h3>
        
        <div className={`post-snippet-wrapper ${isLongText && !isExpanded ? 'collapsed' : ''}`}>
          <p className="post-snippet">{post.snippet}</p>
          {isLongText && !isExpanded && <div className="snippet-fade"></div>}
        </div>
        {isLongText && (
          <button className="see-more-btn" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
            {isExpanded ? 'Show less' : 'See more'}
          </button>
        )}
        
        {renderPhotoCollage()}
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="post-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="post-actions-bar-new">
        <div className={`yt-vote-container ${voteStatus !== 'none' ? `voted-${voteStatus}` : ''}`}>
          <motion.button 
            className={`yt-vote-btn up ${voteStatus === 'up' ? 'active' : ''}`}
            onClick={() => handleVote('up')}
            whileTap={{ scale: 0.85 }}
          >
            <motion.div animate={{ rotate: voteStatus === 'up' ? [0, -15, 10, 0] : 0 }} transition={{ duration: 0.4 }}>
              <ThumbsUp size={18} className={voteStatus === 'up' ? 'fill-icon' : ''} />
            </motion.div>
            <span className="yt-vote-count">{displayVoteCount}</span>
          </motion.button>
          
          <div className="yt-vote-divider"></div>
          
          <motion.button 
            className={`yt-vote-btn down ${voteStatus === 'down' ? 'active' : ''}`}
            onClick={() => handleVote('down')}
            whileTap={{ scale: 0.85 }}
          >
            <motion.div animate={{ rotate: voteStatus === 'down' ? [0, 15, -10, 0] : 0 }} transition={{ duration: 0.4 }}>
              <ThumbsDown size={18} className={voteStatus === 'down' ? 'fill-icon' : ''} />
            </motion.div>
            <span className="yt-vote-count">{displayDownvoteCount}</span>
          </motion.button>
        </div>

        <div className="action-divider"></div>
        <button className="action-btn-new" onClick={onOpenModal}>
          <MessageSquare size={18} /> 
          <span className="action-text">
            <span className="action-title">Discuss</span>
            <span className="action-subtitle">{post.discussCount}</span>
          </span>
        </button>
        <button className="action-btn-new">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          <span className="action-text"><span className="action-title">Share</span></span>
        </button>
        <div className="action-divider"></div>
        <button 
          className={`action-btn-new ${saved ? 'active' : ''}`}
          onClick={() => toggleBookmark(post)}
        >
          <Bookmark size={18} className={saved ? 'fill-icon' : ''} style={{ color: saved ? '#7c3aed' : '' }} />
          <span className="action-text">
            <span className="action-title" style={{ color: saved ? '#7c3aed' : '' }}>{saved ? 'Saved' : 'Save'}</span>
          </span>
        </button>
        <div className="action-divider"></div>
        <button className="action-btn-new"><BarChart2 size={18} /> <span className="action-text"><span className="action-title">Insights</span></span></button>
        <div className="action-divider"></div>
        <button className="action-btn-new icon-only"><MoreHorizontal size={18} /></button>
      </div>

      {post.hasComment && post.comments && post.comments.length > 0 && (
        <>
          <div className="top-comment-section" onClick={onOpenModal} style={{ cursor: 'pointer' }}>
            <div className="comment-tree-line"></div>
            <div className="top-comment">
              <div className="comment-header">
                <img src={post.comments[0].avatar} alt="User" className="comment-avatar" />
                <span className="comment-author">{post.comments[0].author}</span>
                <span className="comment-time">• {post.comments[0].time}</span>
              </div>
              <p className="comment-text">{post.comments[0].text}</p>
              <div className="comment-actions-new">
                <button className="c-action-btn-new helpful" onClick={(e) => e.stopPropagation()}><Lightbulb size={14} className="icon-yellow" /> Helpful <span className="count">{post.comments[0].helpfulCount}</span></button>
                <button className="c-action-btn-new not-helpful" onClick={(e) => e.stopPropagation()}><HeartCrack size={14} className="icon-red" /> Not Helpful <span className="count">{post.comments[0].notHelpfulCount}</span></button>
                <button className="c-action-btn-new reply" onClick={(e) => { e.stopPropagation(); onOpenModal(); }}><Reply size={14} /> Reply</button>
                <button className="c-action-btn-new icon-only" onClick={(e) => e.stopPropagation()}><MoreHorizontal size={14} /></button>
              </div>
            </div>
          </div>
          <button className="view-all-comments-btn" onClick={onOpenModal}>
            <ChevronDown size={16} className="view-all-icon" /> View all {post.discussCount} comments
          </button>
        </>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && post.images && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button className="lightbox-close" onClick={closeLightbox}>
              <X size={24} />
            </button>
            
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
              {currentImageIndex > 0 && (
                <button className="lightbox-nav prev" onClick={prevImage}>
                  <ChevronLeft size={32} />
                </button>
              )}
              
              <motion.img 
                key={currentImageIndex}
                src={post.images[currentImageIndex]} 
                alt="Enlarged view" 
                className="lightbox-image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
              
              {currentImageIndex < post.images.length - 1 && (
                <button className="lightbox-nav next" onClick={nextImage}>
                  <ChevronRight size={32} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostItem;
