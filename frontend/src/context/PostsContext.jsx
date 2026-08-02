import React, { createContext, useContext, useState, useEffect } from 'react';
import { postService } from '../services/api';

const PostsContext = createContext();

export const usePosts = () => {
  return useContext(PostsContext);
};

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await postService.fetchPosts();
        if (data && data.length > 0) {
          setPosts(data);
        } else {
          setPosts(initialPostsData); // Fallback to dummy data if DB is empty
        }
      } catch (err) {
        console.error("Failed to load posts from API, falling back to dummy data", err);
        setPosts(initialPostsData);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const addPost = async (newPost) => {
    try {
      // Optimistic UI update
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // Save to backend - remove the temporary ID so Postgres can generate one
      const postToSave = { ...newPost };
      delete postToSave.id;
      const savedPost = await postService.createPost(postToSave);
      
      // Update with the real ID from the backend
      setPosts(prevPosts => prevPosts.map(p => 
        p.id === newPost.id ? savedPost : p
      ));
    } catch (err) {
      console.error("Failed to save post to backend", err);
      // We might want to remove it from UI if it failed, but keeping it simple for now
    }
  };

  const updatePost = (id, updatedData) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === id ? { ...post, ...updatedData } : post
    ));
  };

  const toggleVote = (id, username, type) => {
    let wasAdded = false;
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id !== id) return post;
      
      let upvotes = post.upvotes || [];
      let downvotes = post.downvotes || [];

      if (type === 'up') {
        if (upvotes.includes(username)) {
          // Remove upvote
          upvotes = upvotes.filter(u => u !== username);
        } else {
          // Add upvote, remove downvote if exists
          upvotes = [...upvotes, username];
          downvotes = downvotes.filter(u => u !== username);
          wasAdded = true;
        }
      } else if (type === 'down') {
        if (downvotes.includes(username)) {
          // Remove downvote
          downvotes = downvotes.filter(u => u !== username);
        } else {
          // Add downvote, remove upvote if exists
          downvotes = [...downvotes, username];
          upvotes = upvotes.filter(u => u !== username);
          wasAdded = true;
        }
      }

      return { ...post, upvotes, downvotes };
    }));
    return wasAdded;
  };

  // Helper to recursively find and update a comment
  const recursivelyUpdateComment = (comments, commentId, updateFn) => {
    if (!comments) return [];
    return comments.map(comment => {
      if (comment.id === commentId) {
        return updateFn(comment);
      }
      if (comment.replies && comment.replies.length > 0) {
        return { ...comment, replies: recursivelyUpdateComment(comment.replies, commentId, updateFn) };
      }
      return comment;
    });
  };

  const addComment = (postId, parentCommentId, newCommentData) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id !== postId) return post;
      
      const newComment = {
        id: Date.now(), // Generate a unique ID
        ...newCommentData,
        helpfulVotes: [],
        notHelpfulVotes: [],
        helpfulCount: 0,
        notHelpfulCount: 0,
        replies: []
      };

      if (!parentCommentId) {
        // Top-level comment
        return { 
          ...post, 
          comments: [...(post.comments || []), newComment],
          discussCount: (post.discussCount || 0) + 1
        };
      }

      // Nested reply
      const updatedComments = recursivelyUpdateComment(post.comments, parentCommentId, (parentComment) => {
        return { ...parentComment, replies: [...(parentComment.replies || []), newComment] };
      });

      return { 
        ...post, 
        comments: updatedComments,
        discussCount: (post.discussCount || 0) + 1
      };
    }));
  };

  const voteComment = (postId, commentId, username, type) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id !== postId) return post;

      const updatedComments = recursivelyUpdateComment(post.comments, commentId, (comment) => {
        let helpfulVotes = comment.helpfulVotes || [];
        let notHelpfulVotes = comment.notHelpfulVotes || [];

        if (type === 'helpful') {
          if (helpfulVotes.includes(username)) {
            helpfulVotes = helpfulVotes.filter(u => u !== username);
          } else {
            helpfulVotes = [...helpfulVotes, username];
            notHelpfulVotes = notHelpfulVotes.filter(u => u !== username);
          }
        } else if (type === 'not-helpful') {
          if (notHelpfulVotes.includes(username)) {
            notHelpfulVotes = notHelpfulVotes.filter(u => u !== username);
          } else {
            notHelpfulVotes = [...notHelpfulVotes, username];
            helpfulVotes = helpfulVotes.filter(u => u !== username);
          }
        }

        return { ...comment, helpfulVotes, notHelpfulVotes };
      });

      return { ...post, comments: updatedComments };
    }));
  };

  const deletePost = (id) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
  };

  return (
    <PostsContext.Provider value={{ posts, setPosts, addPost, updatePost, deletePost, toggleVote, addComment, voteComment }}>
      {children}
    </PostsContext.Provider>
  );
};

