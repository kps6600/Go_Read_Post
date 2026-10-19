import React, { useState } from 'react';
import { 
  Calendar, MapPin, Users, Award, Sparkles, ArrowRight, Play, CheckCircle2, 
  ExternalLink, Ticket, ShieldCheck, Zap, Globe, Star, ArrowLeft
} from 'lucide-react';

export default function TechSparksPage({ onBackToHome, onSelectStory }) {
  const [activeTrack, setActiveTrack] = useState('all');
  const [bookedTier, setBookedTier] = useState(null);

  const SPEAKERS = [
    {
      name: 'Nandan Nilekani',
      role: 'Co-founder & Chairman, Infosys',
      topic: 'India Stack & The Future of Public Digital Infrastructure',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      badge: 'Opening Keynote'
    },
    {
      name: 'Kunal Shah',
      role: 'Founder & CEO, CRED',
      topic: 'High-Trust Ecosystems & Consumer FinTech Mechanics',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      badge: 'Fireside Chat'
    },
    {
      name: 'Deepinder Goyal',
      role: 'Founder & CEO, Zomato',
      topic: 'Hyperlocal Logistics & Scaling 10-Minute Commerce',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      badge: 'Unicorn Session'
    },
    {
      name: 'Falguni Nayar',
      role: 'Founder & CEO, Nykaa',
      topic: 'Building a Profitable, Publicly Listed D2C Powerhouse',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      badge: 'Retail Leadership'
    },
    {
      name: 'Bhavish Aggarwal',
      role: 'Founder, Ola & Krutrim AI',
      topic: 'Sovereign AI Compute & India’s Electric Vehicle Shift',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      badge: 'AI & Mobility'
    },
    {
      name: 'Ghazal Alagh',
      role: 'Co-founder, Mamaearth (Honasa)',
      topic: 'From Digital Native to Tier-3 Consumer Expansion',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      badge: 'D2C Scaling'
    }
  ];

  const TRACKS = [
    { id: 'all', label: 'All Tracks' },
    { id: 'ai', label: 'GenAI & Frontier Compute' },
    { id: 'fintech', label: 'FinTech & Capital' },
    { id: 'd2c', label: 'D2C & Consumer Brands' },
    { id: 'climate', label: 'ClimateTech & Hardware' }
  ];

  const PASSES = [
    {
      id: 'delegate',
      name: 'Standard Delegate Pass',
      price: '₹4,999',
      earlyBird: '₹3,499 Early Bird',
      features: [
        'Access to all 4 Stage Keynotes & Panels',
        'Expo Floor & 150+ Startup Showcase Booths',
        'Networking Lounge access via Summit App',
        'Official TechSparks 2026 Delegate Kit',
        'Digital Access to All Recorded Keynotes'
      ],
      popular: false
    },
    {
      id: 'founder',
      name: 'Founder Pitch & VC Pass',
      price: '₹9,999',
      earlyBird: '₹7,999 Early Bird',
      features: [
        'Everything in Delegate Pass',
        'Curated 1-on-1 Speed Dating with 80+ Top Tier VCs',
        'Tech30 Startup Pitch Competition Entry',
        'Access to Closed-Door Investor Roundtable',
        'Complimentary 1-Year GoReadPost Pro Membership'
      ],
      popular: true
    },
    {
      id: 'all-access',
      name: 'VIP All-Access Pass',
      price: '₹19,999',
      earlyBird: '₹15,999 Early Bird',
      features: [
        'Everything in Founder Pitch Pass',
        'VIP Front-Row Seating at Main Auditorium',
        'Exclusive Speakers & Investors Gala Dinner',
        'Dedicated VIP Concierge & Fast-Track Checkin',
        'Private Lounge with Reserved Meeting Pods'
      ],
      popular: false
    }
  ];

  return (
    <div className="tsp-page-container">
      {/* Top Breadcrumb Header */}
      <div className="tsp-nav-strip">
        <button className="tsp-back-btn" onClick={onBackToHome}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
        <div className="tsp-badge-top">
          <Sparkles size={14} color="#e11d48" />
          <span>16TH EDITION • ASIA'S LARGEST STARTUP SUMMIT</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="tsp-hero-banner">
        <div className="tsp-hero-overlay">
          <div className="tsp-hero-content">
            <div className="tsp-flag-tag">
              <Zap size={14} /> TECHSPARKS 2026 BENGALURU
            </div>
            <h1 className="tsp-hero-title">
              The New Tech Order: <br />
              <span>Building India's AI & Sovereign Tech Future</span>
            </h1>
            <p className="tsp-hero-desc">
              Join 5,000+ founders, 200+ venture funds, and global technology innovators for 
              three days of transformative keynotes, unscripted fireside chats, and high-stakes venture pitches.
            </p>

            <div className="tsp-meta-cards-row">
              <div className="tsp-meta-box">
                <Calendar size={18} color="#e11d48" />
                <div>
                  <strong>OCTOBER 22 - 24, 2026</strong>
                  <span>3 Days • 4 Specialized Tracks</span>
                </div>
              </div>
              <div className="tsp-meta-box">
                <MapPin size={18} color="#e11d48" />
                <div>
                  <strong>BENGALURU, INDIA</strong>
                  <span>Taj West End & Virtual Live Stream</span>
                </div>
              </div>
              <div className="tsp-meta-box">
                <Users size={18} color="#e11d48" />
                <div>
                  <strong>5,000+ DELEGATES</strong>
                  <span>150+ Unicorn Founders & Investors</span>
                </div>
              </div>
            </div>

            <div className="tsp-hero-ctas">
              <a href="#passes" className="tsp-btn-primary">
                <Ticket size={18} />
                <span>Book Passes Now</span>
              </a>
              <a href="#speakers" className="tsp-btn-secondary">
                <span>Explore Speaker Lineup</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="tsp-stats-strip">
        <div className="tsp-stat-item">
          <span className="tsp-stat-num">16</span>
          <span className="tsp-stat-label">Years of Ecosystem Impact</span>
        </div>
        <div className="tsp-stat-item">
          <span className="tsp-stat-num">300+</span>
          <span className="tsp-stat-label">Tech30 Alumni Companies</span>
        </div>
        <div className="tsp-stat-item">
          <span className="tsp-stat-num">$3.5B+</span>
          <span className="tsp-stat-label">Capital Raised by Alumni</span>
        </div>
        <div className="tsp-stat-item">
          <span className="tsp-stat-num">200+</span>
          <span className="tsp-stat-label">Global & Domestic VCs Attending</span>
        </div>
      </section>

      {/* Headline Keynote Speakers */}
      <section id="speakers" className="tsp-section">
        <div className="tsp-section-head">
          <div>
            <span className="tsp-kicker">CURATED LEADERSHIP</span>
            <h2 className="tsp-section-title">Headline Speakers & Pioneers</h2>
          </div>
          <p className="tsp-section-sub">
            Learn directly from the visionary architects who engineered India's leading consumer apps, 
            enterprise software giants, and AI infrastructure.
          </p>
        </div>

        <div className="tsp-speakers-grid">
          {SPEAKERS.map((speaker, idx) => (
            <div key={idx} className="tsp-speaker-card">
              <div className="tsp-speaker-img-wrap">
                <img src={speaker.image} alt={speaker.name} className="tsp-speaker-img" />
                <span className="tsp-speaker-tag">{speaker.badge}</span>
              </div>
              <div className="tsp-speaker-info">
                <h3 className="tsp-speaker-name">{speaker.name}</h3>
                <p className="tsp-speaker-role">{speaker.role}</p>
                <div className="tsp-speaker-topic">
                  <strong>Session:</strong> {speaker.topic}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech30 Competition Spotlight */}
      <section className="tsp-tech30-spotlight">
        <div className="tsp-tech30-card">
          <div className="tsp-tech30-left">
            <span className="tsp-tech30-tag">FLAGSHIP SHOWCASE</span>
            <h2>Are You Building India's Next Breakthrough Company?</h2>
            <p>
              The Tech30 list has historically identified early-stage startups that went on to become 
              unicorns — including Freshworks, Chargebee, Little Black Book, and Innovaccer. 
              Applications are now open for the 2026 cohort.
            </p>
            <ul className="tsp-tech30-perks">
              <li><CheckCircle2 size={16} color="#10b981" /> Direct pitch to 100+ tier-1 venture partners</li>
              <li><CheckCircle2 size={16} color="#10b981" /> Featured editorial profile across GoReadPost network</li>
              <li><CheckCircle2 size={16} color="#10b981" /> ₹2.5 Crore in cloud credits and growth toolkits</li>
            </ul>
            <button className="tsp-btn-white" onClick={() => alert('Tech30 Applications: Registered interest!')}>
              <span>Apply for Tech30 2026</span>
              <ExternalLink size={16} />
            </button>
          </div>
          <div className="tsp-tech30-right">
            <div className="tsp-trophy-badge">
              <Award size={64} color="#f59e0b" />
              <div className="tsp-trophy-text">
                <strong>Tech30 Hall of Fame</strong>
                <span>8 Unicorns • 20+ Soonicorns • 74 Exits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summit Passes & Tickets */}
      <section id="passes" className="tsp-section">
        <div className="tsp-section-head center">
          <span className="tsp-kicker">SUMMIT PASSES</span>
          <h2 className="tsp-section-title">Secure Your Delegate Access</h2>
          <p className="tsp-section-sub">
            Choose your access pass for October 22-24, 2026. Early-bird rates apply for limited allocations.
          </p>
        </div>

        <div className="tsp-passes-grid">
          {PASSES.map((pass) => (
            <div key={pass.id} className={`tsp-pass-card ${pass.popular ? 'popular' : ''}`}>
              {pass.popular && <div className="tsp-popular-badge">MOST POPULAR</div>}
              <h3 className="tsp-pass-name">{pass.name}</h3>
              <div className="tsp-pass-price-box">
                <span className="tsp-pass-price">{pass.price}</span>
                <span className="tsp-pass-early">{pass.earlyBird}</span>
              </div>
              <ul className="tsp-pass-features">
                {pass.features.map((feat, fIdx) => (
                  <li key={fIdx}>
                    <CheckCircle2 size={16} color={pass.popular ? '#e11d48' : '#10b981'} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button 
                className={`tsp-pass-btn ${pass.popular ? 'primary' : 'outline'}`}
                onClick={() => setBookedTier(pass.name)}
              >
                {bookedTier === pass.name ? 'Pass Reserved ✓' : 'Register Pass'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
