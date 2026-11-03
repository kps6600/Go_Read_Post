import React, { useState, useEffect } from 'react';
import { FileText, Video, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import LiveArticleStudio from './admin/LiveArticleStudio';
import LiveVideoStudio from './admin/LiveVideoStudio';
import { AuthService } from '../services/authService';

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
      className="modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div 
        className="pitch-modal-card"
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          maxWidth: '740px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div 
          className="pitch-modal-header"
          style={{
            padding: '2rem 2rem 1.25rem',
            borderBottom: '1px solid #f1f5f9',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={18} />
          </button>

          <h2 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            What would you like to pitch?
          </h2>
        </div>

        {/* Format Selection Cards */}
        <div 
          className="pitch-modal-grid"
          style={{
            padding: '1.75rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            background: '#f8fafc'
          }}
        >
          {/* Option 1: Article */}
          <div
            onClick={() => setPitchFormat('article')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPitchFormat('article'); }}
            style={{
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: '1rem',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(220, 38, 38, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Article / Written Story
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 1rem 0' }}>
                Pitch an in-depth startup story, founder journey, deeptech breakdown, industry analysis, or opinion piece.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#475569', marginBottom: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} color="#16a34a" /> Multi-block rich text editor
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} color="#16a34a" /> Direct cover upload from PC
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} color="#16a34a" /> Categories, topics & tags taxonomy
                </span>
              </div>
            </div>

            <button
              type="button"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.65rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
            >
              <span>Pitch Article</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Option 2: Video */}
          <div
            onClick={() => setPitchFormat('video')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPitchFormat('video'); }}
            style={{
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: '1rem',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(37, 99, 235, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          >
            <div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Video size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Video Show / Episode
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 1rem 0' }}>
                Pitch an interview, YouTube founder episode, fireside chat, podcast, or video masterclass.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#475569', marginBottom: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} color="#16a34a" /> YouTube, Vimeo & MP4 video streams
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} color="#16a34a" /> Direct cover / thumbnail upload from PC
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} color="#16a34a" /> Live stream embed & preview
                </span>
              </div>
            </div>

            <button
              type="button"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.65rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              <span>Pitch Video</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Footer info note */}
        <div 
          className="pitch-modal-footer"
          style={{
            padding: '1rem 2rem',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: '#64748b'
          }}
        >
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