const initialPostsData = [
  {
    id: 1,
    author: "mister_riduro",
    avatar: "https://i.pravatar.cc/150?u=1",
    verified: true,
    time: "3h ago",
    category: "Technology",
    categoryColor: { bg: "#ede9fe", text: "#7c3aed" },
    title: "Can we survive this pandemic?",
    hasShield: true,
    snippet: "This coronavirus or covid-19 has been a really terrifying ghost for everybody in the world for this 6 months. The outbreak was started in Wuhan at January, and till now we are still in the middle of it.",
    images: ["https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=1000&auto=format&fit=crop"],
    tags: ["Pandemic", "COVID-19", "Health", "Global"],
    initialVoteCount: 32,
    initialDownvoteCount: 7,
    upvotes: [],
    downvotes: [],
    discussCount: 128,
    hasComment: true,
    comments: [
      {
        id: 101,
        author: "code_queen",
        avatar: "https://i.pravatar.cc/150?u=2",
        time: "2h ago",
        text: "Great points! Stay safe everyone. It's really important that we keep our masks on.",
        helpfulCount: 15,
        notHelpfulCount: 2,
        replies: [
          {
            id: 102,
            author: "health_nut",
            avatar: "https://i.pravatar.cc/150?u=8",
            time: "1h ago",
            text: "Absolutely. I've been double masking when I go to crowded places.",
            helpfulCount: 8,
            notHelpfulCount: 0,
            replies: [
              {
                id: 103,
                author: "skeptic_pete",
                avatar: "https://i.pravatar.cc/150?u=9",
                time: "45m ago",
                text: "Isn't double masking a bit overkill though?",
                helpfulCount: 2,
                notHelpfulCount: 12,
                replies: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 3,
    author: "design_guru",
    avatar: "https://i.pravatar.cc/150?u=4",
    verified: true,
    time: "4h ago",
    category: "Design",
    categoryColor: { bg: "#fce7f3", text: "#db2777" },
    title: "My latest UI exploration for a modern dashboard",
    hasShield: false,
    snippet: "Spent the weekend playing around with glassmorphism and soft shadows. What do you think of this layout? The multi-image grid is finally coming together nicely!",
    images: [
      "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop"
    ],
    tags: ["UI/UX", "Dashboard", "Design", "Glassmorphism"],
    initialVoteCount: 156,
    initialDownvoteCount: 3,
    upvotes: [],
    downvotes: [],
    discussCount: 89,
    hasComment: true,
    comments: [
      {
        id: 201,
        author: "pixel_pusher",
        avatar: "https://i.pravatar.cc/150?u=12",
        time: "3h ago",
        text: "The glassmorphism effect is super clean! What CSS blur values did you use?",
        helpfulCount: 24,
        notHelpfulCount: 0,
        replies: []
      }
    ]
  },
  {
    id: 2,
    author: "ai_thinker",
    avatar: "https://i.pravatar.cc/150?u=3",
    verified: true,
    time: "5h ago",
    category: "Programming",
    categoryColor: { bg: "#e0f2fe", text: "#0284c7" },
    title: "Best programming languages to learn in 2024",
    hasShield: false,
    snippet: "As a beginner developer, I'm confused about which programming language to start with. What do you guys recommend and why?",
    images: [],
    tags: [],
    initialVoteCount: 24,
    initialDownvoteCount: 2,
    upvotes: [],
    downvotes: [],
    discussCount: 42,
    hasComment: false,
    comments: []
  }
];
