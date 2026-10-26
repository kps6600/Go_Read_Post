import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Check, CheckCircle2, 
  Megaphone, Target, Handshake, PhoneCall, Send, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './AdvertisePage.css';

export default function AdvertisePage({ page, onBackToHome, onShowToast }) {
  // Page Title & Meta tags for SEO
  useEffect(() => {
    document.title = 'Advertise With Us | GoReadPost Brand Partnerships';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Reach the right audience for your brand. Promote your business, products or services through our blogging platform and get connected with engaged readers.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  const contactPhone = '+91 928 933 8990';
  const rawWhatsAppPhone = '919289338990';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    <div className="adv-exact-page">

      {/* ─── 1. TOP HERO BANNER (DARK NAVY WITH LAPTOP MOCKUP) ─── */}
      <section className="adv-hero-banner">
        <div className="adv-hero-inner">
          
          {/* Left Hero Content */}
          <div className="adv-hero-content">
            <h1 className="adv-hero-heading">
              Advertise With Us
            </h1>

            <p className="adv-hero-subtext">
              Reach the right audience for your brand. Promote your business, products or services through our blogging platform and get connected with engaged readers.
            </p>

            {/* 3 Checkmark Feature Badges */}
            <div className="adv-hero-checks">
              <div className="adv-check-pill">
                <span className="adv-check-icon">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="adv-check-text">Increase Brand Visibility</span>
              </div>

              <div className="adv-check-pill">
                <span className="adv-check-icon">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="adv-check-text">Reach Target Audience</span>
              </div>

              <div className="adv-check-pill">
                <span className="adv-check-icon">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="adv-check-text">Flexible Ad Options</span>
              </div>
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
              <h2 className="adv-why-title">
                Your Brand Deserves<br />to Be Seen
              </h2>
            </div>

            {/* 3 Benefit Feature Items */}
            <div className="adv-benefits-list">
              
              {/* Feature 1: Promote Your Business */}
              <div className="adv-benefit-item">
                <div className="adv-benefit-icon-wrap adv-icon-blue">
                  <Megaphone size={22} strokeWidth={2.2} />
                </div>
                <div className="adv-benefit-text">
                  <h3 className="adv-benefit-title">Promote Your Business</h3>
                </div>
              </div>

              {/* Feature 2: Flexible Ad Options */}
              <div className="adv-benefit-item">
                <div className="adv-benefit-icon-wrap adv-icon-green">
                  <Target size={22} strokeWidth={2.2} />
                </div>
                <div className="adv-benefit-text">
                  <h3 className="adv-benefit-title">Flexible Ad Options</h3>
                </div>
              </div>

              {/* Feature 3: Personalised Support */}
              <div className="adv-benefit-item">
                <div className="adv-benefit-icon-wrap adv-icon-purple">
                  <Handshake size={22} strokeWidth={2.2} />
                </div>
                <div className="adv-benefit-text">
                  <h3 className="adv-benefit-title">Personalised Support</h3>
                </div>
              </div>

            </div>

            {/* Need to Talk Directly? Card */}
            <div className="adv-callout-card">
              <h4 className="adv-callout-title">Need to Talk Directly?</h4>

              <div className="adv-callout-action-row">
                <button 
                  type="button" 
                  className="adv-call-now-btn" 
                  onClick={handleCallNow}
                >
                  <PhoneCall size={16} />
                  <span>Call Now</span>
                </button>
                <span className="adv-callout-divider" />
                <a 
                  href={`tel:${contactPhone.replace(/\s+/g, '')}`} 
                  className="adv-callout-phone-link"
                >
                  {contactPhone}
                </a>
              </div>
            </div>

          </div>


          {/* ────── Right Column: Submit Your Enquiry Card ────── */}
          <div className="adv-right-column">
            <div className="adv-form-card">
              
              <div className="adv-form-header">
                <h2 className="adv-form-title">Submit Your Enquiry</h2>
              </div>

              <form onSubmit={handleSubmit} className="adv-enquiry-form">
                
                {/* Row 1: Full Name & Company Name */}
                <div className="adv-form-row adv-two-cols">
                  <div className="adv-field-group">
                    <label className="adv-label">
                      Full Name <span className="adv-required">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name" 
                      className="adv-input"
                      required
                    />
                  </div>

                  <div className="adv-field-group">
                    <label className="adv-label">
                      Company / Business Name
                    </label>
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Enter your company name" 
                      className="adv-input"
                    />
                  </div>
                </div>

                {/* Row 2: Email Address & Phone Number */}
                <div className="adv-form-row adv-two-cols">
                  <div className="adv-field-group">
                    <label className="adv-label">
                      Email Address <span className="adv-required">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com" 
                      className="adv-input"
                      required
                    />
                  </div>

                  <div className="adv-field-group">
                    <label className="adv-label">
                      Phone Number <span className="adv-required">*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210" 
                      className="adv-input"
                      required
                    />
                  </div>
                </div>

                {/* Row 3: Type of Advertisement */}
                <div className="adv-form-row">
                  <div className="adv-field-group">
                    <label className="adv-label">
                      Type of Advertisement <span className="adv-required">*</span>
                    </label>
                    <div className="adv-select-wrapper">
                      <select 
                        name="adOption"
                        value={formData.adOption}
                        onChange={handleInputChange}
                        className="adv-select"
                        required
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
                      Your Message <span className="adv-required">*</span>
                    </label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your advertising requirements..."
                      rows={4}
                      className="adv-textarea"
                      required
                    />
                  </div>
                </div>

                {/* Send Submit Button */}
                <button 
                  type="submit" 
                  className="adv-whatsapp-btn"
                  disabled={isSubmitting}
                >
                  <Send size={18} className="adv-wa-icon" />
                  <span className="adv-wa-btn-text">
                    {isSubmitting ? 'Sending...' : 'Send'}
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
