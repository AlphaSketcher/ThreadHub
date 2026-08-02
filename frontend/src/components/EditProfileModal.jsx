import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, MapPin, FileText, Loader2 } from 'lucide-react';
import { API_URL } from '../services/api';
import './EditProfileModal.css';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 400; // Profile pictures don't need to be huge

          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress significantly to fit within standard database TEXT columns (64KB)
          const base64Data = canvas.toDataURL('image/jpeg', 0.8);
          setProfileImage(base64Data);
          setIsUploading(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio,
          location,
          profileImage
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedUser = await response.json();
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      
      // Notify parent
      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div 
          className="modal-container edit-profile-modal"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Edit Profile</h2>
            <button className="close-btn" onClick={onClose} disabled={isSaving}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="modal-body">
            
            {/* Avatar Upload Section */}
            <div className="avatar-upload-section">
              <div className="avatar-preview-container">
                <img 
                  src={profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                  alt="Avatar preview" 
                  className="avatar-preview" 
                />
                <div 
                  className={`avatar-upload-overlay ${isUploading ? 'uploading' : ''}`}
                  onClick={() => !isUploading && fileInputRef.current.click()}
                >
                  {isUploading ? <Loader2 size={24} className="spin" /> : <Camera size={24} />}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <p className="upload-hint">Click to change profile picture (Max 5MB)</p>
            </div>

            <div className="form-group">
              <label><FileText size={16} /> Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
                rows={3}
                maxLength={160}
              />
              <span className="char-count">{bio.length}/160</span>
            </div>

            <div className="form-group">
              <label><MapPin size={16} /> Location</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                maxLength={30}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSaving || isUploading}>
                {isSaving ? <><Loader2 size={16} className="spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfileModal;
