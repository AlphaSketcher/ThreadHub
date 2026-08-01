import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);

  const openCreateThread = () => setIsCreateThreadOpen(true);
  const closeCreateThread = () => setIsCreateThreadOpen(false);

  return (
    <ModalContext.Provider value={{ isCreateThreadOpen, openCreateThread, closeCreateThread }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
