import React, { createContext, useContext, useState } from 'react';

const PostsContext = createContext();

export const usePosts = () => {
  return useContext(PostsContext);
};

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState(initialPostsData);

  const addPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <PostsContext.Provider value={{ posts, addPost }}>
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
    discussCount: 42,
    hasComment: false,
    comments: []
  }
];
