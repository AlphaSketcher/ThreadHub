import React, { useState, useRef } from 'react';
import { 
  X, Edit3, Folder, LayoutGrid, ChevronDown, Type, Edit2, 
  Image as ImageIcon, Smile, List, Calendar, MapPin, 
  Settings, ChevronUp, Paperclip, Eye, Send 
} from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { usePosts } from '../context/PostsContext';
import './CreateThreadModal.css';

const CreateThreadModal = () => {
  const { isCreateThreadOpen, closeCreateThread } = useModal();
  const { addPost } = usePosts();

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [mediaPreviews, setMediaPreviews] = useState([]);
  
  // Scheduling State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Get user for avatar
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const categories = [
    'Technology',
    'Programming',
    'Science',
    'Lifestyle',
    'Education',
    'Gaming',
    'Others'
  ];

  const handleTextareaChange = (e) => {
    setPostContent(e.target.value);
    
    // Auto-resize logic
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const insertAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + textToInsert + text.substring(end);
    setPostContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
      
      // trigger resize
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, 0);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 4 images
      const newPreviews = files
        .slice(0, 4 - mediaPreviews.length)
        .map(file => URL.createObjectURL(file));
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
    // reset input so the same files can be selected again if needed
    e.target.value = null;
  };

  const removeMedia = (indexToRemove) => {
    setMediaPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[indexToRemove]);
      newPreviews.splice(indexToRemove, 1);
      return newPreviews;
    });
  };

  const handlePostSubmit = () => {
    if (!title.trim() || !postContent.trim() || !selectedCategory) {
      alert("Please fill in the title, category, and content.");
      return;
    }

    const categoryColors = {
      'Technology': { bg: "#ede9fe", text: "#7c3aed" },
      'Programming': { bg: "#e0f2fe", text: "#0284c7" },
      'Science': { bg: "#dcfce7", text: "#16a34a" },
      'Lifestyle': { bg: "#fef9c3", text: "#ca8a04" },
      'Education': { bg: "#ffedd5", text: "#ea580c" },
      'Gaming': { bg: "#fce7f3", text: "#db2777" },
      'Others': { bg: "#f1f5f9", text: "#475569" }
    };

    const newPost = {
      id: Date.now(),
      author: user?.username || "guest_user",
      avatar: user?.profileImage || "https://i.pravatar.cc/150?u=current",
      verified: false,
      time: "Just now",
      category: selectedCategory,
      categoryColor: categoryColors[selectedCategory] || { bg: "#f1f5f9", text: "#475569" },
      title: title,
      hasShield: false,
      snippet: postContent,
      images: mediaPreviews,
      tags: [],
      initialVoteCount: 0,
      initialDownvoteCount: 0,
      discussCount: 0,
      hasComment: false,
      comments: []
    };

    addPost(newPost);
    closeCreateThread();
    
    // Clear form for next time
    setTitle('');
    setPostContent('');
    setSelectedCategory('');
    setMediaPreviews([]);
  };

  const isScheduled = scheduleDate && scheduleTime;

  if (!isCreateThreadOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeCreateThread}>
      <div className="modal-container" onClick={e => { e.stopPropagation(); setIsCategoryOpen(false); }}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon-bg">
              <Edit3 size={24} className="modal-header-icon" />
            </div>
            <div>
              <h2 className="modal-title">Create Thread</h2>
              <p className="modal-subtitle">Share ideas. Ask questions. Start conversations.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={closeCreateThread}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="modal-body">
          {/* Category */}
          <div className="form-group">
            <label className="form-label">
              <Folder size={16} />
              Category
            </label>
            <div className="custom-select-container" onClick={e => e.stopPropagation()}>
              <div 
                className={`custom-select ${isCategoryOpen ? 'open' : ''}`}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                <div className="select-left">
                  <LayoutGrid size={18} className="select-icon" />
                  <span className={selectedCategory ? 'selected-text' : ''}>
                    {selectedCategory || 'Select a category...'}
                  </span>
                </div>
                <ChevronDown size={18} className={`select-arrow ${isCategoryOpen ? 'rotated' : ''}`} />
              </div>
              
              {isCategoryOpen && (
                <div className="select-dropdown">
                  {categories.map((cat, idx) => (
                    <div 
                      key={idx} 
                      className={`select-option ${selectedCategory === cat ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Thread Title */}
          <div className="form-group">
            <label className="form-label">
              <Type size={16} />
              Thread Title
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter a clear and catchy title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* X-Style Write Post Section */}
          <div className="form-group" style={{marginTop: '0.5rem'}}>
            <div className="x-editor-container">
              <div className="x-editor-left">
                <div className="x-avatar">
                  <img 
                    src={user?.profileImage || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                    alt="Profile" 
                  />
                </div>
              </div>
              <div className="x-editor-right">
                <textarea 
                  ref={textareaRef}
                  className="x-textarea" 
                  placeholder="What's happening?"
                  value={postContent}
                  onChange={handleTextareaChange}
                  rows={3}
                ></textarea>
                
                {mediaPreviews.length > 0 && (
                  <div className={`media-preview-grid preview-count-${mediaPreviews.length}`}>
                    {mediaPreviews.map((url, idx) => (
                      <div key={idx} className="media-preview-item">
                        <img src={url} alt={`Upload Preview ${idx + 1}`} className="media-preview-img" />
                        <button className="remove-media-btn" onClick={() => removeMedia(idx)} title="Remove image">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scheduling UI */}
                {isScheduleOpen && (
                  <div className="schedule-panel">
                    <div className="schedule-panel-header">
                      <div className="schedule-panel-title">
                        <Calendar size={16} />
                        <span>Schedule Post</span>
                      </div>
                      <button className="schedule-close-btn" onClick={() => setIsScheduleOpen(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    <div className="schedule-inputs">
                      <div className="schedule-input-group">
                        <label>Date</label>
                        <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                      </div>
                      <div className="schedule-input-group">
                        <label>Time</label>
                        <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                      </div>
                    </div>
                    <div className="schedule-actions">
                      <button className="schedule-clear-btn" onClick={() => { setScheduleDate(''); setScheduleTime(''); setIsScheduleOpen(false); }}>Clear</button>
                      <button className="schedule-confirm-btn" onClick={() => setIsScheduleOpen(false)}>Confirm</button>
                    </div>
                  </div>
                )}
                
                {(isScheduled && !isScheduleOpen) && (
                  <div className="scheduled-indicator">
                    <Calendar size={14} />
                    <span>Will send on {scheduleDate} at {scheduleTime}</span>
                    <button className="scheduled-clear" onClick={() => { setScheduleDate(''); setScheduleTime(''); }}>Clear</button>
                  </div>
                )}
                
                <div className="x-toolbar">
                  <div className="x-toolbar-left">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleImageUpload}
                    />
                    <button className="x-icon-btn" title="Media" onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon size={18} />
                    </button>
                    <button className="x-icon-btn gif-btn" title="GIF" onClick={() => insertAtCursor('![GIF](gif_url)')}>
                      <span style={{fontSize: '10px', fontWeight: 'bold', border: '1px solid currentColor', borderRadius: '4px', padding: '0 2px'}}>GIF</span>
                    </button>
                    <button className="x-icon-btn" title="Poll" onClick={() => insertAtCursor('\n- [ ] Option 1\n- [ ] Option 2\n')}>
                      <List size={18} />
                    </button>
                    <button className="x-icon-btn" onClick={() => insertAtCursor('😀')} title="Emoji">
                      <Smile size={18} />
                    </button>
                    <button className={`x-icon-btn ${isScheduleOpen || isScheduled ? 'active' : ''}`} title="Schedule" onClick={() => setIsScheduleOpen(!isScheduleOpen)}>
                      <Calendar size={18} />
                    </button>
                    <button className="x-icon-btn" title="Location" onClick={() => insertAtCursor(' [📍 Location] ')}>
                      <MapPin size={18} />
                    </button>
                  </div>
                  <div className="x-toolbar-right">
                    {/* Removed character limit ring */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thread Options Accordion */}
          <div className="thread-options-container">
            <div className="thread-options-header">
              <div className="thread-options-title">
                <Settings size={16} />
                <span>Thread Options</span>
              </div>
              <ChevronUp size={18} className="thread-options-arrow" />
            </div>
            <div className="thread-options-body">
              <div className="options-grid">
                
                <div className="option-item">
                  <div className="toggle-switch active">
                    <div className="toggle-knob"></div>
                  </div>
                  <div className="option-text">
                    <span className="option-label">Allow replies</span>
                    <span className="option-desc">Let others comment on this thread</span>
                  </div>
                </div>
                
                <div className="option-item">
                  <div className="toggle-switch inactive">
                    <div className="toggle-knob"></div>
                  </div>
                  <div className="option-text">
                    <span className="option-label">Pin thread</span>
                    <span className="option-desc">Keep this thread at the top</span>
                  </div>
                </div>
                
                <div className="option-item">
                  <div className="toggle-switch inactive">
                    <div className="toggle-knob"></div>
                  </div>
                  <div className="option-text">
                    <span className="option-label">Mark as question</span>
                    <span className="option-desc">Get answers from the community</span>
                  </div>
                </div>
                
                <div className="option-item">
                  <div className="toggle-switch inactive">
                    <div className="toggle-knob"></div>
                  </div>
                  <div className="option-text">
                    <span className="option-label">Make thread private</span>
                    <span className="option-desc">Only visible to you and selected users</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary">
            <Paperclip size={16} />
            Add Attachments
          </button>
          
          <div className="footer-right-actions">
            <button className="btn-secondary">
              <Eye size={16} />
              Preview
            </button>
            <button className="btn-primary" onClick={handlePostSubmit}>
              {isScheduled ? <Calendar size={16} /> : <Send size={16} />}
              {isScheduled ? 'Schedule' : 'Post Thread'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateThreadModal;
