import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HeartCrack, Lightbulb, Reply, MoreHorizontal, ThumbsUp, ThumbsDown, MessageSquare, Bookmark } from 'lucide-react';
import { useBookmarks } from '../context/BookmarksContext';
import { usePosts } from '../context/PostsContext';
import { useNotifications } from '../context/NotificationsContext';
import { useNavigate } from 'react-router-dom';
import TimeDisplay from './TimeDisplay';
import './PostDetailsModal.css';

const CommentNode = ({ comment, postId, addComment, voteComment, addNotification, user, navigate, postAuthor }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Derived voting states
  const helpfulVotes = comment.helpfulVotes || [];
  const notHelpfulVotes = comment.notHelpfulVotes || [];
  const hasVoted = user ? (helpfulVotes.includes(user.username) ? 'helpful' : notHelpfulVotes.includes(user.username) ? 'not-helpful' : null) : null;
  const displayHelpful = (comment.helpfulCount || 0) + helpfulVotes.length;
  const displayNotHelpful = (comment.notHelpfulCount || 0) + notHelpfulVotes.length;

  const handleHelpful = () => {
    if (!user) {
      alert("You must be logged in to vote.");
      navigate('/auth');
      return;
    }
    voteComment(postId, comment.id, user.username, 'helpful');
  };

  const handleNotHelpful = () => {
    if (!user) {
      alert("You must be logged in to vote.");
      navigate('/auth');
      return;
    }
    voteComment(postId, comment.id, user.username, 'not-helpful');
  };

  const handleReplySubmit = () => {
    if (!user) {
      alert("You must be logged in to reply.");
      navigate('/auth');
      return;
    }
    if (!replyText.trim()) return;

    addComment(postId, comment.id, {
      author: user.username,
      avatar: user.profileImage || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      time: "Just now",
      text: replyText.trim()
    });

    addNotification({
      type: 'reply',
      fromUser: user.username,
      toUser: comment.author,
      postId: postId,
      message: `@${user.username} replied to your comment: "${replyText.trim().substring(0, 30)}..."`
    });

    setIsReplying(false);
    setReplyText('');
  };

  return (
    <div className="comment-node">
      <div className="comment-content">
        <div className="comment-header-modal">
          <img src={user && user.username === comment.author && user.profileImage ? user.profileImage : comment.avatar} alt={comment.author} className="modal-comment-avatar" />
          <span className="modal-comment-author">{comment.author}</span>
          <span className="modal-comment-time">• <TimeDisplay timestamp={comment.createdAt || comment.time} /></span>
        </div>
        
        <p className="modal-comment-text">{comment.text}</p>
        
        <div className="modal-comment-actions">
          <button 
            className={`mc-action-btn helpful ${hasVoted === 'helpful' ? 'active' : ''}`} 
            onClick={handleHelpful}
          >
            <Lightbulb size={14} className={hasVoted === 'helpful' ? 'icon-yellow' : ''} /> 
            Helpful <span>{displayHelpful}</span>
          </button>
          <button 
            className={`mc-action-btn not-helpful ${hasVoted === 'not-helpful' ? 'active' : ''}`} 
            onClick={handleNotHelpful}
          >
            <HeartCrack size={14} className={hasVoted === 'not-helpful' ? 'icon-red' : ''} /> 
            Not Helpful <span>{displayNotHelpful}</span>
          </button>
          <button className="mc-action-btn" onClick={() => {
            if (!user) { alert("You must be logged in to reply."); navigate('/auth'); return; }
            setIsReplying(!isReplying);
          }}>
            <Reply size={14} /> Reply
          </button>
          <button className="mc-action-btn icon-only">
            <MoreHorizontal size={14} />
          </button>
        </div>

        {isReplying && (
          <div className="modal-reply-box">
            <textarea 
              placeholder={`Replying to ${comment.author}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
            />
            <div className="reply-box-actions">
              <button className="btn-cancel" onClick={() => setIsReplying(false)}>Cancel</button>
              <button className="btn-reply-submit" onClick={handleReplySubmit}>Reply</button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => (
            <CommentNode 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              addComment={addComment}
              voteComment={voteComment}
              addNotification={addNotification}
              user={user}
              navigate={navigate}
              postAuthor={postAuthor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PostDetailsModal = ({ post, onClose }) => {
  const [mainCommentText, setMainCommentText] = useState('');

  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { toggleVote, addComment, voteComment } = usePosts();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const saved = isBookmarked(post.id);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAuthor = user && user.username === post.author;
  const displayAvatar = isAuthor && user.profileImage ? user.profileImage : (post.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');

  const upvotes = post.upvotes || [];
  const downvotes = post.downvotes || [];
  const voteStatus = user ? (upvotes.includes(user.username) ? 'up' : downvotes.includes(user.username) ? 'down' : 'none') : 'none';
  const displayVoteCount = (post.initialVoteCount || 0) + upvotes.length;
  const displayDownvoteCount = (post.initialDownvoteCount || 0) + downvotes.length;

  const handleVote = async (type) => {
    if (!user) {
      alert("You must be logged in to vote.");
      navigate('/auth');
      return;
    }
    
    const wasAdded = await toggleVote(post.id, user.username, type);
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

  const submitMainComment = () => {
    if (!user) {
      alert("You must be logged in to comment.");
      navigate('/auth');
      return;
    }
    if (!mainCommentText.trim()) return;
    
    addComment(post.id, null, {
      author: user.username,
      avatar: user.profileImage || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      time: "Just now",
      text: mainCommentText.trim()
    });

    addNotification({
      type: 'comment',
      fromUser: user.username,
      toUser: post.author,
      postId: post.id,
      message: `@${user.username} commented on your post: "${mainCommentText.trim().substring(0, 30)}..."`
    });

    setMainCommentText('');
  };

  useEffect(() => {
    // Lock scroll when this modal is open
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    };
  }, []);

  const renderPhotoCollage = () => {
    if (!post.images || post.images.length === 0) return null;

    const imgCount = post.images.length;
    
    if (imgCount === 1) {
      return (
        <div className="post-image-container single">
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
      className="pdm-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="pdm-container"
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pdm-header">
          <h3>Post Details</h3>
          <button className="pdm-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="pdm-body">
          {/* Post Header */}
          <div className="pdm-post-header">
            <img src={displayAvatar} alt="Author" className="pdm-post-avatar" />
            <div>
              <div className="pdm-post-author">{post.author}</div>
              <div className="pdm-post-time"><TimeDisplay timestamp={post.createdAt || post.time} /> in {post.category}</div>
            </div>
          </div>

          <h2 className="pdm-post-title">{post.title}</h2>
          <p className="pdm-post-text" style={{ whiteSpace: 'pre-wrap' }}>{post.snippet}</p>

          {renderPhotoCollage()}

          {/* Action Bar */}
          <div className="post-actions-bar-new">
            <div className={`yt-vote-container ${voteStatus === 'up' ? 'voted-up' : voteStatus === 'down' ? 'voted-down' : ''}`}>
              <button 
                className={`yt-vote-btn up ${voteStatus === 'up' ? 'active' : ''}`} 
                onClick={() => handleVote('up')}
              >
                <ThumbsUp size={16} className={voteStatus === 'up' ? 'fill-icon' : ''} />
                <span className="yt-vote-count">{displayVoteCount}</span>
              </button>
              <div className="yt-vote-divider"></div>
              <button 
                className={`yt-vote-btn down ${voteStatus === 'down' ? 'active' : ''}`} 
                onClick={() => handleVote('down')}
              >
                <ThumbsDown size={16} className={voteStatus === 'down' ? 'fill-icon' : ''} />
                <span className="yt-vote-count">{displayDownvoteCount}</span>
              </button>
            </div>

            <div className="action-divider"></div>
            <button className="action-btn-new">
              <MessageSquare size={18} /> 
              <span className="action-text">
                <span className="action-title">Discuss</span>
                <span className="action-subtitle">{post.discussCount}</span>
              </span>
            </button>
            <button 
              className={`action-btn-new ${saved ? 'active' : ''}`}
              onClick={() => toggleBookmark(post)}
            >
              <Bookmark size={18} className={saved ? 'fill-icon' : ''} style={{ color: saved ? '#7c3aed' : '' }} />
              <span className="action-text">
                <span className="action-title" style={{ color: saved ? '#7c3aed' : '' }}>{saved ? 'Saved' : 'Save'}</span>
                <span className="action-subtitle">45</span>
              </span>
            </button>
            <div className="action-divider"></div>
            
            <button className="action-btn-new icon-only"><MoreHorizontal size={18} /></button>
          </div>

          <div className="pdm-divider"></div>

          <h3 className="pdm-comments-title">Comments ({post.discussCount})</h3>

          <div className="pdm-main-comment-input">
            <img src={user ? (user.profileImage || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y") : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} alt="You" className="modal-comment-avatar" />
            <div className="pdm-input-wrapper">
              <textarea 
                placeholder="Write a comment..." 
                value={mainCommentText}
                onChange={(e) => setMainCommentText(e.target.value)}
              />
              <div className="pdm-input-actions">
                <button className="btn-reply-submit" onClick={submitMainComment}>Comment</button>
              </div>
            </div>
          </div>
          
          <div className="pdm-comments-section">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map(comment => (
                <CommentNode 
                  key={comment.id} 
                  comment={comment} 
                  postId={post.id}
                  addComment={addComment}
                  voteComment={voteComment}
                  addNotification={addNotification}
                  user={user}
                  navigate={navigate}
                  postAuthor={post.author}
                />
              ))
            ) : (
              <p className="pdm-no-comments">No comments yet. Be the first to start the discussion!</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PostDetailsModal;
