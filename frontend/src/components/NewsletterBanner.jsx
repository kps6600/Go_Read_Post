import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { NewsletterService } from '../services/newsletterService';

export default function NewsletterBanner({
  data = {},
  isAdmin = false,
  onUpdate = null,
  onShowToast = null
}) {
  const [headline, setHeadline] = useState(data.headline || data.title || 'Get the Latest Blogs Delivered to Your Inbox');
  const [subtitle, setSubtitle] = useState(data.subtitle || data.description || 'Unfiltered insights on venture capital, frontier tech, and high-growth leadership directly in your inbox.');
  const [placeholder, setPlaceholder] = useState(data.placeholder || 'Enter your email address');
  const [btnText, setBtnText] = useState(data.buttonText || data.btnText || 'Subscribe');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleHeadlineBlur = (e) => {
    const val = e.currentTarget.textContent.trim();
    if (val && val !== headline) {
      setHeadline(val);
      onUpdate?.({ ...data, headline: val, title: val, heading: val });
    }
  };

  const handleSubtitleBlur = (e) => {
    const val = e.currentTarget.textContent.trim();
    if (val !== subtitle) {
      setSubtitle(val);
      onUpdate?.({ ...data, subtitle: val, description: val });
    }
  };

  const handlePlaceholderBlur = (e) => {
    const val = e.currentTarget.textContent.trim();
    if (val && val !== placeholder) {
      setPlaceholder(val);
      onUpdate?.({ ...data, placeholder: val });
    }
  };

  const handleBtnTextBlur = (e) => {
    const val = e.currentTarget.textContent.trim();
    if (val && val !== btnText) {
      setBtnText(val);
      onUpdate?.({ ...data, buttonText: val });
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLoading(true);
    try {
      await NewsletterService.subscribe(email, { source: 'newsletter_banner' });
      setSubscribed(true);
      if (onShowToast) onShowToast('Subscribed successfully! Welcome to GoReadPost.');
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mhp-newsletter-section" style={{ margin: '2.5rem 0 1rem' }}>
      <div 
        className="mhp-newsletter-card" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', 
          border: '1.5px solid rgba(234, 88, 12, 0.35)', 
          borderRadius: '16px', 
          padding: '2.5rem',
          position: 'relative'
        }}
      >
        <div className="mhp-newsletter-left">
          <div className="mhp-newsletter-icon-wrap" style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c' }}>
            <Mail size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 
              contentEditable={isAdmin}
              suppressContentEditableWarning={true}
              className={isAdmin ? "mhp-newsletter-title lse-direct-editable" : "mhp-newsletter-title"} 
              onBlur={handleHeadlineBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              title={isAdmin ? "Click directly to edit headline" : undefined}
              style={{ color: '#ffffff', margin: '0 0 6px', outline: 'none', cursor: isAdmin ? 'text' : 'default' }}
            >
              {headline}
            </h2>
            <p 
              contentEditable={isAdmin}
              suppressContentEditableWarning={true}
              className={isAdmin ? "lse-direct-editable" : ""} 
              onBlur={handleSubtitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              title={isAdmin ? "Click directly to edit subtitle" : undefined}
              style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8', outline: 'none', cursor: isAdmin ? 'text' : 'default' }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {subscribed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontWeight: 700 }}>
            <CheckCircle2 size={20} />
            <span>Thank you for subscribing! Check your inbox for dispatches.</span>
          </div>
        ) : (
          <form className="mhp-newsletter-form" onSubmit={handleSubscribe}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="email" 
                placeholder={placeholder} 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mhp-newsletter-input" 
                required 
              />
              {isAdmin && (
                <span 
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  className="lse-direct-editable"
                  onBlur={handlePlaceholderBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  title="Click directly to edit input placeholder text"
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '8px',
                    fontSize: '0.68rem',
                    color: '#ea580c',
                    fontWeight: 700,
                    cursor: 'text'
                  }}
                >
                  Placeholder: {placeholder}
                </span>
              )}
            </div>

            <button 
              type="submit" 
              className="mhp-newsletter-btn"
              disabled={loading}
              contentEditable={isAdmin}
              suppressContentEditableWarning={true}
              onBlur={handleBtnTextBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              title={isAdmin ? "Click directly to edit button label" : undefined}
            >
              {loading ? 'Subscribing...' : btnText}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
