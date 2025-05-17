import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import '../styles/DevNoticeModal.css';

const DevNoticeModal = ({ isOpen, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const modalRef = useRef(null);
  
  // Define handleClose with useCallback before it's used
  const handleClose = useCallback(() => {
    onClose(dontShowAgain);
  }, [onClose, dontShowAgain]);
  
  // Effect untuk mengatur blur pada app-content dan mengontrol scroll
  useEffect(() => {
    const appContent = document.querySelector('.app-content');
    
    if (isOpen && appContent) {
      // Tambahkan blur dan disable pointer events
      appContent.classList.add('blur-background');
      document.body.style.overflow = 'hidden';
    } else if (appContent) {
      // Kembalikan ke normal
      appContent.classList.remove('blur-background');
      document.body.style.overflow = '';
    }
    
    // Cleanup
    return () => {
      if (appContent) {
        appContent.classList.remove('blur-background');
      }
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Effect untuk menangani klik di luar modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]); 
  
  // Jika tidak open, jangan render apapun
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className="dev-notice-overlay">
      <div className="dev-notice-modal" ref={modalRef}>
        <div className="dev-notice-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <h2>Perhatian</h2>
        </div>
        <div className="dev-notice-content">
          <p>Website <strong>StockAdvice v1.0</strong> masih dalam tahap pengembangan dan perbaikan.</p>
          <p>Beberapa fitur mungkin belum berfungsi dengan sempurna atau masih dalam proses implementasi.</p>
          <p>Terima kasih atas pengertian dan kesabaran Anda.</p>
        </div>

        <div className="dev-notice-checkbox">
          <input 
            type="checkbox" 
            id="dontShowAgain" 
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)} 
          />
          <label htmlFor="dontShowAgain">Jangan tampilkan notifikasi ini lagi</label>
        </div>
        
        <button className="dev-notice-button" onClick={handleClose}>
          Saya Mengerti
        </button>
      </div>
    </div>,
    document.body
  );
};

export default DevNoticeModal;