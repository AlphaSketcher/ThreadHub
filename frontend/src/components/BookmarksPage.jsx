import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarksContext';
import PostItem from './PostItem';
import PostDetailsModal from './PostDetailsModal';
import './BookmarksPage.css';

const BookmarksPage = () => {
  const { savedPosts } = useBookmarks();
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  const openPostModal = (post) => setSelectedPost(post);
  const closePostModal = () => setSelectedPost(null);

  return (
    <motion.div 
      className="bookmarks-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bookmarks-header">
        <Bookmark size={28} className="header-icon" />
        <h1>Your Bookmarks</h1>
      </div>

      {savedPosts.length === 0 ? (
        <motion.div 
          className="empty-bookmarks"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div 
            className="empty-icon-wrapper"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Bookmark size={40} className="empty-bookmark-icon" />
          </motion.div>
          <h2>Nothing saved yet</h2>
          <p>Don't lose track of great conversations. Save posts to read them later.</p>
          <button className="btn-explore" onClick={() => navigate('/')}>
            Explore Posts <ArrowRight size={16} />
          </button>
        </motion.div>
      ) : (
        <div className="post-list">
          <AnimatePresence>
            {savedPosts.map(post => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PostItem post={post} onOpenModal={() => openPostModal(post)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selectedPost && (
          <PostDetailsModal post={selectedPost} onClose={closePostModal} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookmarksPage;
