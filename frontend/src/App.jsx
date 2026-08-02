import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainFeed from './components/MainFeed';
import RightSidebar from './components/RightSidebar';
import Auth from './components/Auth';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import BottomNav from './components/BottomNav';
import CreateThreadModal from './components/CreateThreadModal';
import EditThreadModal from './components/EditThreadModal';
import BookmarksPage from './components/BookmarksPage';
import MyThreadsPage from './components/MyThreadsPage';
import CategoriesPage from './components/CategoriesPage';
import CreatorsPage from './components/CreatorsPage';
import ProfilePage from './components/ProfilePage';
import FollowingPage from './components/FollowingPage';
import { ModalProvider } from './context/ModalContext';
import { BookmarksProvider } from './context/BookmarksContext';
import { PostsProvider } from './context/PostsContext';
import { NotificationsProvider } from './context/NotificationsContext';
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
          <NotificationsProvider>
            <ModalProvider>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<MainFeed />} />
                  <Route path="creators" element={<CreatorsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="category/:categoryId" element={<MainFeed />} />
                  <Route path="bookmarks" element={<BookmarksPage />} />
                  <Route path="my-threads" element={<MyThreadsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="following" element={<FollowingPage />} />
                </Route>
                <Route path="/auth" element={<Auth />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
              </Routes>
              <CreateThreadModal />
              <EditThreadModal />
            </ModalProvider>
          </NotificationsProvider>
        </PostsProvider>
      </BookmarksProvider>
    </Router>
  );
}

export default App;
