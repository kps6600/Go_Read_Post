import React from 'react';
import LiveArticleStudio from './admin/LiveArticleStudio';
import { AuthService } from '../services/authService';

export default function PitchModal({ isOpen, onClose, onAddStory, onShowToast, currentUser: propUser }) {
  if (!isOpen) return null;

  const authorUser = propUser || AuthService.getUser() || { 
    name: 'Aditi Shrivastava', 
    email: 'aditi-shrivastava@goreadpost.com', 
    role: 'AUTHOR',
    title: 'Staff Reporter',
    designation: 'Staff Reporter'
  };

  return (
    <LiveArticleStudio
      isPitchMode={true}
      currentUser={authorUser}
      onClose={onClose}
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
