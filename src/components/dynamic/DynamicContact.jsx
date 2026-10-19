import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import { SubmissionService } from '../../services/submissionService';

export default function DynamicContact({ data = {} }) {
  const {
    title = 'Get in Touch With Our Team',
    subtitle = 'Have a question or looking to launch a tailored campaign? Reach out today.',
    email = 'contact@goreadpost.com',
    phone = '+91 80 4123 4567',
    address = 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038'
  } = data;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await SubmissionService.createSubmission({
        type: 'contact',
        ...form
      });
    } catch (err) {
      console.warn('Error saving contact message to server DB:', err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <section id="contact" className="dyn-section dyn-contact-section">
      <div className="dyn-container">
        <div className="dyn-section-header">
          <span className="dyn-section-badge">CONNECT</span>
          <h2 className="dyn-section-title">{title}</h2>
          {subtitle && <p className="dyn-section-subtitle">{subtitle}</p>}
        </div>

        <div className="dyn-contact-grid">
          {/* Left: Contact Info */}
          <div className="dyn-contact-info-card">
            <h3>Let's talk about your next milestone</h3>
            <p>Our editorial and growth strategists are available Mon - Fri, 9am to 6pm IST.</p>

            <div className="dyn-contact-details">
              {email && (
                <div className="dyn-contact-item">
                  <div className="dyn-contact-icon"><Mail size={18} /></div>
                  <div>
                    <span className="dyn-contact-label">Email Us</span>
                    <a href={`mailto:${email}`} className="dyn-contact-val">{email}</a>
                  </div>
                </div>
              )}

              {phone && (
                <div className="dyn-contact-item">
                  <div className="dyn-contact-icon"><Phone size={18} /></div>
                  <div>
                    <span className="dyn-contact-label">Call Direct</span>
                    <a href={`tel:${phone}`} className="dyn-contact-val">{phone}</a>
                  </div>
                </div>
              )}

              {address && (
                <div className="dyn-contact-item">
                  <div className="dyn-contact-icon"><MapPin size={18} /></div>
                  <div>
                    <span className="dyn-contact-label">HQ Office</span>
                    <span className="dyn-contact-val">{address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="dyn-contact-form-card">
            {submitted ? (
              <div className="dyn-form-success">
                <CheckCircle size={48} color="#10b981" />
                <h3>Thank you for reaching out!</h3>
                <p>We have received your message and will respond within 24 hours.</p>
                <button 
                  className="dyn-btn-secondary" 
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="dyn-form">
                <div className="dyn-form-row">
                  <div className="dyn-form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Priya Sharma" 
                      required 
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })} 
                    />
                  </div>
                  <div className="dyn-form-group">
                    <label>Work Email *</label>
                    <input 
                      type="email" 
                      placeholder="priya@company.com" 
                      required 
                      value={form.email} 
                      onChange={e => setForm({ ...form, email: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="dyn-form-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Brand Partnership / Feature Request" 
                    value={form.subject} 
                    onChange={e => setForm({ ...form, subject: e.target.value })} 
                  />
                </div>

                <div className="dyn-form-group">
                  <label>Message *</label>
                  <textarea 
                    rows={4} 
                    placeholder="Tell us about your venture, timeline, and goals..." 
                    required 
                    value={form.message} 
                    onChange={e => setForm({ ...form, message: e.target.value })} 
                  />
                </div>

                <button type="submit" className="dyn-btn-primary full">
                  <span>Send Message</span>
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
