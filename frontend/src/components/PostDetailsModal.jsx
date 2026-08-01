import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, HeartCrack, Lightbulb, Reply, MoreHorizontal, ThumbsUp, ThumbsDown, MessageSquare, Bookmark } from 'lucide-react';
import { useBookmarks } from '../context/BookmarksContext';
import './PostDetailsModal.css';

const CommentNode = ({ comment }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const [helpfulCount, setHelpfulCount] = useState(comment.helpfulCount || 0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(comment.notHelpfulCount || 0);
  const [hasVoted, setHasVoted] = useState(null); // 'helpful' or 'not-helpful'

  const handleHelpful = () => {
    if (hasVoted === 'helpful') {
      setHasVoted(null);
      setHelpfulCount(c => c - 1);
    } else {
      if (hasVoted === 'not-helpful') setNotHelpfulCount(c => c - 1);
      setHasVoted('helpful');
      setHelpfulCount(c => c + 1);
    }
  };

  const handleNotHelpful = () => {
    if (hasVoted === 'not-helpful') {
      setHasVoted(null);
      setNotHelpfulCount(c => c - 1);
    } else {
      if (hasVoted === 'helpful') setHelpfulCount(c => c - 1);
      setHasVoted('not-helpful');
      setNotHelpfulCount(c => c + 1);
    }
  };

  const handleReplySubmit = () => {
    setIsReplying(false);
    setReplyText('');
    alert("In a production environment, this reply would be posted!");
  };

  return (
    <div className="comment-node">
      <div className="comment-content">
        <div className="comment-header-modal">
          <img src={comment.avatar} alt={comment.author} className="modal-comment-avatar" />
          <span className="modal-comment-author">{comment.author}</span>
          <span className="modal-comment-time">• {comment.time}</span>
        </div>
        
        <p className="modal-comment-text">{comment.text}</p>
        
        <div className="modal-comment-actions">
          <button 
            className={`mc-action-btn helpful ${hasVoted === 'helpful' ? 'active' : ''}`} 
            onClick={handleHelpful}
          >
            <Lightbulb size={14} className={hasVoted === 'helpful' ? 'icon-yellow' : ''} /> 
            Helpful <span>{helpfulCount}</span>
          </button>
          <button 
            className={`mc-action-btn not-helpful ${hasVoted === 'not-helpful' ? 'active' : ''}`} 
            onClick={handleNotHelpful}
          >
            <HeartCrack size={14} className={hasVoted === 'not-helpful' ? 'icon-red' : ''} /> 
            Not Helpful <span>{notHelpfulCount}</span>
          </button>
          <button className="mc-action-btn" onClick={() => setIsReplying(!isReplying)}>
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
            <CommentNode key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
};

const PostDetailsModal = ({ post, onClose }) => {
  const [voteStatus, setVoteStatus] = useState('none');
  const [voteCount, setVoteCount] = useState(post.initialVoteCount);
  const [downvoteCount, setDownvoteCount] = useState(post.initialDownvoteCount || 0);
  const [mainCommentText, setMainCommentText] = useState('');

  const { toggleBookmark, isBookmarked } = useBookmarks();
  const saved = isBookmarked(post.id);

  const handleUpvote = () => {
    if (voteStatus === 'up') {
      setVoteStatus('none');
      setVoteCount(prev => prev - 1);
    } else if (voteStatus === 'down') {
      setVoteStatus('up');
      setVoteCount(prev => prev + 1);
      setDownvoteCount(prev => prev - 1);
    } else {
      setVoteStatus('up');
      setVoteCount(prev => prev + 1);
    }
  };

  const handleDownvote = () => {
    if (voteStatus === 'down') {
      setVoteStatus('none');
      setDownvoteCount(prev => prev - 1);
    } else if (voteStatus === 'up') {
      setVoteStatus('down');
      setDownvoteCount(prev => prev + 1);
      setVoteCount(prev => prev - 1);
    } else {
      setVoteStatus('down');
      setDownvoteCount(prev => prev + 1);
    }
  };

  const submitMainComment = () => {
    if (!mainCommentText.trim()) return;
    alert("In a production app, this would post the main comment!");
    setMainCommentText('');
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
            <img src={post.avatar} alt="Author" className="pdm-post-avatar" />
            <div>
              <div className="pdm-post-author">{post.author}</div>
              <div className="pdm-post-time">{post.time} in {post.category}</div>
            </div>
          </div>

          <h2 className="pdm-post-title">{post.title}</h2>
          <p className="pdm-post-text">{post.snippet}</p>

          {post.images && post.images.length > 0 && (
            <div className="pdm-post-images">
              {post.images.map((img, i) => (
                <img key={i} src={img} alt={`Post media ${i + 1}`} />
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="post-actions-bar-new">
            <div className={`yt-vote-container ${voteStatus === 'up' ? 'voted-up' : voteStatus === 'down' ? 'voted-down' : ''}`}>
              <button 
                className={`yt-vote-btn up ${voteStatus === 'up' ? 'active' : ''}`} 
                onClick={handleUpvote}
              >
                <ThumbsUp size={16} className={voteStatus === 'up' ? 'fill-icon' : ''} />
                <span className="yt-vote-count">{voteCount}</span>
              </button>
              <div className="yt-vote-divider"></div>
              <button 
                className={`yt-vote-btn down ${voteStatus === 'down' ? 'active' : ''}`} 
                onClick={handleDownvote}
              >
                <ThumbsDown size={16} className={voteStatus === 'down' ? 'fill-icon' : ''} />
                <span className="yt-vote-count">{downvoteCount}</span>
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

          {/* Main Comment Input */}
          <div className="pdm-main-comment-input">
            <img src="https://i.pravatar.cc/150?u=current_user" alt="You" className="modal-comment-avatar" />
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
                <CommentNode key={comment.id} comment={comment} />
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
