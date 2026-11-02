import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ArrowRight, Check, CheckCircle2, 
  Megaphone, Target, Handshake, PhoneCall, Send, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PageService } from '../services/pageService';
import './AdvertisePage.css';

const ADVERTISE_STORAGE_KEY = 'goreadpost_advertise_custom_v2';

const DEFAULT_ADV_STATE = {
  heroHeading: 'Advertise With Us',
  heroSubtext: "Partner with India's leading technology, founders, and capital intelligence publication.",
  heroChecks: [
    'Increase Brand Visibility',
    'Reach Target Audience',
    'Flexible Ad Options'
  ],
  whyTitle: 'Your Brand Deserves to Be Seen',
  benefits: [
    'Promote Your Business',
    'Flexible Ad Options',
    'Personalised Support'
  ],
  calloutTitle: 'Need to Talk Directly?',
  callBtnText: 'Call Now',
  contactPhone: '+91 928 933 8990',
  formTitle: 'Submit Your Enquiry',
  labelFullName: 'Full Name',
  labelCompany: 'Company / Business Name',
  labelEmail: 'Email Address',
  labelPhone: 'Phone Number',
  labelAdType: 'Type of Advertisement',
  labelMessage: 'Your Message',
  submitBtnText: 'Send'
};

const getStoredAdvData = () => {
  try {
    const raw = localStorage.getItem(ADVERTISE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_ADV_STATE,
          ...parsed,
          heroChecks: Array.isArray(parsed.heroChecks) && parsed.heroChecks.length ? parsed.heroChecks : DEFAULT_ADV_STATE.heroChecks,
          benefits: Array.isArray(parsed.benefits) && parsed.benefits.length ? parsed.benefits : DEFAULT_ADV_STATE.benefits
        };
      }
    }
  } catch (e) {}
  return DEFAULT_ADV_STATE;
};

