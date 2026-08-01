import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainFeed from './components/MainFeed';
import RightSidebar from './components/RightSidebar';
import Auth from './components/Auth';
import BottomNav from './components/BottomNav';
import CreateThreadModal from './components/CreateThreadModal';
import BookmarksPage from './components/BookmarksPage';
import { ModalProvider } from './context/ModalContext';
import { BookmarksProvider } from './context/BookmarksContext';
import { PostsProvider } from './context/PostsContext';
import './App.css';

const MainLayout = () => (
  <div className="app-container">
    <Sidebar />
    <div className="main-layout">
      <Header />
      <div className="content-area">
        <Outlet />
        <RightSidebar />
      </div>
    </div>
    <BottomNav />
    <CreateThreadModal />
  </div>
);

function App() {
  return (
    <Router>
      <BookmarksProvider>
        <PostsProvider>
          <ModalProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<MainFeed />} />
                <Route path="bookmarks" element={<BookmarksPage />} />
              </Route>
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </ModalProvider>
        </PostsProvider>
      </BookmarksProvider>
    </Router>
  );
}

export default App;
