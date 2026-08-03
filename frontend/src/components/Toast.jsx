import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Toast.css';

const ToastItem = ({ toast, removeToast }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => removeToast(toast.id), 300); // Wait for animation
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, removeToast]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  return (
    <div className={`toast ${toast.type} ${isLeaving ? 'leaving' : ''}`}>
      <span className="toast-message">{toast.message}</span>
      <button onClick={handleClose} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};