const saveStoredAdvData = (data) => {
  try {
    localStorage.setItem(ADVERTISE_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
};

export default function AdvertisePage({ page, onBackToHome, onShowToast, isStudioView = false }) {
  const [advData, setAdvData] = useState(() => {
    if (page?.data && typeof page.data === 'object' && Object.keys(page.data).length > 0) {
      return { ...DEFAULT_ADV_STATE, ...page.data };
    }
    return getStoredAdvData();
  });

  const advDataRef = useRef(advData);
  useEffect(() => {
    advDataRef.current = advData;
  }, [advData]);

  // Load latest page data from MongoDB API on mount or when page prop changes
  useEffect(() => {
    let isMounted = true;
    if (page?.data && typeof page.data === 'object' && Object.keys(page.data).length > 0) {
      const merged = { ...DEFAULT_ADV_STATE, ...page.data };
      setAdvData(merged);
      advDataRef.current = merged;
    } else {
      PageService.getPageById('page_advertise').then(res => {
        if (isMounted && res && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
          const merged = { ...DEFAULT_ADV_STATE, ...res.data };
          setAdvData(merged);
          advDataRef.current = merged;
          saveStoredAdvData(merged);
        } else if (isMounted) {
          const stored = getStoredAdvData();
          setAdvData(stored);
          advDataRef.current = stored;
        }
      }).catch(() => {
        if (isMounted) {
          const stored = getStoredAdvData();
          setAdvData(stored);
          advDataRef.current = stored;
        }
      });
    }

    const handleStorageUpdate = () => {
      const stored = getStoredAdvData();
      setAdvData(stored);
      advDataRef.current = stored;
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [page]);

  // Persist helper for local storage and MongoDB page update
  const persistAdvData = (newData) => {
    advDataRef.current = newData;
    setAdvData(newData);
    saveStoredAdvData(newData);
    try {
      PageService.updatePage('page_advertise', {
        title: newData.heroHeading || 'Advertise With Us',
        description: newData.heroSubtext || DEFAULT_ADV_STATE.heroSubtext,
        slug: 'advertise',
        status: 'published',
        data: newData
      }).catch(err => console.warn('Sync advertise page note:', err));
    } catch (e) {}
  };

  const updateField = (field, value) => {
    const updated = {
      ...advDataRef.current,
      [field]: value
    };
    persistAdvData(updated);
  };

  const updateHeroCheck = (idx, value) => {
    const checks = [...(advDataRef.current.heroChecks || DEFAULT_ADV_STATE.heroChecks)];
    checks[idx] = value;
    const updated = {
      ...advDataRef.current,
      heroChecks: checks
    };
    persistAdvData(updated);
  };

  const updateBenefit = (idx, value) => {
    const benefits = [...(advDataRef.current.benefits || DEFAULT_ADV_STATE.benefits)];
    benefits[idx] = value;
    const updated = {
      ...advDataRef.current,
      benefits
    };
    persistAdvData(updated);
  };

  // Listen to Studio Top Bar "Publish Live" event
  useEffect(() => {
    const handlePublishEvent = () => {
      persistAdvData(advDataRef.current);
      if (onShowToast) onShowToast('Advertise page published live successfully!');
    };
    window.addEventListener('admin:publish-live-studio', handlePublishEvent);
    return () => {
      window.removeEventListener('admin:publish-live-studio', handlePublishEvent);
    };
  }, [onShowToast]);

  // Page Title & Meta tags for SEO
  useEffect(() => {
    document.title = `${advData.heroHeading || 'Advertise With Us'} | GoReadPost Brand Partnerships`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', advData.heroSubtext || DEFAULT_ADV_STATE.heroSubtext);
    if (!isStudioView) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [advData.heroHeading, advData.heroSubtext, isStudioView]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    adOption: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactPhone = advData.contactPhone || DEFAULT_ADV_STATE.contactPhone;
  const rawWhatsAppPhone = (contactPhone || '').replace(/[^0-9]/g, '') || '919289338990';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isStudioView) {
      if (onShowToast) onShowToast('Advertising enquiry form is interactive in public view.');
      return;
    }

    // Validation
    if (!formData.fullName.trim()) {
      if (onShowToast) onShowToast('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      if (onShowToast) onShowToast('Please enter your email address');
      return;
    }
    if (!formData.phone.trim()) {
      if (onShowToast) onShowToast('Please enter your phone number');
      return;
    }
    if (!formData.adOption) {
      if (onShowToast) onShowToast('Please select a type of advertisement');
      return;
    }
    if (!formData.message.trim()) {
      if (onShowToast) onShowToast('Please enter your message');
      return;
    }

    setIsSubmitting(true);

    // 1. Submit to Backend Admin Panel (/api/submissions)
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'advertising',
          name: formData.fullName.trim(),
          company: formData.company.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          adOption: formData.adOption,
          message: formData.message.trim(),
          headline: `Ad Inquiry: ${formData.adOption} - ${formData.company.trim() || formData.fullName.trim()}`,
          summary: formData.message.trim(),
          source: 'advertise_page'
        })
      });
    } catch (err) {
      console.warn('Submission to backend:', err);
    }

    // 2. Build pre-filled message for WhatsApp
    const waText = 
      `*New Advertising Enquiry - GoReadPost*\n\n` +
      `👤 *Full Name:* ${formData.fullName.trim()}\n` +
      `🏢 *Company / Business:* ${formData.company.trim() || 'Not specified'}\n` +
      `📧 *Email Address:* ${formData.email.trim()}\n` +
      `📱 *Phone Number:* ${formData.phone.trim()}\n` +
      `🎯 *Type of Ad:* ${formData.adOption}\n` +
      `💬 *Message:* ${formData.message.trim()}\n\n` +
      `_Sent via GoReadPost Advertise Page_`;

    const waUrl = `https://wa.me/${rawWhatsAppPhone}?text=${encodeURIComponent(waText)}`;

    // 3. Complete submission: confetti + toast + WhatsApp redirect
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);

      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      if (onShowToast) {
        onShowToast('✓ Enquiry saved to Admin & opening WhatsApp...');
      }

      // Open WhatsApp in new tab / app
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 300);
  };

  const handleCallNow = () => {
    window.location.href = `tel:${contactPhone.replace(/\s+/g, '')}`;
  };

  return (
    <div className={`adv-exact-page ${isStudioView ? 'adv-studio-mode' : ''}`}>

      {/* ── Studio View Breadcrumb ── */}
      {isStudioView && (
        <nav 
          className="contact-breadcrumb-nav" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.88rem', 
            color: '#64748b',
            marginBottom: '1rem',
            padding: '0 0.5rem'
          }}
        >
          <button 
            type="button" 
            onClick={onBackToHome}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#dc2626', 
              fontWeight: 700, 
              cursor: 'pointer', 
              padding: 0 
            }}
          >
            Home
          </button>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>Advertise With Us</span>
        </nav>
      )}

      {/* ─── 1. TOP HERO BANNER (DARK NAVY WITH LAPTOP MOCKUP) ─── */}
      <section className="adv-hero-banner">
        <div className="adv-hero-inner">
          
          {/* Left Hero Content */}
          <div className="adv-hero-content">
            <h1 
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "adv-hero-heading lse-direct-editable" : "adv-hero-heading"}
              title={isStudioView ? "Click directly to edit headline" : undefined}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== advData.heroHeading) updateField('heroHeading', val);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            >
              {advData.heroHeading}
            </h1>

            <p 
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "adv-hero-subtext lse-direct-editable" : "adv-hero-subtext"}
              title={isStudioView ? "Click directly to edit subtext" : undefined}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== advData.heroSubtext) updateField('heroSubtext', val);
              }}
            >
              {advData.heroSubtext}
            </p>

            {/* 3 Checkmark Feature Badges */}
            <div className="adv-hero-checks">
              {(advData.heroChecks || DEFAULT_ADV_STATE.heroChecks).map((check, idx) => (
                <div key={idx} className="adv-check-pill">
                  <span className="adv-check-icon">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span 
                    contentEditable={isStudioView}
                    suppressContentEditableWarning={true}
                    className={isStudioView ? "adv-check-text lse-direct-editable" : "adv-check-text"}
                    title={isStudioView ? "Click directly to edit feature badge" : undefined}
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent.trim();
                      if (val && val !== check) updateHeroCheck(idx, val);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                  >
                    {check}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Hero Image (Laptop Mockup) */}
          <div className="adv-hero-media">
            <div className="adv-hero-media-wrapper">
              <img 
                src="/assets/advertise_hero_laptop.jpg" 
                alt="Advertise With Us - Grow Your Business" 
                className="adv-hero-laptop-img"
                loading="eager"
              />
              <div className="adv-hero-media-fade" />
            </div>
          </div>

        </div>
      </section>

      {/* ─── 2. TWO-COLUMN MAIN BODY (LEFT: BENEFITS | RIGHT: ENQUIRY FORM) ─── */}
      <main className="adv-main-section">
        <div className="adv-main-container">
          
          {/* ────── Left Column: Why Advertise With Us? ────── */}
          <div className="adv-left-column">
            
            <div className="adv-why-header">
              <h2 
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "adv-why-title lse-direct-editable" : "adv-why-title"}
                title={isStudioView ? "Click directly to edit section title" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== advData.whyTitle) updateField('whyTitle', val);
                }}
              >
                {advData.whyTitle}
              </h2>
            </div>

            {/* 3 Benefit Feature Items */}
            <div className="adv-benefits-list">
              {(advData.benefits || DEFAULT_ADV_STATE.benefits).map((benefit, idx) => {
                const iconWraps = [
                  <div key="0" className="adv-benefit-icon-wrap adv-icon-blue"><Megaphone size={22} strokeWidth={2.2} /></div>,
                  <div key="1" className="adv-benefit-icon-wrap adv-icon-green"><Target size={22} strokeWidth={2.2} /></div>,
                  <div key="2" className="adv-benefit-icon-wrap adv-icon-purple"><Handshake size={22} strokeWidth={2.2} /></div>
                ];
                return (
                  <div key={idx} className="adv-benefit-item">
                    {iconWraps[idx % iconWraps.length]}
                    <div className="adv-benefit-text">
                      <h3 
                        contentEditable={isStudioView}
                        suppressContentEditableWarning={true}
                        className={isStudioView ? "adv-benefit-title lse-direct-editable" : "adv-benefit-title"}
                        title={isStudioView ? "Click directly to edit benefit title" : undefined}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== benefit) updateBenefit(idx, val);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      >
                        {benefit}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Need to Talk Directly? Card */}
            <div className="adv-callout-card">
              <h4 
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "adv-callout-title lse-direct-editable" : "adv-callout-title"}
                title={isStudioView ? "Click directly to edit callout title" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== advData.calloutTitle) updateField('calloutTitle', val);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
              >
                {advData.calloutTitle}
              </h4>

              <div className="adv-callout-action-row">
                <button 
                  type="button" 
                  className="adv-call-now-btn" 
                  onClick={(e) => {
                    if (isStudioView) { e.preventDefault(); return; }
                    handleCallNow();
                  }}
                >
                  <PhoneCall size={16} />
                  <span
                    contentEditable={isStudioView}
                    suppressContentEditableWarning={true}
                    className={isStudioView ? "lse-direct-editable" : ""}
                    title={isStudioView ? "Click directly to edit button text" : undefined}
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent.trim();
                      if (val && val !== advData.callBtnText) updateField('callBtnText', val);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                  >
                    {advData.callBtnText}
                  </span>
                </button>
                <span className="adv-callout-divider" />
                <span 
                  contentEditable={isStudioView}
                  suppressContentEditableWarning={true}
                  className={isStudioView ? "adv-callout-phone-link lse-direct-editable" : "adv-callout-phone-link"}
                  title={isStudioView ? "Click directly to edit contact phone" : undefined}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent.trim();
                    if (val && val !== advData.contactPhone) updateField('contactPhone', val);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                >
                  {advData.contactPhone}
                </span>
              </div>
            </div>

          </div>

          {/* ────── Right Column: Submit Your Enquiry Card ────── */}
          <div className="adv-right-column">
            <div className="adv-form-card">
              
              <div className="adv-form-header">
                <h2 
                  contentEditable={isStudioView}
                  suppressContentEditableWarning={true}
                  className={isStudioView ? "adv-form-title lse-direct-editable" : "adv-form-title"}
                  title={isStudioView ? "Click directly to edit form title" : undefined}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent.trim();
                    if (val && val !== advData.formTitle) updateField('formTitle', val);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                >
                  {advData.formTitle}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="adv-enquiry-form">
                
                {/* Row 1: Full Name & Company Name */}
                <div className="adv-form-row adv-two-cols">
                  <div className="adv-field-group">
                    <label className="adv-label">
                      <span
                        contentEditable={isStudioView}
                        suppressContentEditableWarning={true}
                        className={isStudioView ? "lse-direct-editable" : ""}
                        title={isStudioView ? "Click directly to edit label" : undefined}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== advData.labelFullName) updateField('labelFullName', val);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      >
                        {advData.labelFullName || 'Full Name'}
                      </span>
                      {' '}
                      <span className="adv-required">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name" 
                      className="adv-input"
                      required
                      disabled={isStudioView}
                    />
                  </div>

                  <div className="adv-field-group">
                    <label className="adv-label">
                      <span
                        contentEditable={isStudioView}
                        suppressContentEditableWarning={true}
                        className={isStudioView ? "lse-direct-editable" : ""}
                        title={isStudioView ? "Click directly to edit label" : undefined}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== advData.labelCompany) updateField('labelCompany', val);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      >
                        {advData.labelCompany || 'Company / Business Name'}
                      </span>
                    </label>
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Enter your company name" 
                      className="adv-input"
                      disabled={isStudioView}
                    />
                  </div>
                </div>

                {/* Row 2: Email Address & Phone Number */}
                <div className="adv-form-row adv-two-cols">
                  <div className="adv-field-group">
                    <label className="adv-label">
                      <span
                        contentEditable={isStudioView}
                        suppressContentEditableWarning={true}
                        className={isStudioView ? "lse-direct-editable" : ""}
                        title={isStudioView ? "Click directly to edit label" : undefined}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== advData.labelEmail) updateField('labelEmail', val);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      >
                        {advData.labelEmail || 'Email Address'}
                      </span>
                      {' '}
                      <span className="adv-required">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com" 
                      className="adv-input"
                      required
                      disabled={isStudioView}
                    />
                  </div>

                  <div className="adv-field-group">
                    <label className="adv-label">
                      <span
                        contentEditable={isStudioView}
                        suppressContentEditableWarning={true}
                        className={isStudioView ? "lse-direct-editable" : ""}
                        title={isStudioView ? "Click directly to edit label" : undefined}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== advData.labelPhone) updateField('labelPhone', val);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      >
                        {advData.labelPhone || 'Phone Number'}
                      </span>
                      {' '}
                      <span className="adv-required">*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210" 
                      className="adv-input"
                      required
                      disabled={isStudioView}
                    />
                  </div>
                </div>

                {/* Row 3: Type of Advertisement */}
                <div className="adv-form-row">
                  <div className="adv-field-group">
                    <label className="adv-label">
                      <span
                        contentEditable={isStudioView}
                        suppressContentEditableWarning={true}
                        className={isStudioView ? "lse-direct-editable" : ""}
                        title={isStudioView ? "Click directly to edit label" : undefined}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== advData.labelAdType) updateField('labelAdType', val);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      >
                        {advData.labelAdType || 'Type of Advertisement'}
                      </span>
                      {' '}
                      <span className="adv-required">*</span>
                    </label>
                    <div className="adv-select-wrapper">
                      <select 
                        name="adOption"
                        value={formData.adOption}
                        onChange={handleInputChange}
                        className="adv-select"
                        required
                        disabled={isStudioView}
                      >
                        <option value="" disabled>Select an option</option>
                        <option value="Banner Ads">Banner Ads (Header, Sidebar, In-Article)</option>
                        <option value="Sponsored Posts">Sponsored Editorial Posts & Guest Feature</option>
                        <option value="Product Promotions">Product Promotions & Tool Reviews</option>
                        <option value="Dedicated Newsletter">Dedicated Newsletter Sponsorship</option>
                        <option value="Brand Partnership">Long-Term Brand Partnership</option>
                        <option value="Other">Other Custom Requirement</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 4: Your Message */}
                <div className="adv-form-row">
                  <div className="adv-field-group">
                    <label className="adv-label">
                      <span
                        contentEditable={isStudioView}
                        suppressContentEditableWarning={true}
                        className={isStudioView ? "lse-direct-editable" : ""}
                        title={isStudioView ? "Click directly to edit label" : undefined}
                        onBlur={(e) => {
                          const val = e.currentTarget.textContent.trim();
                          if (val && val !== advData.labelMessage) updateField('labelMessage', val);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      >
                        {advData.labelMessage || 'Your Message'}
                      </span>
                      {' '}
                      <span className="adv-required">*</span>
                    </label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your advertising requirements..."
                      rows={4}
                      className="adv-textarea"
                      required
                      disabled={isStudioView}
                    />
                  </div>
                </div>

                {/* Send Submit Button */}
                <button 
                  type="submit" 
                  className="adv-whatsapp-btn"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    if (isStudioView) {
                      e.preventDefault();
                      return;
                    }
                  }}
                >
                  <Send size={18} className="adv-wa-icon" />
                  <span 
                    contentEditable={isStudioView}
                    suppressContentEditableWarning={true}
                    className={isStudioView ? "adv-wa-btn-text lse-direct-editable" : "adv-wa-btn-text"}
                    title={isStudioView ? "Click directly to edit button label" : undefined}
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent.trim();
                      if (val && val !== advData.submitBtnText) updateField('submitBtnText', val);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                  >
                    {isSubmitting ? 'Sending...' : advData.submitBtnText}
                  </span>
                  <ArrowRight size={18} className="adv-wa-arrow" />
                </button>

              </form>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
