import React, { useState } from 'react';
import { X, Send, Building, Link, DollarSign, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubmissionService } from '../services/submissionService';

export default function PitchModal({ isOpen, onClose, onAddStory, onShowToast }) {
  const [formData, setFormData] = useState({
    startupName: '',
    founderName: '',
    founderRole: 'Founder & CEO',
    sector: 'AI & Deep Tech',
    stage: 'Seed / Early Stage',
    website: '',
    metricMoat: '',
    headline: '',
    summary: '',
    details: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startupName || !formData.headline || !formData.summary) {
      onShowToast("Please fill in the required fields: Startup Name, Headline, and Summary.");
      return;
    }

    // Save pitch to database
    try {
      await SubmissionService.createSubmission({
        type: 'pitch',
        ...formData,
        name: formData.founderName,
        subject: formData.headline,
        message: formData.summary
      });
    } catch (err) {
      console.warn('Could not save submission to server DB:', err);
    }

    // Create a new story entry
    const newStory = {
      id: `pitch-${Date.now()}`,
      isHero: false,
      isTopPick: false,
      title: formData.headline,
      subtitle: `${formData.startupName} is founded by ${formData.founderName}. ${formData.metricMoat ? `Key metric: ${formData.metricMoat}` : ''}`,
      category: formData.sector.toLowerCase().includes('ai') ? 'deep-tech' : 'founder-first',
      categoryLabel: formData.sector,
      author: {
        name: formData.founderName || "Community Founder",
        title: `${formData.founderRole}, ${formData.startupName}`,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
      },
      publishedAt: "Just now",
      readTime: "4 min read",
      claps: 15,
      commentsCount: 0,
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
      fallbackImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
      tags: [formData.startupName, formData.sector, formData.stage],
      summary: formData.summary,
      content: [
        formData.summary,
        formData.details || `Built by ${formData.founderName} and team, ${formData.startupName} represents a new generation of high-velocity builders targeting large underserved enterprise and consumer markets.`,
        formData.metricMoat ? `Operational Moat: ${formData.metricMoat}` : `Website & Product Demo: ${formData.website || 'Available upon request.'}`
      ]
    };

    onAddStory(newStory);
    onShowToast(`🎉 Congratulations! "${formData.startupName}" has been published to the GoReadPost live feed!`);
    
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pitch-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="section-icon-badge" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>
              <Send size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800' }}>Pitch Your Startup to GoReadPost</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Get featured before 350,000+ tech investors, operators, and founders</p>
            </div>
          </div>
          <button className="reader-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Startup / Company Name *</label>
              <input 
                type="text" 
                name="startupName"
                className="form-input"
                placeholder="e.g. Neuraflow AI" 
                value={formData.startupName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Founder Name &amp; Title *</label>
              <input 
                type="text" 
                name="founderName"
                className="form-input"
                placeholder="e.g. Ananya Roy, Co-founder &amp; CEO" 
                value={formData.founderName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industry Sector</label>
              <select 
                name="sector" 
                className="form-select"
                value={formData.sector}
                onChange={handleChange}
              >
                <option value="AI & Deep Tech">AI &amp; Deep Tech</option>
                <option value="Founder First">Founder First / D2C</option>
                <option value="Fintech & Web3">Fintech &amp; Web3</option>
                <option value="Enterprise & SaaS">Enterprise &amp; SaaS</option>
                <option value="SpaceTech & Robotics">SpaceTech &amp; Robotics</option>
                <option value="Climate & CleanTech">Climate &amp; CleanTech</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Funding Stage</label>
              <select 
                name="stage" 
                className="form-select"
                value={formData.stage}
                onChange={handleChange}
              >
                <option value="Bootstrapped">Bootstrapped &amp; Profitable</option>
                <option value="Pre-Seed">Pre-Seed ($50k - $250k)</option>
                <option value="Seed">Seed ($500k - $2M)</option>
                <option value="Series A+">Series A / Growth ($5M+)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Story Headline / Tagline *</label>
            <input 
              type="text" 
              name="headline"
              className="form-input"
              placeholder="e.g. How Neuraflow Built Edge AI Chips That Slash Cloud Inferencing By 80%" 
              value={formData.headline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Metric / Operational Moat</label>
            <input 
              type="text" 
              name="metricMoat"
              className="form-input"
              placeholder="e.g. $1.4M ARR, 45 Enterprise Pilots, 3 US Patents" 
              value={formData.metricMoat}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Elevator Pitch &amp; Summary (1-2 sentences) *</label>
            <textarea 
              name="summary"
              className="form-textarea"
              rows={2}
              placeholder="Explain clearly what bottleneck you are solving and why your product is 10x better than existing alternatives..."
              value={formData.summary}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Story &amp; Founder Journey Details</label>
            <textarea 
              name="details"
              className="form-textarea"
              rows={4}
              placeholder="Tell us about the inception moment, major engineering hurdles, customer testimonials, and what lies ahead in your roadmap..."
              value={formData.details}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.65rem 1.25rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Cancel
            </button>
            <button type="submit" className="pitch-btn" style={{ padding: '0.65rem 1.5rem' }}>
              <Send size={15} />
              <span>Publish Story Live</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
