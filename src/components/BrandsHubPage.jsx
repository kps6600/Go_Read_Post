import React from 'react';
import { 
  Cpu, Heart, ShoppingBag, Building2, Globe2, Languages, 
  ArrowRight, ArrowLeft, Layers, Sparkles, ExternalLink, BookOpen
} from 'lucide-react';

export default function BrandsHubPage({ onBackToHome, onNavigateBrand }) {
  const BRANDS = [
    {
      id: 'ai-story',
      name: 'AIStory',
      tagline: 'GenAI, Sovereign Compute & Frontier Tech',
      desc: 'Dedicated daily coverage of foundational AI models, agentic workflows, semiconductor roadmaps, and the Indian deeptech builders competing on the global stage.',
      color: '#0284c7',
      bg: '#f0f9ff',
      icon: Cpu,
      stats: '450+ Stories • Daily AI Dispatch',
      leadStory: 'From Krutrim to Sarvam: Inside India’s Race to Build Indic Language Foundation Models',
      image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'her-story',
      name: 'HerStory',
      tagline: 'Women Entrepreneurs, Leaders & Trailblazers',
      desc: 'Championing women founders, venture capital partners, scientists, and policy pioneers driving India’s economic and social transformation.',
      color: '#db2777',
      bg: '#fdf2f8',
      icon: Heart,
      stats: '1,200+ Profiles • Annual Women On Top Awards',
      leadStory: 'How 50 Women Founders Are Rewriting the Rules of Venture Capital Across India',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'smbstory',
      name: 'SMBStory',
      tagline: 'MSMEs, Manufacturing & Homegrown D2C Brands',
      desc: 'The backbone of Bharat: stories of multi-generational family enterprises, resilient factory floors, and digital-first D2C consumer disruptors.',
      color: '#d97706',
      bg: '#fffbeb',
      icon: ShoppingBag,
      stats: '850+ Brand Journeys • 50+ Industrial Hubs',
      leadStory: 'From Surat Looms to ₹100 Crore Global Exports: The Renaissance of Indian Textiles',
      image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'enterprise',
      name: 'EnterpriseStory',
      tagline: 'B2B SaaS, Cloud Infrastructure & Digital Transformation',
      desc: 'Strategic reporting on India’s trillion-dollar SaaS opportunity, enterprise cybersecurity, cloud optimization, and Fortune 500 tech migrations.',
      color: '#4f46e5',
      bg: '#eef2ff',
      icon: Building2,
      stats: '600+ In-depth Analyses • SaaS Index',
      leadStory: 'Why Global CIOs Are Consolidating Their Enterprise AI Stacks Around Indian SaaS',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'social-story',
      name: 'SocialStory',
      tagline: 'Sustainability, Climate Action & Impact Innovation',
      desc: 'Spotlighting social entrepreneurs tackling clean energy transition, water security, regenerative farming, and inclusive financial architecture.',
      color: '#059669',
      bg: '#ecfdf5',
      icon: Globe2,
      stats: '950+ Social Innovations • ESG Benchmarks',
      leadStory: 'Circular Economy Pioneers: Turning 50,000 Tons of Agricultural Waste into Bio-Plastic',
      image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'hindi',
      name: 'YS हिंदी',
      tagline: 'भारत का सबसे भरोसेमंद स्टार्टअप और बिज़नेस मंच',
      desc: 'भारतीय भाषा में संपूर्ण स्टार्टअप, बिज़नेस, फंडिंग और उद्यमिता का विश्वसनीय मंच। हर रोज़ लाखों हिंदी पाठकों तक पहुंचता समाचार।',
      color: '#ea580c',
      bg: '#fff7ed',
      icon: Languages,
      stats: '2,500+ हिंदी लेख • देश भर में पाठक',
      leadStory: 'छोटे शहरों से उभरे 10 स्टार्टअप जिन्होंने बदली भारतीय बाज़ार की तस्वीर',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="bhp-page-container">
      {/* Top Strip */}
      <div className="bhp-nav-strip">
        <button className="bhp-back-btn" onClick={onBackToHome}>
          <ArrowLeft size={16} />
          <span>Back to Frontpage</span>
        </button>
        <div className="bhp-badge-top">
          <Layers size={14} color="#e11d48" />
          <span>EDITORIAL NETWORK • 6 SPECIALIZED VERTICALS</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bhp-hero-banner">
        <div className="bhp-hero-content">
          <span className="bhp-kicker">ECOSYSTEM COVERAGE</span>
          <h1 className="bhp-hero-title">
            Our Editorial Brands & Specialized Desks
          </h1>
          <p className="bhp-hero-desc">
            Explore dedicated verticals reporting on every corner of the innovation economy — 
            from foundational AI compute to generational MSMEs and impact capital.
          </p>
        </div>
      </section>

      {/* 6 Brand Showcase Cards */}
      <div className="bhp-brands-grid">
        {BRANDS.map((brand) => {
          const Icon = brand.icon;
          return (
            <div key={brand.id} className="bhp-brand-card">
              <div className="bhp-card-media">
                <img src={brand.image} alt={brand.name} className="bhp-card-img" />
                <div className="bhp-card-icon-pill" style={{ background: brand.bg, color: brand.color }}>
                  <Icon size={20} />
                  <span>{brand.name}</span>
                </div>
              </div>
              <div className="bhp-card-body">
                <span className="bhp-card-tagline">{brand.tagline}</span>
                <p className="bhp-card-desc">{brand.desc}</p>
                
                <div className="bhp-card-lead-box">
                  <span className="bhp-lead-label">LATEST FEATURE</span>
                  <p className="bhp-lead-title">{brand.leadStory}</p>
                </div>

                <div className="bhp-card-footer">
                  <span className="bhp-card-stats">{brand.stats}</span>
                  <button 
                    className="bhp-card-cta"
                    style={{ color: brand.color }}
                    onClick={() => onNavigateBrand && onNavigateBrand(brand.id)}
                  >
                    <span>Explore Desk</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
