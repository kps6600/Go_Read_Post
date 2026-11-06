import React, { useState, useEffect } from 'react';
import { FileText, Video, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import LiveArticleStudio from './admin/LiveArticleStudio';
import LiveVideoStudio from './admin/LiveVideoStudio';
import { AuthService } from '../services/authService';
import './PitchModal.css';

export default function PitchModal({ isOpen, onClose, onAddStory, onShowToast, currentUser: propUser }) {
  const [pitchFormat, setPitchFormat] = useState(null);

  // Reset format selection whenever modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setPitchFormat(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const authorUser = propUser || AuthService.getUser();
  if (!authorUser) {
    if (onShowToast) onShowToast('Please sign in to access Pitch Studio.');
    if (onClose) onClose();
    return null;
  }

  // If user selected Article format
  if (pitchFormat === 'article') {
    return (
      <LiveArticleStudio
        isPitchMode={true}
        currentUser={authorUser}
        onClose={onClose}
        onBack={() => setPitchFormat(null)}
        onShowToast={onShowToast}
        onSaveSuccess={(savedArticle) => {
          if (onAddStory && savedArticle) {
            onAddStory(savedArticle);
          }
          if (onClose) onClose();
        }}
      />
    );
  }

  // If user selected Video format
  if (pitchFormat === 'video') {
    return (
      <LiveVideoStudio
        isPitchMode={true}
        currentUser={authorUser}
        onClose={onClose}
        onBack={() => setPitchFormat(null)}
        onShowToast={onShowToast}
        onSaveSuccess={(savedVideo) => {
          if (onClose) onClose();
        }}
      />
    );
  }

  // Initial step: Pitch Format Selector Dialog
  return (
    <div 
      className="pitch-modal-overlay modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div 
        className="pitch-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header (Stays Fixed at Top) */}
        <div className="pitch-modal-header">
          <button
            type="button"
            className="pitch-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <h2 className="pitch-modal-title">
            What would you like to pitch?
          </h2>
        </div>

        {/* Format Selection Cards (Scrollable) */}
        <div className="pitch-modal-grid">
          {/* Option 1: Article */}
          <div
            className="pitch-option-card article"
            onClick={() => setPitchFormat('article')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPitchFormat('article'); }}
          >
            <div>
              <div className="pitch-icon-bubble article">
                <FileText size={22} />
              </div>
              <h3 className="pitch-card-title">
                Article / Written Story
              </h3>
              <p className="pitch-card-desc">
                Pitch an in-depth startup story, founder journey, deeptech breakdown, industry analysis, or opinion piece.
              </p>
              <div className="pitch-check-list">
                <span className="pitch-check-item">
                  <CheckCircle2 size={13} color="#16a34a" /> Multi-block rich text editor
                </span>
                <span className="pitch-check-item">
                  <CheckCircle2 size={13} color="#16a34a" /> Direct cover upload from PC
                </span>
                <span className="pitch-check-item">
                  <CheckCircle2 size={13} color="#16a34a" /> Categories, topics &amp; tags taxonomy
                </span>
              </div>
            </div>

            <button
              type="button"
              className="pitch-action-btn article"
            >
              <span>Pitch Article</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Option 2: Video */}
          <div
            className="pitch-option-card video"
            onClick={() => setPitchFormat('video')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPitchFormat('video'); }}
          >
            <div>
              <div className="pitch-icon-bubble video">
                <Video size={22} />
              </div>
              <h3 className="pitch-card-title">
                Video Show / Episode
              </h3>
              <p className="pitch-card-desc">
                Pitch an interview, YouTube founder episode, fireside chat, podcast, or video masterclass.
              </p>
              <div className="pitch-check-list">
                <span className="pitch-check-item">
                  <CheckCircle2 size={13} color="#16a34a" /> YouTube, Vimeo &amp; MP4 video streams
                </span>
                <span className="pitch-check-item">
                  <CheckCircle2 size={13} color="#16a34a" /> Direct cover / thumbnail upload from PC
                </span>
                <span className="pitch-check-item">
                  <CheckCircle2 size={13} color="#16a34a" /> Live stream embed &amp; preview
                </span>
              </div>
            </div>

            <button
              type="button"
              className="pitch-action-btn video"
            >
              <span>Pitch Video</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Footer info note */}
        <div className="pitch-modal-footer">
          <span>
            Logged in as <strong>{authorUser?.name || 'Contributing Author'}</strong>
          </span>
          <span style={{ color: '#94a3b8' }}>
            All pitches are saved as editorial drafts
          </span>
        </div>
      </div>
    </div>
  );
}
