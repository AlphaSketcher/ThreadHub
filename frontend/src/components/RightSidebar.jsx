import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Shield, Star, Users, Terminal } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { usePosts } from '../context/PostsContext';
import './RightSidebar.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const RightSidebar = () => {
  const { openCreateThread } = useModal();
  const { posts } = usePosts();

  // Dynamically calculate Top Contributors
  const contributorStats = {};
  posts.forEach(post => {
    if (!contributorStats[post.author]) {
      contributorStats[post.author] = {
        name: post.author,
        avatar: post.avatar,
        points: 0
      };
    }
    // Let's say a post is worth 50 points, upvotes are 10 points
    const upvotes = post.upvotes ? post.upvotes.length : 0;
    contributorStats[post.author].points += 50 + (upvotes * 10);
    // Keep the latest avatar
    if (post.avatar) contributorStats[post.author].avatar = post.avatar;
  });

  const topContributors = Object.values(contributorStats)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  return (
    <motion.aside 
      className="right-sidebar"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="widget" style={{marginTop: '0'}}>
        <div className="widget-header">
          <h3>Top Contributors</h3>
          <span className="view-all">View all</span>
        </div>
        <ul className="contributor-list">
          {topContributors.length > 0 ? topContributors.map((user, index) => {
            const isGold = index === 0;
            const isSilver = index === 1;
            const isBronze = index === 2;
            const rankClass = isGold ? 'gold' : isSilver ? 'silver' : isBronze ? 'bronze' : 'normal';

            return (
              <li key={user.name} className="contributor-item">
                <img src={user.avatar || "https://www.gravatar.com/avatar/0?d=mp"} alt={user.name} className="avatar" />
                <div className="contributor-info">
                  <h4>{user.name}</h4>
                  <p>{user.points >= 1000 ? (user.points / 1000).toFixed(1) + 'K' : user.points} points</p>
                </div>
                <div className={`rank ${rankClass}`}>
                  {index < 3 ? <Star size={14} /> : index + 1}
                </div>
              </li>
            );
          }) : (
            <li className="contributor-item" style={{justifyContent: 'center', opacity: 0.7}}>
              <p>No contributors yet.</p>
            </li>
          )}
        </ul>
      </motion.div>

      <motion.div variants={itemVariants} className="widget">
        <div className="widget-header">
          <h3><Star size={16} color="#ef4444" style={{display:'inline', marginRight: '4px'}}/> Trending Topics</h3>
          <span className="view-all">View all</span>
        </div>
        <ul className="trending-list">
          <li className="trending-item">
            <span className="index">1</span>
            <span className="topic-name">COVID-19</span>
            <span className="trend-count up">&uarr; 1.2K</span>
          </li>
          <li className="trending-item">
            <span className="index">2</span>
            <span className="topic-name">DangMemesAreTheBest</span>
            <span className="trend-count up">&uarr; 980</span>
          </li>
          <li className="trending-item">
            <span className="index">3</span>
            <span className="topic-name">AlwaysWannaFly the Best</span>
            <span className="trend-count up">&uarr; 743</span>
          </li>
          <li className="trending-item">
            <span className="index">4</span>
            <span className="topic-name">HelloWelloAlloMelloCello</span>
            <span className="trend-count up">&uarr; 612</span>
          </li>
          <li className="trending-item">
            <span className="index">5</span>
            <span className="topic-name">2024 Tech Predictions</span>
            <span className="trend-count up">&uarr; 501</span>
          </li>
        </ul>
      </motion.div>

      <motion.div variants={itemVariants} className="widget">
        <div className="widget-header">
          <h3>Suggested Communities</h3>
          <span className="view-all">View all</span>
        </div>
        <ul className="community-list">
          <li className="community-item">
            <div className="comm-icon bg-blue"><Terminal size={16} /></div>
            <div className="comm-info">
              <h4>Java Developers</h4>
              <p>12.3K members</p>
            </div>
            <button className="btn-join">Join</button>
          </li>
          <li className="community-item">
            <div className="comm-icon bg-green"><Shield size={16} /></div>
            <div className="comm-info">
              <h4>Cyber Security</h4>
              <p>8.1K members</p>
            </div>
            <button className="btn-join">Join</button>
          </li>
          <li className="community-item">
            <div className="comm-icon bg-purple"><Users size={16} /></div>
            <div className="comm-info">
              <h4>UI/UX Designers</h4>
              <p>6.7K members</p>
            </div>
            <button className="btn-join">Join</button>
          </li>
        </ul>
      </motion.div>
    </motion.aside>
  );
};

export default RightSidebar;
