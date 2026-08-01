import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const [isEditThreadOpen, setIsEditThreadOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  const openCreateThread = () => setIsCreateThreadOpen(true);
  const closeCreateThread = () => setIsCreateThreadOpen(false);

  const openEditThread = (post) => {
    setPostToEdit(post);
    setIsEditThreadOpen(true);
  };
  const closeEditThread = () => {
    setPostToEdit(null);
    setIsEditThreadOpen(false);
  };

  return (
    <ModalContext.Provider value={{ 
      isCreateThreadOpen, 
      openCreateThread, 
      closeCreateThread,
      isEditThreadOpen,
      postToEdit,
      openEditThread,
      closeEditThread
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
