import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Terminal, Microscope, Coffee, BookOpen, Gamepad2, ChevronRight, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePosts } from '../context/PostsContext';
import './CategoriesPage.css';

const categoriesData = [
  { id: 'Technology', name: 'Technology', icon: Code, colorClass: 'tech' },
  { id: 'Programming', name: 'Programming', icon: Terminal, colorClass: 'prog' },
  { id: 'Science', name: 'Science', icon: Microscope, colorClass: 'sci' },
  { id: 'Lifestyle', name: 'Lifestyle', icon: Coffee, colorClass: 'life' },
  { id: 'Education', name: 'Education', icon: BookOpen, colorClass: 'edu' },
  { id: 'Gaming', name: 'Gaming', icon: Gamepad2, colorClass: 'game' },
  { id: 'Others', name: 'Others', icon: Hash, colorClass: 'others' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { posts } = usePosts();

  const getPostCount = (categoryName) => {
    return posts.filter(p => p.category === categoryName).length;
  };

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Explore Categories</h1>
        <p>Find discussions that matter to you</p>
      </div>

      <motion.div 
        className="categories-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {categoriesData.map((cat) => {
          const Icon = cat.icon;
          const count = getPostCount(cat.name);
          return (
            <motion.div 
              key={cat.id} 
              className="category-card"
              variants={itemVariants}
              onClick={() => navigate(`/category/${cat.id.toLowerCase()}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="category-card-content">
                <div className={`cat-icon-large ${cat.colorClass}`}>
                  <Icon size={26} />
                </div>
                <div className="category-info">
                  <h3>{cat.name}</h3>
                  <span className="category-count">{count} post{count !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <ChevronRight className="category-chevron" size={20} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default CategoriesPage;
