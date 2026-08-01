import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Shield, Star, Users, Terminal } from 'lucide-react';
import { useModal } from '../context/ModalContext';
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
          <li className="contributor-item">
            <img src="https://i.pravatar.cc/150?u=1" alt="User" className="avatar" />
            <div className="contributor-info">
              <h4>mister_riduro</h4>
              <p>2.4K points</p>
            </div>
            <div className="rank gold"><Star size={14} /></div>
          </li>
          <li className="contributor-item">
            <img src="https://i.pravatar.cc/150?u=2" alt="User" className="avatar" />
            <div className="contributor-info">
              <h4>code_queen</h4>
              <p>1.8K points</p>
            </div>
            <div className="rank silver"><Star size={14} /></div>
          </li>
          <li className="contributor-item">
            <img src="https://i.pravatar.cc/150?u=3" alt="User" className="avatar" />
            <div className="contributor-info">
              <h4>focus_master</h4>
              <p>1.2K points</p>
            </div>
            <div className="rank bronze"><Star size={14} /></div>
          </li>
          <li className="contributor-item">
            <img src="https://i.pravatar.cc/150?u=4" alt="User" className="avatar" />
            <div className="contributor-info">
              <h4>ai_thinker</h4>
              <p>980 points</p>
            </div>
            <div className="rank normal">4</div>
          </li>
          <li className="contributor-item">
            <img src="https://i.pravatar.cc/150?u=5" alt="User" className="avatar" />
            <div className="contributor-info">
              <h4>design_guru</h4>
              <p>740 points</p>
            </div>
            <div className="rank normal">5</div>
          </li>
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
