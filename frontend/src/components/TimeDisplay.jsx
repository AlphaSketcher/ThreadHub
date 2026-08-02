import React, { useState, useEffect } from 'react';

const timeAgo = (dateInput) => {
  if (!dateInput) return "Just now";
  
  let date;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return dateInput; 

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) {
    return seconds < 5 ? 'Just now' : `${Math.floor(seconds)} seconds ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  if (days < 14) {
    return 'Last week';
  }
  
  return date.toLocaleDateString();
};

const TimeDisplay = ({ timestamp }) => {
  const [displayTime, setDisplayTime] = useState(timeAgo(timestamp));

  useEffect(() => {
    if (typeof timestamp === 'string' && !timestamp.includes('-') && !timestamp.includes(':')) {
      setDisplayTime(timestamp);
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime(timeAgo(timestamp));
    }, 60000);

    setDisplayTime(timeAgo(timestamp));

    return () => clearInterval(interval);
  }, [timestamp]);

  return <span>{displayTime}</span>;
};

export default TimeDisplay;
