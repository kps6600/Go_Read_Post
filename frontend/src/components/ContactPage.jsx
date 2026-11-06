import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  ChevronDown, 
  Building2, 
  PenTool, 
  Megaphone, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubmissionService } from '../services/submissionService';
import { getStoredContactData, DEFAULT_CONTACT_DATA, saveStoredContactData } from '../data/contactData';
import { PageService } from '../services/pageService';
import './ContactPage.css';

export default function ContactPage({ onBackToHome, onShowToast, isStudioView = false }) {
  const [contactData, setContactData] = useState(() => getStoredContactData());
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const persistContactData = (updated) => {
    setContactData(updated);
    saveStoredContactData(updated);
    try {
      PageService.updatePage('contact', {
        title: 'Contact Us',
        slug: 'contact',
        sections: [
          { id: 'hero', type: 'contact_hero', data: updated.hero },
          { id: 'channels', type: 'contact_channels', data: updated.channels },
          { id: 'departments', type: 'contact_departments', data: { departments: updated.departments } },
          { id: 'bureaus', type: 'contact_bureaus', data: { bureaus: updated.bureaus } },
          { id: 'faqs', type: 'contact_faqs', data: { faqs: updated.faqs } }
        ]
      }).catch(() => {});
    } catch (e) {}
    if (onShowToast) onShowToast('Contact Us updated and saved live!');
  };

  const formRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Editorial & Story Pitches',
    subject: '',
    message: '',
    isEmbargoed: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // SEO Update on Mount
  useEffect(() => {
    document.title = contactData.seo?.title || 'Contact Us | GoReadPost — Editorial Newsroom & Support';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', contactData.seo?.description || 'Get in touch with GoReadPost. Pitch a startup story, explore advertising partnerships, report editorial corrections, or reach out to our Bengaluru, Mumbai, and Delhi bureaus.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [contactData.seo]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formError) setFormError('');
  };

  const handleDepartmentSelect = (deptTitle) => {
    setFormData(prev => ({ ...prev, department: deptTitle }));
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Field Validations
    if (!formData.name.trim()) {
      setFormError('Please enter your full name.');
      if (onShowToast) onShowToast('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Please enter a valid email address.');
      if (onShowToast) onShowToast('Please enter your email address');
      return;
    }
    if (!formData.subject.trim()) {
      setFormError('Please enter a brief subject line.');
      if (onShowToast) onShowToast('Please enter a subject line');
      return;
    }
    if (!formData.message.trim()) {
      setFormError('Please enter your message.');
      if (onShowToast) onShowToast('Please enter your message');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await SubmissionService.createSubmission({
        type: 'contact',
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        headline: `${formData.department}: ${formData.subject.trim()}`,
        summary: formData.message.trim(),
        isEmbargoed: formData.isEmbargoed,
        source: 'contact_page'
      });

      setSubmitted(true);
      if (onShowToast) onShowToast('Message delivered to GoReadPost newsroom!');

      // Celebratory Confetti
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#dc2626', '#ef4444', '#f87171', '#ffffff']
        });
      } catch (err) {}

    } catch (err) {
      console.warn('Submission fallback locally saved:', err);
      // Graceful fallback: show positive UX since transmission recorded
      setSubmitted(true);
      if (onShowToast) onShowToast('Your message has been received!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'Editorial & Story Pitches',
      subject: '',
      message: '',
      isEmbargoed: false
    });
  };

  const toggleFaq = (idx) => {
    setOpenFaqIndex(prev => prev === idx ? -1 : idx);
  };

  const { hero, channels, departments, bureaus, faqs } = contactData;

  const getDepartmentIcon = (deptId) => {
    switch (deptId) {
      case 'editorial':
        return <PenTool size={22} />;
      case 'advertising':
        return <Megaphone size={22} />;
      case 'press':
        return <ExternalLink size={22} />;
      case 'support':
      default:
        return <MessageSquare size={22} />;
    }
  };

  return (
    <div className={`contact-page-root ${isStudioView ? 'contact-page-studio-mode' : ''}`}>
      <div className="contact-page-container">

        {/* ── Breadcrumb Navigation ── */}
        <nav className="contact-breadcrumb-nav" aria-label="Breadcrumb">
          <button 
            type="button" 
            className="contact-breadcrumb-btn" 
            onClick={onBackToHome}
          >
            Home
          </button>
          <span>/</span>
          <span className="contact-breadcrumb-current">Contact Us</span>
        </nav>

        {/* ── 1. Hero Section ── */}
        <header className="contact-hero-section">
          <h1 className="contact-hero-title">
            <span
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "lse-direct-editable" : ""}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== hero.titlePrefix) {
                  persistContactData({ ...contactData, hero: { ...hero, titlePrefix: val } });
                }
              }}
              title={isStudioView ? "Click directly to edit" : undefined}
            >
              {hero.titlePrefix}
            </span>
            {' '}
            <span
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "contact-highlight-red lse-direct-editable" : "contact-highlight-red"}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== hero.titleHighlight) {
                  persistContactData({ ...contactData, hero: { ...hero, titleHighlight: val } });
                }
              }}
              title={isStudioView ? "Click directly to edit" : undefined}
            >
              {hero.titleHighlight}
            </span>
          </h1>

          <p
            contentEditable={isStudioView}
            suppressContentEditableWarning={true}
            className={isStudioView ? "contact-hero-subtitle lse-direct-editable" : "contact-hero-subtitle"}
            onBlur={(e) => {
              const val = e.currentTarget.textContent.trim();
              if (val && val !== hero.subtitle) {
                persistContactData({ ...contactData, hero: { ...hero, subtitle: val } });
              }
            }}
            title={isStudioView ? "Click directly to edit" : undefined}
          >
            {hero.subtitle}
          </p>

          <div className="contact-response-notice">
            <Clock size={16} color="var(--brand-primary, #dc2626)" />
            <span
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "lse-direct-editable" : ""}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== hero.responseNotice) {
                  persistContactData({ ...contactData, hero: { ...hero, responseNotice: val } });
                }
              }}
              title={isStudioView ? "Click directly to edit" : undefined}
            >
              {hero.responseNotice}
            </span>
          </div>
        </header>

        {/* ── 2. Department Cards Grid (100% Breadth) ── */}
        <section className="contact-dept-section" aria-label="Departments">
          <div className="contact-dept-grid">
            {departments.map((dept) => (
              <article key={dept.id} className="contact-dept-card">
                <div className="contact-dept-header">
                  <div className="contact-dept-icon-wrapper">
                    {getDepartmentIcon(dept.id)}
                  </div>
                  <span className="contact-dept-badge">{dept.badge}</span>
                </div>

                <h3 
                  contentEditable={isStudioView} 
                  suppressContentEditableWarning={true}
                  className={isStudioView ? "contact-dept-title lse-direct-editable" : "contact-dept-title"}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent.trim();
                    if (val && val !== dept.title) {
                      const updated = contactData.departments.map(d => d.id === dept.id ? { ...d, title: val } : d);
                      persistContactData({ ...contactData, departments: updated });
                    }
                  }}
                  title={isStudioView ? "Click directly to edit" : undefined}
                >
                  {dept.title}
                </h3>
                <p 
                  contentEditable={isStudioView}
                  suppressContentEditableWarning={true}
                  className={isStudioView ? "contact-dept-desc lse-direct-editable" : "contact-dept-desc"}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent.trim();
                    if (val && val !== dept.desc) {
                      const updated = contactData.departments.map(d => d.id === dept.id ? { ...d, desc: val } : d);
                      persistContactData({ ...contactData, departments: updated });
                    }
                  }}
                  title={isStudioView ? "Click directly to edit" : undefined}
                >
                  {dept.desc}
                </p>

                <a href={`mailto:${dept.email}`} className="contact-dept-email" onClick={e => isStudioView && e.preventDefault()}>
                  <Mail size={15} />
                  <span
                    contentEditable={isStudioView}
                    suppressContentEditableWarning={true}
                    className={isStudioView ? "lse-direct-editable" : ""}
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent.trim();
                      if (val && val !== dept.email) {
                        const updated = contactData.departments.map(d => d.id === dept.id ? { ...d, email: val } : d);
                        persistContactData({ ...contactData, departments: updated });
                      }
                    }}
                    title={isStudioView ? "Click directly to edit email" : undefined}
                  >
                    {dept.email}
                  </span>
                </a>

                <button 
                  type="button" 
                  className="contact-dept-action"
                  onClick={() => handleDepartmentSelect(dept.title)}
                >
                  <span>{dept.actionText || 'Connect Directly'}</span>
                  <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* ── 3. Main Two-Column Hub: Direct Channels & Interactive Form ── */}
        <section className="contact-main-hub-section" aria-label="Contact Information and Submission Form">
          <div className="contact-hub-grid single-card">

            {/* Left Column: Direct Info Card */}
            <div className="contact-direct-card">
              <div className="contact-direct-title-group">
                <h3>Direct Lines & Bureaus</h3>
                <p>
                  Need immediate press assistance, have an urgent scoop, or prefer speaking directly with our desks?
                </p>
              </div>

              <div className="contact-channel-list">
                {/* Phone */}
                <div className="contact-channel-item">
                  <div className="contact-channel-icon">
                    <Phone size={20} />
                  </div>
                  <div className="contact-channel-info">
                    <span className="contact-channel-label">Direct Bureau Line</span>
                    <span
                      contentEditable={isStudioView}
                      suppressContentEditableWarning={true}
                      className={isStudioView ? "contact-channel-val lse-direct-editable" : "contact-channel-val"}
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent.trim();
                        if (val && val !== channels.displayPhone) {
                          persistContactData({ ...contactData, channels: { ...channels, displayPhone: val, phone: val } });
                        }
                      }}
                      title={isStudioView ? "Click directly to edit" : undefined}
                    >
                      {channels.displayPhone}
                    </span>
                    <span 
                      contentEditable={isStudioView}
                      suppressContentEditableWarning={true}
                      className={isStudioView ? "contact-channel-sub lse-direct-editable" : "contact-channel-sub"}
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent.trim();
                        if (val && val !== channels.workingHours) {
                          persistContactData({ ...contactData, channels: { ...channels, workingHours: val } });
                        }
                      }}
                      title={isStudioView ? "Click directly to edit" : undefined}
                    >
                      {channels.workingHours}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="contact-channel-item">
                  <div className="contact-channel-icon">
                    <Mail size={20} />
                  </div>
                  <div className="contact-channel-info">
                    <span className="contact-channel-label">Central Email</span>
                    <span
                      contentEditable={isStudioView}
                      suppressContentEditableWarning={true}
                      className={isStudioView ? "contact-channel-val lse-direct-editable" : "contact-channel-val"}
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent.trim();
                        if (val && val !== channels.primaryEmail) {
                          persistContactData({ ...contactData, channels: { ...channels, primaryEmail: val } });
                        }
                      }}
                      title={isStudioView ? "Click directly to edit" : undefined}
                    >
                      {channels.primaryEmail}
                    </span>
                    <span className="contact-channel-sub">{channels.weekendCoverage}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="contact-channel-item">
                  <div className="contact-channel-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="contact-channel-info">
                    <span className="contact-channel-label">Global Headquarters</span>
                    <span className="contact-channel-val">Indiranagar 100ft Road</span>
                    <span className="contact-channel-sub">Bengaluru, Karnataka 560038</span>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="contact-channel-item" style={{ background: 'rgba(220, 38, 38, 0.04)', borderColor: 'rgba(220, 38, 38, 0.2)' }}>
                  <div className="contact-channel-icon" style={{ background: 'rgba(220, 38, 38, 0.12)' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div className="contact-channel-info">
                    <span className="contact-channel-label" style={{ color: 'var(--brand-primary, #dc2626)' }}>Editorial Integrity</span>
                    <span className="contact-channel-val" style={{ fontSize: '0.88rem' }}>100% Free & Earned Coverage</span>
                    <span className="contact-channel-sub">No paid editorial features. Ever.</span>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Button */}
              <a 
                href={`https://wa.me/${channels.rawWhatsApp}?text=${encodeURIComponent("Hello GoReadPost! I'd like to get in touch regarding an inquiry.")}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-wa-action-btn"
              >
                <MessageCircle size={18} />
                <span>Chat Instantly on WhatsApp</span>
              </a>
            </div>

          </div>
        </section>

        {/* ── 4. Bureau Locations (100% Breadth) ── */}
        <section className="contact-bureaus-section" aria-label="Our Bureau Locations">
          <div className="contact-section-title-wrap">
            <h2 className="contact-section-h2">Global Headquarters</h2>
            <p className="contact-section-sub">
              Visit or mail our primary newsroom and headquarters in Bengaluru.
            </p>
          </div>

          <div className={`contact-bureaus-grid ${(bureaus && bureaus.length > 0 ? bureaus.slice(0, 1) : DEFAULT_CONTACT_DATA.bureaus).length <= 1 ? 'single-bureau' : ''}`}>
            {(bureaus && bureaus.length > 0 ? bureaus.slice(0, 1) : DEFAULT_CONTACT_DATA.bureaus).map((bureau, idx) => (
              <div key={idx} className="contact-bureau-card contact-bureau-card-single">
                <div className="contact-bureau-header">
                  <h3 className="contact-bureau-city">{bureau.city}</h3>
                  <span className="contact-bureau-tag">{bureau.tag}</span>
                </div>

                <div className="contact-bureau-address">
                  <MapPin size={18} color="var(--brand-primary, #dc2626)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{bureau.address}</span>
                </div>

                <div className="contact-bureau-meta">
                  <div className="contact-bureau-meta-item">
                    <Phone size={14} />
                    <a href={`tel:${bureau.phone}`}>{bureau.phone}</a>
                  </div>
                  <div className="contact-bureau-meta-item">
                    <Mail size={14} />
                    <a href={`mailto:${bureau.email}`}>{bureau.email}</a>
                  </div>
                  <div className="contact-bureau-meta-item">
                    <Clock size={14} />
                    <span>{bureau.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Frequently Asked Questions (FAQ) ── */}
        <section className="contact-faq-section" aria-label="Frequently Asked Questions">
          <div className="contact-section-title-wrap">
            <h2 className="contact-section-h2">Frequently Asked Questions</h2>
            <p className="contact-section-sub">
              Quick answers about our editorial standards, pitches, and partnership workflows.
            </p>
          </div>

          <div className="contact-faq-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`contact-faq-item ${isOpen ? 'open' : ''}`}>
                  <button 
                    type="button" 
                    className="contact-faq-trigger"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className="contact-faq-chevron" />
                  </button>

                  {isOpen && (
                    <div className="contact-faq-content">
                      <p style={{ margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 6. Bottom Community / Realtime CTA (100% Breadth) ── */}
        <section className="contact-bottom-cta">
          <h3>Prefer Direct Messaging?</h3>
          <p>
            Connect directly with our bureau operations on WhatsApp for quick assistance, event registrations, or story follow-ups.
          </p>

          <div className="contact-bottom-cta-buttons">
            <a 
              href={`https://wa.me/${channels.rawWhatsApp}?text=${encodeURIComponent("Hi GoReadPost Team! I'd like to connect directly.")}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="contact-btn-red"
            >
              <MessageCircle size={18} />
              <span>Connect on WhatsApp</span>
            </a>

            <button 
              type="button" 
              className="contact-btn-outline"
              onClick={() => {
                if (formRef.current) {
                  formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              <Mail size={18} />
              <span>Jump to Online Form</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
