import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, ArrowRight } from 'lucide-react';
import { usePosts } from '../context/PostsContext';
import './CreatorsPage.css';

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

const CreatorsPage = () => {
  const { posts } = usePosts();

  const topContributors = useMemo(() => {
    const contributorStats = {};
    posts.forEach(post => {
      if (!contributorStats[post.author]) {
        contributorStats[post.author] = {
          name: post.author,
          avatar: post.avatar,
          points: 0,
          postCount: 0
        };
      }
      const upvotes = post.upvotes ? post.upvotes.length : 0;
      contributorStats[post.author].points += 50 + (upvotes * 10);
      contributorStats[post.author].postCount += 1;
      if (post.avatar) contributorStats[post.author].avatar = post.avatar;
    });

    return Object.values(contributorStats)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5); // Top 5
  }, [posts]);

  return (
    <div className="creators-page">
      <div className="creators-header">
        <div className="trophy-icon-wrapper">
          <Trophy size={32} color="#f59e0b" />
        </div>
        <h1>Top Creators</h1>
        <p>The most active voices shaping our community</p>
      </div>

      <motion.div 
        className="creators-list"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {topContributors.length > 0 ? topContributors.map((user, index) => {
          const isGold = index === 0;
          const isSilver = index === 1;
          const isBronze = index === 2;
          const rankClass = isGold ? 'gold' : isSilver ? 'silver' : isBronze ? 'bronze' : 'normal';

          return (
            <motion.div 
              key={user.name} 
              className={`creator-card rank-${rankClass}`}
              variants={itemVariants}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="creator-rank-badge">
                {index < 3 ? <Star size={16} /> : `#${index + 1}`}
              </div>
              
              <div className="creator-card-content">
                <img src={user.avatar || "https://www.gravatar.com/avatar/0?d=mp"} alt={user.name} className="creator-avatar" />
                <div className="creator-info">
                  <h3>{user.name}</h3>
                  <span className="creator-stats">
                    {user.postCount} post{user.postCount !== 1 ? 's' : ''} • {user.points >= 1000 ? (user.points / 1000).toFixed(1) + 'K' : user.points} points
                  </span>
                </div>
              </div>
              <ArrowRight className="creator-chevron" size={20} />
            </motion.div>
          );
        }) : (
          <div className="empty-creators">
            <p>No creators yet.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CreatorsPage;
