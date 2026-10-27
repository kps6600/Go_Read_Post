import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function DynamicFAQ({ data = {} }) {
  const title = data.title || data.heading || 'Frequently Asked Questions';
  const subtitle = data.subtitle || data.subheading || 'Everything you need to know about our services, editorial timelines, and onboarding process.';
  const faqs = Array.isArray(data.faqs) ? data.faqs : [];

  const defaultFaqs = [
    {
      question: 'How quickly can our brand feature story go live?',
      answer: 'Once our editorial brief is finalized and approved, standard turnaround for written stories is 48 to 72 business hours, with immediate cross-network syndication.'
    },
    {
      question: 'Can we customize the dynamic sections on our landing page?',
      answer: 'Yes! Our custom section builder allows you to drag-and-drop, add, toggle, or edit Hero banners, Services grids, Portfolio cards, Testimonials, and CTAs in real-time from the Admin CMS.'
    },
    {
      question: 'What analytics and performance reports do you provide?',
      answer: 'We provide real-time reader impression counts, claps, average engagement time, referral traffic breakdowns, and Google Analytics event integration.'
    },
    {
      question: 'How do you ensure enterprise-grade security and uptime?',
      answer: 'All pages are served via cached JSON micro-APIs backed by MongoDB Atlas, encrypted with JWT tokens, and protected against unauthorized mutation.'
    }
  ];

  const items = faqs.length > 0 
    ? faqs 
    : (Array.isArray(data.items) && data.items.length > 0) 
      ? data.items 
      : defaultFaqs;
  const [openIndices, setOpenIndices] = useState([0]);

  const toggleIndex = (i) => {
    setOpenIndices(prev => 
      prev.includes(i) ? prev.filter(idx => idx !== i) : [...prev, i]
    );
  };

  return (
    <section className="dyn-section dyn-faq-section" style={{ width: '100%' }}>
      <div className="dyn-container" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="dyn-section-header">
          <span className="dyn-section-badge">FAQ</span>
          <h2 className="dyn-section-title">{title}</h2>
          {subtitle && <p className="dyn-section-subtitle">{subtitle}</p>}
        </div>

        <div className="dyn-faq-list">
          {items.map((faq, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div key={idx} className={`dyn-faq-item ${isOpen ? 'open' : ''}`}>
                <button 
                  type="button" 
                  className="dyn-faq-trigger"
                  onClick={() => toggleIndex(idx)}
                >
                  <span className="dyn-faq-question">{faq.question}</span>
                  <ChevronDown size={18} className={`dyn-faq-arrow ${isOpen ? 'rotate' : ''}`} />
                </button>
                {isOpen && (
                  <div className="dyn-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
