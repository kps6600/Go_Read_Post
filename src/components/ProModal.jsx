import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProModal({ isOpen, onClose, onShowToast }) {
  if (!isOpen) return null;

  const handleStartTrial = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    onShowToast("Pro Membership activated! Enjoy full ad-free intelligence & masterclasses.");
    onClose();
  };

  return (
    <div className="modal-backdrop-portal" onClick={onClose}>
      <div 
        className="pro-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="pro-header">
          <div className="pro-badge-pill">
            <span>THE CREATIVE PASS • PRO MEMBERSHIP</span>
          </div>
          <h2 className="pro-modal-title">Elevate Your Creative &amp; Tech Intelligence</h2>
          <p className="pro-modal-subtitle">
            Watch all courses for just <strong>$13/month</strong> with The Creative Pass. 
            Full access to cap table dossiers, deeptech reports, and community masterclasses.
          </p>
        </div>

        <div className="pro-pricing-box">
          <div className="pro-price-row">
            <span className="pro-amount">$13</span>
            <span className="pro-period">/ month, billed annually</span>
          </div>
          <span className="pro-guarantee">Cancel anytime with 1-click. 14-day free trial included.</span>
        </div>

        <div className="pro-perks-list">
          <div className="pro-perk-item">
            <Check size={16} className="pro-check-icon" />
            <span>Watch 200+ design, code, and 3D courses from award-winning creators</span>
          </div>
          <div className="pro-perk-item">
            <Check size={16} className="pro-check-icon" />
            <span>Real-time CapTable venture intelligence &amp; unredacted funding databases</span>
          </div>
          <div className="pro-perk-item">
            <Check size={16} className="pro-check-icon" />
            <span>Fast-track Website &amp; Startup submissions with priority jury review</span>
          </div>
          <div className="pro-perk-item">
            <Check size={16} className="pro-check-icon" />
            <span>Verified Pro Badge on community profiles &amp; directory listings</span>
          </div>
        </div>

        <button className="pro-cta-btn" onClick={handleStartTrial}>
          <span>Start 14-Day Free Trial</span>
          <ArrowRight size={16} />
        </button>

        <p className="pro-footer-note">
          No commitment. Instant access upon confirmation.
        </p>
      </div>
    </div>
  );
}
