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

  // Preview State
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Poll State
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollLength, setPollLength] = useState('1 day');

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
      const selectedFiles = files.slice(0, 4 - mediaPreviews.length);
      
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_DIM = 800;

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
            
            const base64Data = canvas.toDataURL('image/jpeg', 0.7);
            setMediaPreviews(prev => [...prev, base64Data]);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = null;
  };

  const removeMedia = (indexToRemove) => {
    setMediaPreviews(prev => {
      const newPreviews = [...prev];
      if (newPreviews[indexToRemove].startsWith('blob:')) {
        URL.revokeObjectURL(newPreviews[indexToRemove]);
      }
      newPreviews.splice(indexToRemove, 1);
      return newPreviews;
    });
  };

  const handlePostSubmit = () => {
    let finalContent = postContent;
    
    if (isPollOpen) {
      const validOptions = pollOptions.filter(opt => opt.trim() !== '');
      if (validOptions.length >= 2) {
        finalContent += '\n\n**Poll:**\n' + validOptions.map(opt => `- [ ] ${opt}`).join('\n');
        finalContent += `\n_Ends in ${pollLength}_`;
      }
    }

    if (!title.trim() || (!finalContent.trim() && mediaPreviews.length === 0) || !selectedCategory) {
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
      snippet: finalContent,
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
    setIsPollOpen(false);
    setPollOptions(['', '']);
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
            {isPreviewMode ? (
              <div className="preview-mode-container">
                <div className="preview-mode-header">
                  <h3>Preview</h3>
                </div>
                <div className="preview-content">
                  <h3 className="preview-title">{title || 'Untitled Thread'}</h3>
                  <p className="preview-text">{postContent || 'No content provided.'}</p>
                  {mediaPreviews.length > 0 && (
                    <div className={`media-preview-grid preview-count-${mediaPreviews.length}`}>
                      {mediaPreviews.map((url, idx) => (
                        <div key={idx} className="media-preview-item">
                          <img src={url} alt={`Upload Preview ${idx + 1}`} className="media-preview-img" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
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

                  {/* Poll Builder UI */}
                  {isPollOpen && (
                    <div className="poll-builder-container">
                      <div className="poll-inputs">
                        {pollOptions.map((opt, idx) => (
                          <div key={idx} className="poll-input-wrapper">
                            <input
                              type="text"
                              className="poll-input"
                              placeholder={`Choice ${idx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...pollOptions];
                                newOpts[idx] = e.target.value;
                                setPollOptions(newOpts);
                              }}
                              maxLength={25}
                            />
                            {idx >= 2 && (
                              <button 
                                className="poll-remove-opt-btn"
                                onClick={() => {
                                  const newOpts = pollOptions.filter((_, i) => i !== idx);
                                  setPollOptions(newOpts);
                                }}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="poll-actions">
                        {pollOptions.length < 4 && (
                          <button className="poll-add-btn" onClick={() => setPollOptions([...pollOptions, ''])}>
                            + Add choice
                          </button>
                        )}
                        <div className="poll-length-selector">
                          <span>Poll length:</span>
                          <select value={pollLength} onChange={e => setPollLength(e.target.value)} className="poll-select">
                            <option value="1 hour">1 hour</option>
                            <option value="12 hours">12 hours</option>
                            <option value="1 day">1 day</option>
                            <option value="3 days">3 days</option>
                            <option value="7 days">7 days</option>
                          </select>
                        </div>
                      </div>
                      <button className="poll-remove-btn" onClick={() => { setIsPollOpen(false); setPollOptions(['', '']); }}>
                        Remove poll
                      </button>
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
                      <button className={`x-icon-btn ${isPollOpen ? 'active' : ''}`} title="Poll" onClick={() => setIsPollOpen(!isPollOpen)}>
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
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary btn-attachment" onClick={() => fileInputRef.current?.click()}>
            <Paperclip size={16} />
            <span className="hide-on-mobile">Add Attachments</span>
          </button>
          
          <div className="footer-right-actions">
            <button className={`btn-secondary btn-preview ${isPreviewMode ? 'active' : ''}`} onClick={() => setIsPreviewMode(!isPreviewMode)}>
              {isPreviewMode ? <Edit2 size={16} /> : <Eye size={16} />}
              <span className="hide-on-mobile">{isPreviewMode ? 'Edit' : 'Preview'}</span>
            </button>
            <button className="btn-primary btn-post" onClick={handlePostSubmit}>
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
