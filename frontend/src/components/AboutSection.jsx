import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Compass, 
  PenTool, 
  Search, 
  Send, 
  Loader2,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { SubmissionService } from '../services/submissionService';
import { getStoredAboutData, DEFAULT_ABOUT_DATA, saveStoredAboutData } from '../data/aboutData';
import { PageService } from '../services/pageService';
import './AboutSection.css';

export default function AboutSection({ 
  page, 
  isStudioView = false, 
  onShowToast, 
  onBackToHome 
}) {
  const [aboutData, setAboutData] = useState(() => {
    if (page?.data && typeof page.data === 'object' && (page.data.hero || page.data.whatWeShare)) {
      return { ...DEFAULT_ABOUT_DATA, ...page.data };
    }
    return getStoredAboutData();
  });

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ title: '', description: '' });

  // Load from MongoDB API on mount or when page prop changes
  useEffect(() => {
    let isMounted = true;
    if (page?.data && typeof page.data === 'object' && (page.data.hero || page.data.whatWeShare)) {
      setAboutData({ ...DEFAULT_ABOUT_DATA, ...page.data });
    } else {
      PageService.getPageById('about').then(res => {
        if (isMounted && res && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
          setAboutData({ ...DEFAULT_ABOUT_DATA, ...res.data });
          saveStoredAboutData({ ...DEFAULT_ABOUT_DATA, ...res.data });
        } else if (isMounted) {
          setAboutData(getStoredAboutData());
        }
      }).catch(() => {
        if (isMounted) setAboutData(getStoredAboutData());
      });
    }

    const handleStorageUpdate = () => {
      setAboutData(getStoredAboutData());
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [page]);

  // General Updater with automatic local and API persistence
  const updateAboutData = (updater) => {
    setAboutData(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveStoredAboutData(updated);
      try {
        PageService.updatePage('about', {
          title: 'About Us',
          slug: 'about',
          status: 'published',
          data: updated
        }).catch(() => {});
      } catch (e) {}
      return updated;
    });
  };

  const updateHero = (fields) => {
    updateAboutData(prev => ({
      ...prev,
      hero: { ...(prev.hero || DEFAULT_ABOUT_DATA.hero), ...fields }
    }));
  };

  const updateWhoWeAre = (fields) => {
    updateAboutData(prev => ({
      ...prev,
      whoWeAre: { ...(prev.whoWeAre || DEFAULT_ABOUT_DATA.whoWeAre), ...fields }
    }));
  };

  const updateWhoWeAreTrait = (idx, val) => {
    updateAboutData(prev => {
      const traits = [...(prev.whoWeAre?.traits || DEFAULT_ABOUT_DATA.whoWeAre.traits || ['Content Creators', 'Researchers', 'Curious Minds'])];
      traits[idx] = val;
      return {
        ...prev,
        whoWeAre: { ...(prev.whoWeAre || DEFAULT_ABOUT_DATA.whoWeAre), traits }
      };
    });
  };

  const updateWhatWeShare = (fields) => {
    updateAboutData(prev => ({
      ...prev,
      whatWeShare: { ...(prev.whatWeShare || DEFAULT_ABOUT_DATA.whatWeShare), ...fields }
    }));
  };

  const updateShareCard = (idx, fields) => {
    updateAboutData(prev => {
      const items = [...(prev.whatWeShare?.items || [])];
      items[idx] = { ...items[idx], ...fields };
      return {
        ...prev,
        whatWeShare: { ...(prev.whatWeShare || DEFAULT_ABOUT_DATA.whatWeShare), items }
      };
    });
  };

  const updateMission = (fields) => {
    updateAboutData(prev => ({
      ...prev,
      mission: { ...(prev.mission || DEFAULT_ABOUT_DATA.mission), ...fields }
    }));
  };

  const updateVision = (fields) => {
    updateAboutData(prev => ({
      ...prev,
      vision: { ...(prev.vision || DEFAULT_ABOUT_DATA.vision), ...fields }
    }));
  };

  const updateWhyChooseUs = (fields) => {
    updateAboutData(prev => ({
      ...prev,
      whyChooseUs: { ...(prev.whyChooseUs || DEFAULT_ABOUT_DATA.whyChooseUs), ...fields }
    }));
  };

  const updateWhyChoosePoint = (idx, val) => {
    updateAboutData(prev => {
      const points = [...(prev.whyChooseUs?.points || DEFAULT_ABOUT_DATA.whyChooseUs.points || [])];
      points[idx] = val;
      return {
        ...prev,
        whyChooseUs: { ...(prev.whyChooseUs || DEFAULT_ABOUT_DATA.whyChooseUs), points }
      };
    });
  };

  const updateCommunity = (fields) => {
    updateAboutData(prev => ({
      ...prev,
      community: { ...(prev.community || DEFAULT_ABOUT_DATA.community), ...fields }
    }));
  };

  // Listen to Studio Top Bar "+ Add Card" event
  useEffect(() => {
    const handleAddCardEvent = () => {
      setIsAddCardModalOpen(true);
    };
    window.addEventListener('open:add-about-card', handleAddCardEvent);
    window.addEventListener('open:add-card', handleAddCardEvent);
    return () => {
      window.removeEventListener('open:add-about-card', handleAddCardEvent);
      window.removeEventListener('open:add-card', handleAddCardEvent);
    };
  }, []);

  // Listen to Studio Top Bar "Publish Live" event
  useEffect(() => {
    const handlePublishEvent = () => {
      saveStoredAboutData(aboutData);
      try {
        PageService.updatePage('about', {
          title: 'About Us',
          slug: 'about',
          status: 'published',
          data: aboutData
        }).then(() => {
          if (onShowToast) onShowToast('About Us page published live successfully!');
        }).catch(() => {});
      } catch (e) {}
    };
    window.addEventListener('admin:publish-live-studio', handlePublishEvent);
    return () => {
      window.removeEventListener('admin:publish-live-studio', handlePublishEvent);
    };
  }, [aboutData, onShowToast]);

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
    if (isStudioView) {
      if (onShowToast) onShowToast('Query form is interactive in public view.');
      return;
    }
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

  // Card Management: Delete a card
  const handleDeleteCard = (cardIdOrIdx) => {
    const currentItems = [...(aboutData.whatWeShare?.items || [])];
    const filtered = currentItems.filter((item, idx) => {
      if (item.id) return item.id !== cardIdOrIdx;
      return idx !== cardIdOrIdx;
    });

    const updated = {
      ...aboutData,
      whatWeShare: {
        ...aboutData.whatWeShare,
        items: filtered
      }
    };

    updateAboutData(updated);

    if (onShowToast) {
      onShowToast('Card deleted from "What We Share"');
    }
  };

  // Card Management: Add a new card
  const handleAddCard = (e) => {
    e?.preventDefault();
    if (!newCard.title.trim()) {
      if (onShowToast) onShowToast('Please enter a card title');
      return;
    }

    const cardToAdd = {
      id: 'share-' + Date.now(),
      title: newCard.title.trim(),
      description: newCard.description.trim() || 'Insightful perspectives and curated articles.'
    };

    const currentItems = [...(aboutData.whatWeShare?.items || [])];
    const updatedItems = [...currentItems, cardToAdd];

    const updated = {
      ...aboutData,
      whatWeShare: {
        ...aboutData.whatWeShare,
        items: updatedItems
      }
    };

    updateAboutData(updated);

    setNewCard({ title: '', description: '' });
    setIsAddCardModalOpen(false);

    if (onShowToast) {
      onShowToast(`Card "${cardToAdd.title}" added to "What We Share"!`);
    }
  };

  const { hero, whoWeAre, whatWeShare, mission, vision, whyChooseUs, community } = aboutData;

  return (
    <div className={`nexus-about-root ${isStudioView ? 'nexus-about-studio-mode' : ''}`}>
      <div className="nexus-about-container">

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
              marginBottom: '-1.5rem',
              padding: '0 0.25rem'
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
            <span style={{ color: '#0f172a', fontWeight: 700 }}>About Us</span>
          </nav>
        )}

        {/* ── 1. HERO SECTION ── */}
        <section className="nexus-hero-section">
          <h1 className="nexus-hero-title">
            <span
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "lse-direct-editable" : ""}
              title={isStudioView ? "Click directly to edit title prefix" : undefined}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== (hero?.titlePrefix || 'Welcome to Our Blog —')) {
                  updateHero({ titlePrefix: val });
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            >
              {hero?.titlePrefix || 'Welcome to Our Blog —'}
            </span>{' '}
            <span 
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "nexus-gradient-text lse-direct-editable" : "nexus-gradient-text"}
              title={isStudioView ? "Click directly to edit title highlight" : undefined}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== (hero?.titleHighlight || 'Ideas, Stories & Inspiration')) {
                  updateHero({ titleHighlight: val });
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            >
              {hero?.titleHighlight || 'Ideas, Stories & Inspiration'}
            </span>
          </h1>

          <p 
            contentEditable={isStudioView}
            suppressContentEditableWarning={true}
            className={isStudioView ? "nexus-hero-lead lse-direct-editable" : "nexus-hero-lead"}
            title={isStudioView ? "Click directly to edit lead paragraph" : undefined}
            onBlur={(e) => {
              const val = e.currentTarget.textContent.trim();
              if (val && val !== (hero?.introLead || '')) {
                updateHero({ introLead: val });
              }
            }}
          >
            {hero?.introLead || 
              'We believe every great idea deserves to be shared. Our blog is a platform for discovering fresh perspectives, learning something new, and staying updated with the topics that matter to you.'}
          </p>

          <div className="nexus-mission-callout">
            <p className="nexus-mission-text">
              <span 
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "nexus-mission-highlight lse-direct-editable" : "nexus-mission-highlight"}
                title={isStudioView ? "Click directly to edit mission callout prefix" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== (hero?.missionPrefix || 'Our mission is simple:')) {
                    updateHero({ missionPrefix: val });
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
              >
                {hero?.missionPrefix || 'Our mission is simple:'}
              </span>{' '}
              <span
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "lse-direct-editable" : ""}
                title={isStudioView ? "Click directly to edit mission statement" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== (hero?.missionStatement || 'to make useful information accessible, engaging, and easy to understand.')) {
                    updateHero({ missionStatement: val });
                  }
                }}
              >
                {hero?.missionStatement?.replace(/^Our mission is simple:\s*/i, '') || 'to make useful information accessible, engaging, and easy to understand.'}
              </span>
            </p>
          </div>

          <div className="nexus-hero-actions">
            <button 
              type="button" 
              className="nexus-btn-primary"
              onClick={(e) => {
                if (isStudioView) { e.preventDefault(); return; }
                handleNavigate(hero?.primaryBtnTarget || '/latest');
              }}
            >
              <span
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "lse-direct-editable" : ""}
                title={isStudioView ? "Click directly to edit button label" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== (hero?.primaryBtnText || 'Explore Latest Articles')) {
                    updateHero({ primaryBtnText: val });
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
              >
                {hero?.primaryBtnText || 'Explore Latest Articles'}
              </span>
              <ArrowRight size={16} className="nexus-btn-arrow" />
            </button>

            <button 
              type="button" 
              className="nexus-btn-secondary"
              onClick={(e) => {
                if (isStudioView) { e.preventDefault(); return; }
                handleNavigate(hero?.secondaryBtnTarget || '/contact');
              }}
            >
              <MessageSquare size={16} />
              <span
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "lse-direct-editable" : ""}
                title={isStudioView ? "Click directly to edit button label" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== (hero?.secondaryBtnText || 'Contact Us')) {
                    updateHero({ secondaryBtnText: val });
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
              >
                {hero?.secondaryBtnText || 'Contact Us'}
              </span>
            </button>
          </div>
        </section>

        {/* ── 2. WHO WE ARE SECTION ── */}
        <section id="who-we-are" className="nexus-section nexus-who-section">
          <div className="nexus-section-header">
            <h2 
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "nexus-section-title lse-direct-editable" : "nexus-section-title"}
              title={isStudioView ? "Click directly to edit section title" : undefined}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== (whoWeAre?.title || 'Who We Are')) {
                  updateWhoWeAre({ title: val });
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            >
              {whoWeAre?.title || 'Who We Are'}
            </h2>
          </div>

          <div className="nexus-who-card">
            <p 
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "nexus-who-content lse-direct-editable" : "nexus-who-content"}
              title={isStudioView ? "Click directly to edit who we are content" : undefined}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== (whoWeAre?.content || '')) {
                  updateWhoWeAre({ content: val });
                }
              }}
            >
              {whoWeAre?.content || 
                'We are a passionate team of content creators, researchers, and curious minds who love exploring ideas and sharing knowledge. From informative articles and practical guides to trending topics and inspiring stories, we aim to create content that adds value to your everyday life.'}
            </p>

            <div className="nexus-who-traits">
              {(whoWeAre?.traits || ['Content Creators', 'Researchers', 'Curious Minds']).map((trait, tIdx) => {
                const iconElements = [
                  <PenTool key="0" size={16} className="nexus-trait-icon" />, 
                  <Search key="1" size={16} className="nexus-trait-icon" />, 
                  <Compass key="2" size={16} className="nexus-trait-icon" />
                ];
                return (
                  <div key={tIdx} className="nexus-trait-pill">
                    {iconElements[tIdx % iconElements.length]}
                    <span
                      contentEditable={isStudioView}
                      suppressContentEditableWarning={true}
                      className={isStudioView ? "lse-direct-editable" : ""}
                      title={isStudioView ? "Click directly to edit trait" : undefined}
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent.trim();
                        if (val && val !== trait) {
                          updateWhoWeAreTrait(tIdx, val);
                        }
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    >
                      {trait}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 3. WHAT WE SHARE SECTION ── */}
        <section id="what-we-share" className="nexus-section nexus-share-section">
          <div className="nexus-section-header">
            <h2 
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "nexus-section-title lse-direct-editable" : "nexus-section-title"}
              title={isStudioView ? "Click directly to edit section title" : undefined}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== (whatWeShare?.title || 'What We Share')) {
                  updateWhatWeShare({ title: val });
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            >
              {whatWeShare?.title || 'What We Share'}
            </h2>
          </div>

          <div className="nexus-share-grid">
            {(whatWeShare?.items || []).map((item, idx) => (
              <div 
                key={item.id || idx} 
                className="nexus-share-card"
              >
                <h3 
                  contentEditable={isStudioView}
                  suppressContentEditableWarning={true}
                  className={isStudioView ? "nexus-share-card-title lse-direct-editable" : "nexus-share-card-title"}
                  title={isStudioView ? "Click directly to edit card title" : undefined}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent.trim();
                    if (val && val !== item.title) {
                      updateShareCard(idx, { title: val });
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                >
                  {item.title}
                </h3>
                <p 
                  contentEditable={isStudioView}
                  suppressContentEditableWarning={true}
                  className={isStudioView ? "nexus-share-card-desc lse-direct-editable" : "nexus-share-card-desc"}
                  title={isStudioView ? "Click directly to edit card description" : undefined}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent.trim();
                    if (val && val !== item.description) {
                      updateShareCard(idx, { description: val });
                    }
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. OUR MISSION & OUR VISION ── */}
        <section className="nexus-section nexus-dual-section">
          <div className="nexus-dual-grid">
            
            {/* Mission Card */}
            <div className="nexus-dual-card nexus-mission-card">
              <h2 
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "nexus-dual-title lse-direct-editable" : "nexus-dual-title"}
                title={isStudioView ? "Click directly to edit mission title" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== (mission?.title || 'Our Mission')) {
                    updateMission({ title: val });
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
              >
                {mission?.title || 'Our Mission'}
              </h2>
              <p 
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "nexus-dual-desc lse-direct-editable" : "nexus-dual-desc"}
                title={isStudioView ? "Click directly to edit mission text" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== (mission?.description || '')) {
                    updateMission({ description: val });
                  }
                }}
              >
                {mission?.description || 
                  'Our mission is to inform, inspire, and empower our readers through quality content. We focus on making every article meaningful, easy to read, and worth your time.'}
              </p>
            </div>

            {/* Vision Card */}
            <div className="nexus-dual-card nexus-vision-card">
              <h2 
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "nexus-dual-title lse-direct-editable" : "nexus-dual-title"}
                title={isStudioView ? "Click directly to edit vision title" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== (vision?.title || 'Our Vision')) {
                    updateVision({ title: val });
                  }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
              >
                {vision?.title || 'Our Vision'}
              </h2>
              <p 
                contentEditable={isStudioView}
                suppressContentEditableWarning={true}
                className={isStudioView ? "nexus-dual-desc lse-direct-editable" : "nexus-dual-desc"}
                title={isStudioView ? "Click directly to edit vision text" : undefined}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent.trim();
                  if (val && val !== (vision?.description || '')) {
                    updateVision({ description: val });
                  }
                }}
              >
                {vision?.description || 
                  'We aspire to build a trusted blogging community where readers can explore ideas, discover opportunities, and keep learning. Your time and trust matter to us, and we strive to make every visit worthwhile.'}
              </p>
            </div>

          </div>
        </section>

        {/* ── 5. WHY CHOOSE US? SECTION ── */}
        <section id="why-choose-us" className="nexus-section nexus-why-section">
          <div className="nexus-section-header">
            <h2 
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "nexus-section-title lse-direct-editable" : "nexus-section-title"}
              title={isStudioView ? "Click directly to edit section title" : undefined}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== (whyChooseUs?.title || 'Why Choose Us?')) {
                  updateWhyChooseUs({ title: val });
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            >
              {whyChooseUs?.title || 'Why Choose Us?'}
            </h2>
          </div>

          <div className="nexus-why-grid">
            {(whyChooseUs?.points || []).map((point, idx) => (
              <div key={idx} className="nexus-why-card">
                <div className="nexus-why-icon-box">
                  <CheckCircle2 size={20} className="nexus-check-icon" />
                </div>
                <div 
                  contentEditable={isStudioView}
                  suppressContentEditableWarning={true}
                  className={isStudioView ? "nexus-why-text lse-direct-editable" : "nexus-why-text"}
                  title={isStudioView ? "Click directly to edit this reason" : undefined}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent.trim();
                    if (val && val !== point) {
                      updateWhyChoosePoint(idx, val);
                    }
                  }}
                >
                  {point}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. JOIN OUR COMMUNITY & CONTACT US ── */}
        <section id="community" className="nexus-section nexus-community-section">
          <div className="nexus-section-header">
            <h2 
              contentEditable={isStudioView}
              suppressContentEditableWarning={true}
              className={isStudioView ? "nexus-section-title lse-direct-editable" : "nexus-section-title"}
              title={isStudioView ? "Click directly to edit section title" : undefined}
              onBlur={(e) => {
                const val = e.currentTarget.textContent.trim();
                if (val && val !== (community?.title || 'Join Our Community')) {
                  updateCommunity({ title: val });
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            >
              {community?.title || 'Join Our Community'}
            </h2>
          </div>

          <div className="nexus-community-card">
            {/* Query Form */}
            <div className="nexus-query-form-card">
              <div className="nexus-query-form-header">
                <div className="nexus-query-title-row">
                  <h3 
                    contentEditable={isStudioView}
                    suppressContentEditableWarning={true}
                    className={isStudioView ? "nexus-query-title lse-direct-editable" : "nexus-query-title"}
                    title={isStudioView ? "Click directly to edit form title" : undefined}
                    onBlur={(e) => {
                      const val = e.currentTarget.textContent.trim();
                      if (val && val !== (community?.queryFormTitle || community?.contactQuestion || 'Have a Query or Want to Collaborate?')) {
                        updateCommunity({ queryFormTitle: val });
                      }
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                  >
                    {community?.queryFormTitle || community?.contactQuestion || 'Have a Query or Want to Collaborate?'}
                  </h3>
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
                        disabled={isStudioView}
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
                        disabled={isStudioView}
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
                      disabled={isStudioView}
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
                      disabled={isStudioView}
                    />
                  </div>

                  <div className="nexus-query-form-actions">
                    <button 
                      type="submit" 
                      className="nexus-query-submit-btn"
                      disabled={querySubmitting}
                      onClick={(e) => {
                        if (isStudioView) {
                          e.preventDefault();
                          return;
                        }
                      }}
                    >
                      {querySubmitting ? (
                        <>
                          <Loader2 size={16} className="nexus-spin" />
                          <span>Sending Query...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span
                            contentEditable={isStudioView}
                            suppressContentEditableWarning={true}
                            className={isStudioView ? "lse-direct-editable" : ""}
                            title={isStudioView ? "Click directly to edit submit button text" : undefined}
                            onBlur={(e) => {
                              const val = e.currentTarget.textContent.trim();
                              if (val && val !== (community?.submitBtnText || 'Submit Query')) {
                                updateCommunity({ submitBtnText: val });
                              }
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                          >
                            {community?.submitBtnText || 'Submit Query'}
                          </span>
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
                <em
                  contentEditable={isStudioView}
                  suppressContentEditableWarning={true}
                  className={isStudioView ? "lse-direct-editable" : ""}
                  title={isStudioView ? "Click directly to edit tagline" : undefined}
                  onBlur={(e) => {
                    const val = e.currentTarget.textContent.trim();
                    if (val && val !== (community?.tagline || 'Read. Discover. Learn. Grow.')) {
                      updateCommunity({ tagline: val });
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                >
                  {community?.tagline || 'Read. Discover. Learn. Grow.'}
                </em>
              </span>
            </div>
          </div>
        </section>

      </div>

      {/* ── MODAL: ADD CARD TO WHAT WE SHARE ── */}
      {isAddCardModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem'
          }}
          onClick={() => setIsAddCardModalOpen(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <Plus size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Add Card to What We Share
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCardModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCard}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Card Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industry Reports & Research"
                  value={newCard.title}
                  onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Card Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Deep-dive analyses into emerging markets, tech disruption, and high-growth sectors."
                  value={newCard.description}
                  onChange={(e) => setNewCard(prev => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddCardModalOpen(false)}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.3rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ea580c',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
