import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePosts } from '../context/PostsContext';
import PostItem from './PostItem';
import PostDetailsModal from './PostDetailsModal';
import { PenTool, MessageSquare, Plus } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import './MyThreadsPage.css';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { staggerChildren: 0.1, delayChildren: 0.1, ease: 'easeOut', duration: 0.4 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const MyThreadsPage = () => {
  const { posts } = usePosts();
  const { openCreateThread } = useModal();
  const [selectedPost, setSelectedPost] = React.useState(null);

  // Parse current user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentUsername = user?.username || "guest_user";

  // Filter posts created by the current user
  const myThreads = posts.filter(post => post.author === currentUsername);

  const openPostModal = (post) => setSelectedPost(post);
  const closePostModal = () => setSelectedPost(null);

  return (
    <motion.main 
      className="my-threads-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="page-header">
        <div>
          <h1 className="page-title">My Threads</h1>
          <p className="page-subtitle">Manage and track your ongoing discussions.</p>
        </div>
        <button className="btn-primary create-new-btn" onClick={openCreateThread}>
          <Plus size={16} /> New Thread
        </button>
      </div>

      <div className="threads-container">
        {myThreads.length > 0 ? (
          <div className="post-list">
            {myThreads.map((post) => (
              <motion.div key={post.id} variants={itemVariants}>
                <PostItem 
                  post={post} 
                  onOpenModal={() => openPostModal(post)} 
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div variants={itemVariants} className="empty-state">
            <div className="empty-state-icon">
              <PenTool size={48} />
            </div>
            <h2>You haven't posted anything yet!</h2>
            <p>Start a conversation, share your thoughts, and connect with the community.</p>
            <button className="btn-primary mt-4" onClick={openCreateThread}>
              <MessageSquare size={16} />
              Start Your First Thread
            </button>
          </motion.div>
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

export default MyThreadsPage;
