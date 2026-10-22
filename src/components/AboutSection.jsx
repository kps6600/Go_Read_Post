import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Feather, Globe, ShieldCheck, 
  ExternalLink, MessageSquare, 
  ArrowDown, Users, CheckCircle2,
  Award, Zap
} from 'lucide-react';
import { getStoredAboutData, DEFAULT_ABOUT_DATA } from '../data/aboutData';
import './AboutSection.css';

const LinkedInIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.37c-.96 0-1.74.78-1.74 1.74 0 .96.78 1.74 1.74 1.74.96 0 1.74-.78 1.74-1.74 0-.96-.78-1.74-1.74Z"/>
  </svg>
);

const GitHubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const renderValueIcon = (iconName) => {
  switch ((iconName || '').toLowerCase()) {
    case 'globe':
      return <Globe size={20} />;
    case 'shield':
    case 'shieldcheck':
      return <ShieldCheck size={20} />;
    case 'zap':
      return <Zap size={20} />;
    case 'award':
      return <Award size={20} />;
    case 'feather':
    default:
      return <Feather size={20} />;
  }
};

export default function AboutSection({ page }) {
  const [aboutData, setAboutData] = useState(() => {
    if (page?.data && typeof page.data === 'object' && page.data.hero) {
      return { ...DEFAULT_ABOUT_DATA, ...page.data };
    }
    return getStoredAboutData();
  });

  useEffect(() => {
    if (page?.data && typeof page.data === 'object' && page.data.hero) {
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
      document.title = 'About Us | GoReadPost Media';
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

  const scrollToSection = (target) => {
    if (!target) return;
    if (target.startsWith('#')) {
      const el = document.getElementById(target.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.location.href = target;
  };

  const { hero, whoWeAre, statsBar, teamSection } = aboutData;

  return (
    <div className="nexus-about-root">
      <div className="nexus-about-container">

        {/* ── 1. HERO SECTION ── */}
        <section className="nexus-hero-section">
          <h1 className="nexus-hero-title">
            {hero?.titlePrefix || 'Where Thoughts Find Their'} <br className="nexus-hero-br" />
            <span className="nexus-gradient-text">{hero?.titleHighlight || 'Infinite Orbit'}</span>
          </h1>

          {hero?.subtitle && (
            <p className="nexus-hero-subtitle">
              {hero.subtitle}
            </p>
          )}

          <div className="nexus-hero-actions">
            {hero?.primaryBtnText && (
              <button 
                type="button" 
                className="nexus-btn-primary"
                onClick={() => scrollToSection(hero.primaryBtnTarget || '#who-we-are')}
              >
                <span>{hero.primaryBtnText}</span>
                <ArrowDown size={15} className="nexus-btn-arrow" />
              </button>
            )}

            {hero?.secondaryBtnText && (
              <button 
                type="button" 
                className="nexus-btn-secondary"
                onClick={() => scrollToSection(hero.secondaryBtnTarget || '#team')}
              >
                <span>{hero.secondaryBtnText}</span>
                <Users size={15} />
              </button>
            )}
          </div>

          {Array.isArray(hero?.trustStats) && hero.trustStats.length > 0 && (
            <div className="nexus-hero-trust-bar">
              {hero.trustStats.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <div className="nexus-trust-sep" />}
                  <div className="nexus-trust-item">
                    <span className="nexus-trust-bullet"></span>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </section>

        {/* ── 2. "WHO WE ARE" SPLIT SECTION ── */}
        <section id="who-we-are" className="nexus-who-section">
          <div className="nexus-who-grid">
            
            {/* Left Column: Narrative & Mini-Features */}
            <div className="nexus-who-left">
              <h2 className="nexus-who-title">
                {whoWeAre?.headingPrefix || 'Built for thinkers, writers, and '}
                <span className="nexus-teal-gradient">{whoWeAre?.headingHighlight || 'curious minds.'}</span>
              </h2>

              {whoWeAre?.paragraph1 && (
                <p className="nexus-who-p">
                  {whoWeAre.paragraph1}
                </p>
              )}

              {whoWeAre?.paragraph2 && (
                <p className="nexus-who-p">
                  {whoWeAre.paragraph2}
                </p>
              )}

              {Array.isArray(whoWeAre?.highlightCards) && whoWeAre.highlightCards.length > 0 && (
                <div className="nexus-highlight-row">
                  {whoWeAre.highlightCards.map((card, cIdx) => (
                    <div key={cIdx} className={`nexus-highlight-card ${card.accent || 'card-cyan-accent'}`}>
                      <h4 className="nexus-highlight-title">{card.title}</h4>
                      <p className="nexus-highlight-desc">{card.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Glass Value Card */}
            <div className="nexus-who-right">
              <div className="nexus-values-card">
                {Array.isArray(whoWeAre?.values) && whoWeAre.values.map((val, vIdx) => (
                  <React.Fragment key={val.id || vIdx}>
                    {vIdx > 0 && <div className="nexus-value-divider" />}
                    <div className="nexus-value-item">
                      <div className={`nexus-value-icon-box ${val.colorBox || 'box-blue'}`}>
                        {renderValueIcon(val.icon)}
                      </div>
                      <div className="nexus-value-content">
                        <h3 className="nexus-value-title">{val.title}</h3>
                        <p className="nexus-value-desc">{val.desc}</p>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── 3. IMPACT METRICS BAR ── */}
        {Array.isArray(statsBar?.stats) && statsBar.stats.length > 0 && (
          <section className="nexus-stats-section">
            <div className="nexus-stats-bar">
              {statsBar.stats.map((st, sIdx) => (
                <div key={sIdx} className="nexus-stat-col">
                  <div className={`nexus-stat-num ${st.isCyan ? 'cyan-stat' : ''}`}>{st.num}</div>
                  <div className="nexus-stat-label">{st.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. MEET OUR CORE TEAM ── */}
        {Array.isArray(teamSection?.members) && teamSection.members.length > 0 && (
          <section id="team" className="nexus-team-section">
            <div className="nexus-section-header-center">
              <h2 className="nexus-section-title">{teamSection.title || 'Meet Our Core Team'}</h2>
              {teamSection.subtitle && (
                <p className="nexus-section-desc">
                  {teamSection.subtitle}
                </p>
              )}
            </div>

            <div className="nexus-team-grid">
              {teamSection.members.map((member, idx) => (
                <div key={member.id || idx} className="nexus-team-card">
                  <div className="nexus-avatar-wrap">
                    <img 
                      src={member.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                      alt={member.name} 
                      className="nexus-team-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                      }}
                      loading="lazy"
                    />
                  </div>

                  <h3 className="nexus-team-name">{member.name}</h3>
                  <div className="nexus-team-role">{member.role}</div>
                  {member.bio && <p className="nexus-team-bio">{member.bio}</p>}

                  <div className="nexus-team-socials">
                    {member.linkedin && (
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="nexus-social-btn"
                        title="LinkedIn"
                      >
                        <LinkedInIcon size={16} />
                      </a>
                    )}
                    {member.github && (
                      <a 
                        href={member.github} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="nexus-social-btn"
                        title="GitHub"
                      >
                        <GitHubIcon size={16} />
                      </a>
                    )}
                    {member.community && (
                      <a 
                        href={member.community} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="nexus-social-btn"
                        title="Community"
                      >
                        <MessageSquare size={16} />
                      </a>
                    )}
                    {member.website && (
                      <a 
                        href={member.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="nexus-social-btn"
                        title="Website"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
