import React from 'react';
import { 
  Sparkles, Feather, Globe, ShieldCheck, 
  ExternalLink, MessageSquare, 
  ArrowDown, Users, CheckCircle2
} from 'lucide-react';
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

export default function AboutSection({ page }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const teamMembers = [
    {
      name: "Elena Rostova",
      role: "Founder & Editor-in-Chief",
      bio: "Former tech journalist passionate about long-form essayist culture and decentralization.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      links: [
        { icon: LinkedInIcon, url: "https://linkedin.com", label: "LinkedIn" },
        { icon: ExternalLink, url: "https://goreadpost.com", label: "Portfolio" }
      ]
    },
    {
      name: "Marcus Chen",
      role: "Head of Product",
      bio: "Design-obsessed developer focused on crafting minimalist writing user interfaces.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      links: [
        { icon: GitHubIcon, url: "https://github.com", label: "GitHub" },
        { icon: LinkedInIcon, url: "https://linkedin.com", label: "LinkedIn" }
      ]
    },
    {
      name: "Sarah Jenkins",
      role: "Community Director",
      bio: "Connecting writers, hosting digital workshops, and cultivating creator mentorships.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      links: [
        { icon: MessageSquare, url: "https://discord.com", label: "Community" },
        { icon: LinkedInIcon, url: "https://linkedin.com", label: "LinkedIn" }
      ]
    },
    {
      name: "Devon Vance",
      role: "Lead AI Engineer",
      bio: "Building intelligent context discovery systems that respect user data privacy.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      links: [
        { icon: GitHubIcon, url: "https://github.com", label: "GitHub" },
        { icon: ExternalLink, url: "https://goreadpost.com", label: "Website" }
      ]
    }
  ];

  return (
    <div className="nexus-about-root">

      <div className="nexus-about-container">

        {/* ── 1. HERO SECTION ── */}
        <section className="nexus-hero-section">
          <div className="nexus-hero-badge">
            <span className="nexus-hero-badge-dot"></span>
            <Sparkles size={13} className="nexus-hero-badge-icon" />
            <span>THE GOREADPOST MANIFESTO</span>
          </div>

          <h1 className="nexus-hero-title">
            Where Thoughts Find Their <br className="nexus-hero-br" />
            <span className="nexus-gradient-text">Infinite Orbit</span>
          </h1>

          <p className="nexus-hero-subtitle">
            GoReadPost is an independent publishing platform designed to amplify voices that 
            matter, spark curiosity, and build a global community around transformative ideas.
          </p>

          <div className="nexus-hero-actions">
            <button 
              type="button" 
              className="nexus-btn-primary"
              onClick={() => scrollToSection('who-we-are')}
            >
              <span>Discover Our Story</span>
              <ArrowDown size={15} className="nexus-btn-arrow" />
            </button>

            <button 
              type="button" 
              className="nexus-btn-secondary"
              onClick={() => scrollToSection('team')}
            >
              <span>Meet the Team</span>
              <Users size={15} />
            </button>
          </div>

          <div className="nexus-hero-trust-bar">
            <div className="nexus-trust-item">
              <span className="nexus-trust-bullet"></span>
              <strong>250K+</strong>
              <span>Monthly Readers</span>
            </div>
            <div className="nexus-trust-sep" />
            <div className="nexus-trust-item">
              <span className="nexus-trust-bullet"></span>
              <strong>15K+</strong>
              <span>Published Perspectives</span>
            </div>
            <div className="nexus-trust-sep" />
            <div className="nexus-trust-item">
              <span className="nexus-trust-bullet"></span>
              <strong>100%</strong>
              <span>Ad-Free Sanctuary</span>
            </div>
          </div>
        </section>

        {/* ── 2. "WHO WE ARE" SPLIT SECTION ── */}
        <section id="who-we-are" className="nexus-who-section">
          <div className="nexus-who-grid">
            
            {/* Left Column: Narrative & Mini-Features */}
            <div className="nexus-who-left">
              <h2 className="nexus-who-title">
                Built for thinkers, writers, <br />
                and <span className="nexus-teal-gradient">curious minds.</span>
              </h2>

              <p className="nexus-who-p">
                Founded in 2023, GoReadPost began with a single vision: to strip away the noise 
                of modern algorithms and give long-form content the thoughtful home it deserves.
              </p>

              <p className="nexus-who-p">
                We empower writers with intuitive tools, sleek visual formats, and direct audience 
                connections, while offering readers an ad-free sanctuary for modern tech, culture, 
                design, and philosophy insights.
              </p>

              <div className="nexus-highlight-row">
                <div className="nexus-highlight-card card-cyan-accent">
                  <h4 className="nexus-highlight-title">Ad-Free Experience</h4>
                  <p className="nexus-highlight-desc">Pure, uninterrupted reading for continuous focus.</p>
                </div>

                <div className="nexus-highlight-card card-magenta-accent">
                  <h4 className="nexus-highlight-title">Creator First</h4>
                  <p className="nexus-highlight-desc">Monetization models that directly empower authors.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Glass Value Card */}
            <div className="nexus-who-right">
              <div className="nexus-values-card">
                
                <div className="nexus-value-item">
                  <div className="nexus-value-icon-box box-blue">
                    <Feather size={20} />
                  </div>
                  <div className="nexus-value-content">
                    <h3 className="nexus-value-title">Uncompromising Quality</h3>
                    <p className="nexus-value-desc">
                      Every story published on GoReadPost undergoes refined community curation to maintain high literary standards.
                    </p>
                  </div>
                </div>

                <div className="nexus-value-divider" />

                <div className="nexus-value-item">
                  <div className="nexus-value-icon-box box-purple">
                    <Globe size={20} />
                  </div>
                  <div className="nexus-value-content">
                    <h3 className="nexus-value-title">Global Knowledge Exchange</h3>
                    <p className="nexus-value-desc">
                      Connecting perspective-shifting stories from over 120 countries, translated natively in real time.
                    </p>
                  </div>
                </div>

                <div className="nexus-value-divider" />

                <div className="nexus-value-item">
                  <div className="nexus-value-icon-box box-rose">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="nexus-value-content">
                    <h3 className="nexus-value-title">Data & Privacy Respect</h3>
                    <p className="nexus-value-desc">
                      Zero invasive trackers, zero sold personal data. Your curiosity remains strictly your own business.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── 3. IMPACT METRICS BAR ── */}
        <section className="nexus-stats-section">
          <div className="nexus-stats-bar">
            
            <div className="nexus-stat-col">
              <div className="nexus-stat-num">250K+</div>
              <div className="nexus-stat-label">ACTIVE READERS</div>
            </div>

            <div className="nexus-stat-col">
              <div className="nexus-stat-num">15K+</div>
              <div className="nexus-stat-label">PUBLISHED WRITERS</div>
            </div>

            <div className="nexus-stat-col">
              <div className="nexus-stat-num">85M+</div>
              <div className="nexus-stat-label">MONTHLY READS</div>
            </div>

            <div className="nexus-stat-col">
              <div className="nexus-stat-num cyan-stat">120+</div>
              <div className="nexus-stat-label">COUNTRIES REACHED</div>
            </div>

          </div>
        </section>

        {/* ── 4. MEET OUR CORE TEAM ── */}
        <section id="team" className="nexus-team-section">
          <div className="nexus-section-header-center">
            <h2 className="nexus-section-title">Meet Our Core Team</h2>
            <p className="nexus-section-desc">
              The engineers, editors, and designers shaping the future of digital writing.
            </p>
          </div>

          <div className="nexus-team-grid">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="nexus-team-card">
                
                <div className="nexus-avatar-wrap">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="nexus-team-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                <h3 className="nexus-team-name">{member.name}</h3>
                <div className="nexus-team-role">{member.role}</div>
                <p className="nexus-team-bio">{member.bio}</p>

                <div className="nexus-team-socials">
                  {member.links.map((link, lIdx) => {
                    const SIcon = link.icon;
                    return (
                      <a 
                        key={lIdx} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="nexus-social-btn"
                        title={link.label}
                      >
                        <SIcon size={16} />
                      </a>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
