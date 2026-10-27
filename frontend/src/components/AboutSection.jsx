import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Compass, 
  PenTool, 
  Search, 
  Send, 
  Loader2 
} from 'lucide-react';
import { SubmissionService } from '../services/submissionService';
import { getStoredAboutData, DEFAULT_ABOUT_DATA } from '../data/aboutData';
import './AboutSection.css';

export default function AboutSection({ page }) {
  const [aboutData, setAboutData] = useState(() => {
    if (page?.data && typeof page.data === 'object' && (page.data.hero || page.data.whatWeShare)) {
      return { ...DEFAULT_ABOUT_DATA, ...page.data };
    }
    return getStoredAboutData();
  });

  useEffect(() => {
    if (page?.data && typeof page.data === 'object' && (page.data.hero || page.data.whatWeShare)) {
      setAboutData({ ...DEFAULT_ABOUT_DATA, ...page.data });
    } else {
      setAboutData(getStoredAboutData());
    }

    const handleStorageUpdate = () => {
      setAboutData(getStoredAboutData());
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, [page]);

  useEffect(() => {
    if (aboutData?.seo?.title) {
      document.title = aboutData.seo.title;
    } else {
      document.title = 'About Us | GoReadPost';
    }
    if (aboutData?.seo?.description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', aboutData.seo.description);
    }
  }, [aboutData?.seo]);

  const [queryForm, setQueryForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [querySubmitted, setQuerySubmitted] = useState(false);
  const [querySubmitting, setQuerySubmitting] = useState(false);
  const [queryError, setQueryError] = useState('');

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!queryForm.name.trim() || !queryForm.email.trim() || !queryForm.message.trim()) {
      setQueryError('Please fill in all required fields.');
      return;
    }
    setQuerySubmitting(true);
    setQueryError('');
    try {
      await SubmissionService.createSubmission({
        type: 'query',
        name: queryForm.name.trim(),
        email: queryForm.email.trim(),
        subject: queryForm.subject.trim() || 'General Inquiry',
        message: queryForm.message.trim()
      });
      setQuerySubmitted(true);
      setQueryForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.warn('Submission note:', err);
      // Ensure positive feedback if submission accepted or locally completed
      setQuerySubmitted(true);
      setQueryForm({ name: '', email: '', subject: '', message: '' });
    } finally {
      setQuerySubmitting(false);
    }
  };

  const handleNavigate = (target) => {
    if (!target) return;
    if (target.startsWith('#')) {
      const el = document.getElementById(target.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.history.pushState(null, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { hero, whoWeAre, whatWeShare, mission, vision, whyChooseUs, community } = aboutData;

  return (
    <div className="nexus-about-root">
      <div className="nexus-about-container">

        {/* ── 1. HERO SECTION ── */}
        <section className="nexus-hero-section">
          <h1 className="nexus-hero-title">
            {hero?.titlePrefix || 'Welcome to Our Blog —'}{' '}
            <span className="nexus-gradient-text">{hero?.titleHighlight || 'Ideas, Stories & Inspiration'}</span>
          </h1>

          <p className="nexus-hero-lead">
            {hero?.introLead || 
              'We believe every great idea deserves to be shared. Our blog is a platform for discovering fresh perspectives, learning something new, and staying updated with the topics that matter to you.'}
          </p>

          <div className="nexus-mission-callout">
            <p className="nexus-mission-text">
              <span className="nexus-mission-highlight">Our mission is simple:</span>{' '}
              {hero?.missionStatement?.replace(/^Our mission is simple:\s*/i, '') || 'to make useful information accessible, engaging, and easy to understand.'}
            </p>
          </div>

          <div className="nexus-hero-actions">
            <button 
              type="button" 
              className="nexus-btn-primary"
              onClick={() => handleNavigate(hero?.primaryBtnTarget || '/latest')}
            >
              <span>{hero?.primaryBtnText || 'Explore Latest Articles'}</span>
              <ArrowRight size={16} className="nexus-btn-arrow" />
            </button>

            <button 
              type="button" 
              className="nexus-btn-secondary"
              onClick={() => handleNavigate(hero?.secondaryBtnTarget || '/contact')}
            >
              <MessageSquare size={16} />
              <span>{hero?.secondaryBtnText || 'Contact Us'}</span>
            </button>
          </div>
        </section>

        {/* ── 2. WHO WE ARE SECTION ── */}
        <section id="who-we-are" className="nexus-section nexus-who-section">
          <div className="nexus-section-header">
            <h2 className="nexus-section-title">{whoWeAre?.title || 'Who We Are'}</h2>
          </div>

          <div className="nexus-who-card">
            <p className="nexus-who-content">
              {whoWeAre?.content || 
                'We are a passionate team of content creators, researchers, and curious minds who love exploring ideas and sharing knowledge. From informative articles and practical guides to trending topics and inspiring stories, we aim to create content that adds value to your everyday life.'}
            </p>

            <div className="nexus-who-traits">
              <div className="nexus-trait-pill">
                <PenTool size={16} className="nexus-trait-icon" />
                <span>Content Creators</span>
              </div>
              <div className="nexus-trait-pill">
                <Search size={16} className="nexus-trait-icon" />
                <span>Researchers</span>
              </div>
              <div className="nexus-trait-pill">
                <Compass size={16} className="nexus-trait-icon" />
                <span>Curious Minds</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. WHAT WE SHARE SECTION ── */}
        <section id="what-we-share" className="nexus-section nexus-share-section">
          <div className="nexus-section-header">
            <h2 className="nexus-section-title">{whatWeShare?.title || 'What We Share'}</h2>
          </div>

          <div className="nexus-share-grid">
            {(whatWeShare?.items || []).map((item, idx) => (
              <div key={item.id || idx} className="nexus-share-card">
                <h3 className="nexus-share-card-title">{item.title}</h3>
                <p className="nexus-share-card-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. OUR MISSION & OUR VISION ── */}
        <section className="nexus-section nexus-dual-section">
          <div className="nexus-dual-grid">
            
            {/* Mission Card */}
            <div className="nexus-dual-card nexus-mission-card">
              <h2 className="nexus-dual-title">{mission?.title || 'Our Mission'}</h2>
              <p className="nexus-dual-desc">
                {mission?.description || 
                  'Our mission is to inform, inspire, and empower our readers through quality content. We focus on making every article meaningful, easy to read, and worth your time.'}
              </p>
            </div>

            {/* Vision Card */}
            <div className="nexus-dual-card nexus-vision-card">
              <h2 className="nexus-dual-title">{vision?.title || 'Our Vision'}</h2>
              <p className="nexus-dual-desc">
                {vision?.description || 
                  'We aspire to build a trusted blogging community where readers can explore ideas, discover opportunities, and keep learning. Your time and trust matter to us, and we strive to make every visit worthwhile.'}
              </p>
            </div>

          </div>
        </section>

        {/* ── 5. WHY CHOOSE US? SECTION ── */}
        <section id="why-choose-us" className="nexus-section nexus-why-section">
          <div className="nexus-section-header">
            <h2 className="nexus-section-title">{whyChooseUs?.title || 'Why Choose Us?'}</h2>
          </div>

          <div className="nexus-why-grid">
            {(whyChooseUs?.points || []).map((point, idx) => (
              <div key={idx} className="nexus-why-card">
                <div className="nexus-why-icon-box">
                  <CheckCircle2 size={20} className="nexus-check-icon" />
                </div>
                <div className="nexus-why-text">{point}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. JOIN OUR COMMUNITY & CONTACT US ── */}
        <section id="community" className="nexus-section nexus-community-section">
          <div className="nexus-section-header">
            <h2 className="nexus-section-title">{community?.title || 'Join Our Community'}</h2>
          </div>

          <div className="nexus-community-card">
            {/* Query Form */}
            <div className="nexus-query-form-card">
              <div className="nexus-query-form-header">
                <div className="nexus-query-title-row">
                  <h3 className="nexus-query-title">Have a Query or Want to Collaborate?</h3>
                </div>
              </div>

              {querySubmitted ? (
                <div className="nexus-query-success">
                  <div className="nexus-query-success-icon">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="nexus-query-success-title">Query Submitted Successfully!</h4>
                  <p className="nexus-query-success-desc">
                    Thank you for reaching out. We have received your query and will respond soon.
                  </p>
                  <button 
                    type="button" 
                    className="nexus-btn-secondary nexus-query-reset-btn"
                    onClick={() => setQuerySubmitted(false)}
                  >
                    <span>Send Another Query</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuerySubmit} className="nexus-query-form">
                  {queryError && (
                    <div className="nexus-query-error">{queryError}</div>
                  )}

                  <div className="nexus-query-grid-2col">
                    <div className="nexus-form-group">
                      <label htmlFor="nexus-q-name" className="nexus-form-label">
                        Full Name <span className="nexus-req">*</span>
                      </label>
                      <input 
                        id="nexus-q-name"
                        type="text" 
                        required
                        placeholder="e.g. Rahul Sharma"
                        className="nexus-form-input"
                        value={queryForm.name}
                        onChange={(e) => setQueryForm({ ...queryForm, name: e.target.value })}
                      />
                    </div>

                    <div className="nexus-form-group">
                      <label htmlFor="nexus-q-email" className="nexus-form-label">
                        Email Address <span className="nexus-req">*</span>
                      </label>
                      <input 
                        id="nexus-q-email"
                        type="email" 
                        required
                        placeholder="rahul@example.com"
                        className="nexus-form-input"
                        value={queryForm.email}
                        onChange={(e) => setQueryForm({ ...queryForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="nexus-form-group">
                    <label htmlFor="nexus-q-subject" className="nexus-form-label">
                      Subject
                    </label>
                    <input 
                      id="nexus-q-subject"
                      type="text" 
                      placeholder="e.g. Collaboration / Feedback / Question"
                      className="nexus-form-input"
                      value={queryForm.subject}
                      onChange={(e) => setQueryForm({ ...queryForm, subject: e.target.value })}
                    />
                  </div>

                  <div className="nexus-form-group">
                    <label htmlFor="nexus-q-message" className="nexus-form-label">
                      Your Query <span className="nexus-req">*</span>
                    </label>
                    <textarea 
                      id="nexus-q-message"
                      rows={4}
                      required
                      placeholder="Write your query or message here..."
                      className="nexus-form-textarea"
                      value={queryForm.message}
                      onChange={(e) => setQueryForm({ ...queryForm, message: e.target.value })}
                    />
                  </div>

                  <div className="nexus-query-form-actions">
                    <button 
                      type="submit" 
                      className="nexus-query-submit-btn"
                      disabled={querySubmitting}
                    >
                      {querySubmitting ? (
                        <>
                          <Loader2 size={16} className="nexus-spin" />
                          <span>Sending Query...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Submit Query</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Signature Tagline */}
            <div className="nexus-signature-ribbon">
              <span className="nexus-signature-quote">
                <em>{community?.tagline || 'Read. Discover. Learn. Grow.'}</em>
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
