import React, { useState } from 'react';
import { 
  Play, Video, ArrowLeft, Eye, Clock, Share2, Sparkles, X, 
  ExternalLink, Tv, Radio, Flame, CheckCircle2
} from 'lucide-react';

export default function YSTVPage({ onBackToHome }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [playingVideo, setPlayingVideo] = useState(null);

  const VIDEOS = [
    {
      id: 'ystv-1',
      title: 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
      series: 'Founders Unfiltered',
      duration: '42:15',
      views: '124K views',
      guest: 'Bhavish Aggarwal (Ola & Krutrim)',
      category: 'interviews',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
      desc: 'Inside the high-stakes ambition to build India’s own supercomputing infrastructure, AI silicon, and domestic LLMs from scratch.'
    },
    {
      id: 'ystv-2',
      title: 'The Hard Truth About Startup Dilution: Nithin Kamath on Bootstrapping to ₹4,000 Cr Profit',
      series: 'Studio Masterclass',
      duration: '38:40',
      views: '280K views',
      guest: 'Nithin Kamath (Zerodha)',
      category: 'masterclass',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
      desc: 'Why Zerodha avoided VC checks, how to price financial products sustainably, and the psychology of staying grounded at scale.'
    },
    {
      id: 'ystv-3',
      title: 'From College Dorm to $5B SaaS Empire: Abhinav Asthana on How Postman Conquered Developers',
      series: 'TechSparks Archives',
      duration: '29:50',
      views: '95K views',
      guest: 'Abhinav Asthana (Postman)',
      category: 'keynotes',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      desc: 'The viral developer growth loop that turned an open-source tool into a standard utility in 500,000 engineering teams globally.'
    },
    {
      id: 'ystv-4',
      title: 'The Omnichannel Moat: Peyush Bansal on Turning Eye Glasses into High Margin Fashion',
      series: 'Conversations with Shradha',
      duration: '48:10',
      views: '340K views',
      guest: 'Peyush Bansal (Lenskart)',
      category: 'interviews',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      desc: 'Peyush shares early operational failures, establishing automated lens robotics in Bhiwadi, and expanding across Southeast Asia.'
    },
    {
      id: 'ystv-5',
      title: 'Can India Build Hardware? Tarun Mehta on the 10-Year Journey to Electric Mobility',
      series: 'DeepTech Spotlight',
      duration: '34:25',
      views: '88K views',
      guest: 'Tarun Mehta (Ather Energy)',
      category: 'interviews',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
      desc: 'Why building electric scooters is 10x harder than software, navigating battery fires in the industry, and preparing for IPO.'
    },
    {
      id: 'ystv-6',
      title: 'Venture Capital in 2026: What Top Investors Look for in Pre-Seed and Series A Decks',
      series: 'Capital Roundtable',
      duration: '52:00',
      views: '110K views',
      guest: 'Top Tier VC Partners Panel',
      category: 'masterclass',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      desc: 'Managing partner panel from Sequoia, Accel, and Elevation Capital debating valuations, AI business models, and founder diligence.'
    }
  ];

  const CATEGORIES = [
    { id: 'all', label: 'All Episodes' },
    { id: 'interviews', label: 'Founders Unfiltered' },
    { id: 'masterclass', label: 'Studio Masterclasses' },
    { id: 'keynotes', label: 'TechSparks Keynotes' }
  ];

  const filteredVideos = activeCategory === 'all' 
    ? VIDEOS 
    : VIDEOS.filter(v => v.category === activeCategory);

  return (
    <div className="ystv-page-container">
      {/* Top Nav Strip */}
      <div className="ystv-nav-strip">
        <button className="ystv-back-btn" onClick={onBackToHome}>
          <ArrowLeft size={16} />
          <span>Back to Frontpage</span>
        </button>
        <div className="ystv-badge-top">
          <Tv size={14} color="#e11d48" />
          <span>YSTV MULTIMEDIA • ORIGINAL STUDIO PRODUCTIONS</span>
        </div>
      </div>

      {/* Featured Big Stage Player */}
      <section className="ystv-hero-stage">
        <div className="ystv-stage-media" onClick={() => setPlayingVideo(VIDEOS[0])}>
          <img src={VIDEOS[0].image} alt={VIDEOS[0].title} className="ystv-stage-bg" />
          <div className="ystv-stage-overlay">
            <span className="ystv-stage-pill"><Flame size={14} /> SEASON PREMIERE</span>
            <h1 className="ystv-stage-title">{VIDEOS[0].title}</h1>
            <p className="ystv-stage-desc">{VIDEOS[0].desc}</p>
            
            <div className="ystv-stage-meta">
              <span>{VIDEOS[0].guest}</span>
              <span>•</span>
              <span><Clock size={14} /> {VIDEOS[0].duration}</span>
              <span>•</span>
              <span><Eye size={14} /> {VIDEOS[0].views}</span>
            </div>

            <button className="ystv-play-hero-btn">
              <Play size={20} fill="#ffffff" />
              <span>Watch Episode Now</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <div className="ystv-filter-bar">
        <div className="ystv-filter-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`ystv-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Episodes Grid */}
      <div className="ystv-grid">
        {filteredVideos.map(vid => (
          <div key={vid.id} className="ystv-card" onClick={() => setPlayingVideo(vid)}>
            <div className="ystv-thumb-wrap">
              <img src={vid.image} alt={vid.title} className="ystv-thumb-img" />
              <div className="ystv-play-overlay">
                <div className="ystv-play-icon-circle">
                  <Play size={18} fill="#ffffff" />
                </div>
              </div>
              <span className="ystv-duration-badge">{vid.duration}</span>
            </div>
            <div className="ystv-card-body">
              <span className="ystv-series-tag">{vid.series}</span>
              <h3 className="ystv-card-title">{vid.title}</h3>
              <p className="ystv-card-desc">{vid.desc}</p>
              <div className="ystv-card-footer">
                <span>{vid.guest}</span>
                <span>•</span>
                <span>{vid.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="ystv-modal-overlay" onClick={() => setPlayingVideo(null)}>
          <div className="ystv-modal-content" onClick={e => e.stopPropagation()}>
            <div className="ystv-modal-header">
              <div>
                <span className="ystv-series-tag">{playingVideo.series}</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 800 }}>{playingVideo.title}</h3>
              </div>
              <button className="ystv-modal-close" onClick={() => setPlayingVideo(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="ystv-video-player-mock">
              <img src={playingVideo.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
              <div className="ystv-player-active-overlay">
                <Play size={48} fill="#e11d48" color="#e11d48" />
                <span style={{ color: '#fff', fontWeight: 700, marginTop: '12px' }}>Playing High-Definition Stream</span>
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: '#0f172a', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <p style={{ margin: 0 }}>{playingVideo.desc}</p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                Featuring: <strong style={{ color: '#fff' }}>{playingVideo.guest}</strong> • Duration: {playingVideo.duration} • Recorded at GoReadPost Studios
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
