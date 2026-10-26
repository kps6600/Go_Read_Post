import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Bookmark, Share2, Heart, Award, Clock, 
  CheckCircle, Check, ChevronRight, MessageSquare,
  Send, Volume2, Pause, Quote, Lightbulb, ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { SMB_STORY_PROFILES, ALL_SMB_STORIES } from '../data/smbStoryData';
import { HER_STORY_PROFILES, ALL_HER_STORIES } from '../data/herStoryData';
import { ALL_STORIES } from '../data/storiesData';
import { ALL_ENTERPRISE_STORIES } from '../data/enterpriseStoryData';

export default function FullStoryPage({
  story,
  stories = [],
  onBack,
  isSaved,
  onToggleSave,
  onShareStory,
  onShowToast,
  onClapStory,
  onSelectStory
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story?.claps || 384);
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const articleRef = useRef(null);

  // Reader Discussion & Comments state
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Arjun Nambiar",
      role: "VP Operations @ BharatScale",
      time: "25 mins ago",
      text: "This story captures the essence of compounding execution. Pure product discipline and authentic supply-chain resilience create enduring equity far beyond paper valuations.",
      likes: 14
    },
    {
      id: 2,
      author: "Pooja Hegde",
      role: "Founder, AgriRoots D2C",
      time: "1 hour ago",
      text: "The focus on unit economics over burning capital is so inspiring. We need more reporting that honors disciplined, profitable builders.",
      likes: 9
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  // 1. Resolve curated profile if story matches known profile ID
  const curatedProfile = useMemo(() => {
    if (!story) return null;
    const id = story.id || story._id;
    return (
      (id && SMB_STORY_PROFILES[id]) ||
      (id && HER_STORY_PROFILES[id]) ||
      null
    );
  }, [story]);

  // 2. Merge story properties with curated profile fallback
  const mergedStory = useMemo(() => {
    return { ...(curatedProfile || {}), ...(story || {}) };
  }, [curatedProfile, story]);

  // Headline and subtitle derivation for memoization
  const headline = mergedStory.mainHeadline || mergedStory.title || 'Featured Story';
  const subtitle = mergedStory.heroSubheading || mergedStory.subtitle || mergedStory.summary || '';

  // 3. Domain-Aware Performance Benchmarks Stats
  const stats = useMemo(() => {
    if (Array.isArray(mergedStory.stats) && mergedStory.stats.length >= 3) {
      return mergedStory.stats;
    }
    const cat = (mergedStory.category || '').toLowerCase();
    const isTech = cat.includes('ai') || cat.includes('tech') || cat.includes('deep');
    const isFunding = cat.includes('fund') || cat.includes('startup') || cat.includes('invest') || cat.includes('captable');
    const isLeadership = cat.includes('leader') || cat.includes('workplace') || cat.includes('people');

    if (isTech) {
      return [
        { label: 'Compute Scale', value: '10x Faster', sub: 'Inference throughput vs baseline' },
        { label: 'Model Precision', value: '99.4%', sub: 'Audited benchmark accuracy' },
        { label: 'Cloud Infrastructure', value: 'Edge-Native', sub: 'Hyperscale latency optimization' },
        { label: 'Enterprise Trust', value: '450+', sub: 'Institutional Fortune-500 nodes' }
      ];
    }
    if (isFunding) {
      return [
        { label: 'Capital Efficiency', value: '2.8x', sub: 'Revenue multiple on capital deployed' },
        { label: 'Market Footprint', value: '50+ Cities', sub: 'Pan-India operational network' },
        { label: 'Direct Users', value: '1.4M+', sub: 'Active transacting monthly cohort' },
        { label: 'Growth Runway', value: 'Profitable', sub: 'Unit-economics self-sustainability' }
      ];
    }
    if (isLeadership) {
      return [
        { label: 'Team Velocity', value: '850+', sub: 'Full-time mission-driven builders' },
        { label: 'Employee Retention', value: '94%', sub: 'Voluntary leadership retention' },
        { label: 'Global Footprint', value: '14 Hubs', sub: 'Cross-border engineering offices' },
        { label: 'Customer CSAT', value: '4.9 / 5', sub: 'Tier-1 enterprise NPS score' }
      ];
    }
    return [
      { label: 'Market Scale', value: '₹500+ Cr', sub: 'Annualized ecosystem transaction value' },
      { label: 'Operational Moat', value: '99.8%', sub: 'Direct fulfillment reliability rate' },
      { label: 'Direct Partners', value: '2,500+', sub: 'Verified grassroots network' },
      { label: 'Gross Margin', value: '45%', sub: 'Sustained operating profitability' }
    ];
  }, [mergedStory]);

  // 4. Narrative Paragraphs Resolver
  const parsedParagraphs = useMemo(() => {
    if (Array.isArray(mergedStory.content) && mergedStory.content.length > 0) {
      return mergedStory.content.filter(Boolean);
    }
    if (typeof mergedStory.content === 'string') {
      const split = mergedStory.content.split('\n\n').map(s => s.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
    return [
      mergedStory.summary || headline,
      "The journey of building a market-defining enterprise is rarely linear. It requires an unrelenting focus on operational resilience, direct supplier trust, and high-fidelity product standards that transcend transitory macroeconomic cycles.",
      "In the formative stages, industry skeptics doubted whether an independent player could challenge entrenched multinational incumbents without burning venture subsidies. Yet by establishing airtight distribution protocols and reinvesting internal cash flow into core infrastructure, the foundation was forged.",
      "To cement competitive differentiation, the enterprise undertook bold investments in automated operations and specialized tooling. This enabled continuous quality control while adhering to stringent international benchmarks.",
      "By eliminating unnecessary intermediaries and creating direct value for thousands of localized partners, the organization achieved superior margins while transforming surrounding communities.",
      "Today, reach extends across key regional markets, enterprise networks, and digital platforms, making the product a cornerstone across urban and rural corridors.",
      "With audited profitability, low leverage, and strategic export inroads, the organization stands as a masterclass in patient, disciplined capitalism—proving that generational equity is built on unit economics and unwavering consumer goodwill."
    ];
  }, [mergedStory, headline]);

  // 5. 8 Similar Stories Grid
  const similarStories = useMemo(() => {
    const liveList = Array.isArray(stories) && stories.length > 0 ? stories : [];
    const all = [
      ...liveList,
      ...ALL_STORIES,
      ...ALL_SMB_STORIES,
      ...ALL_HER_STORIES,
      ...ALL_ENTERPRISE_STORIES
    ];
    const seen = new Set();
    const result = [];
    const currentId = story?.id || story?._id || story?.slug;
    if (currentId) seen.add(String(currentId));

    // Try same category first if live stories exist
    const currentCategory = (story?.category || story?.categoryName || '').toLowerCase();
    if (currentCategory && liveList.length > 0) {
      for (const item of liveList) {
        const id = String(item?.id || item?._id || item?.slug || '');
        if (!id || seen.has(id) || !item.title) continue;
        const cat = (item?.category || item?.categoryName || '').toLowerCase();
        if (cat === currentCategory) {
          seen.add(id);
          result.push(item);
          if (result.length >= 8) return result;
        }
      }
    }

    for (const item of all) {
      const id = String(item?.id || item?._id || item?.slug || '');
      if (id && !seen.has(id) && item.title) {
        seen.add(id);
        result.push(item);
        if (result.length >= 8) break;
      }
    }
    return result;
  }, [story?.id, story?._id, story?.slug, story?.category, story?.categoryName, stories]);

  // Scroll to top and reset state when story changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLiked(false);
    setLikeCount(mergedStory.claps || Math.floor(Math.random() * 160) + 340);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, [mergedStory.id, mergedStory._id, mergedStory.claps]);

  // Track window & article scroll reading progress
  useEffect(() => {
    const handleScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const totalHeight = el.scrollHeight;
      const scrolled = window.scrollY - (el.getBoundingClientRect().top + window.scrollY) + window.innerHeight;
      const pct = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100));
      setReadProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup Web Speech API audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!story) return null;

  const isArticleSaved = isSaved ? isSaved(mergedStory.id || mergedStory._id) : false;

  // Metadata Resolution
  const categoryTag = mergedStory.categoryTag || mergedStory.categoryLabel || mergedStory.tag || mergedStory.category || 'INNOVATION';
  const brandName = mergedStory.brand || (
    mergedStory.category === 'smbstory' ? 'SMBStory' :
    mergedStory.category === 'her-story' ? 'HerStory' :
    mergedStory.category === 'enterprise' ? 'EnterpriseStory' :
    mergedStory.category === 'ai-story' ? 'AIStory' :
    'GoReadPost'
  );
  const subEyebrow = mergedStory.subEyebrow || (
    brandName === 'SMBStory' ? 'MADE IN INDIA ENTREPRENEURSHIP' :
    brandName === 'HerStory' ? 'WOMEN TRAILBLAZERS & PIONEERS' :
    brandName === 'EnterpriseStory' ? 'CORPORATE & ENTERPRISE STRATEGY' :
    brandName === 'AIStory' ? 'ARTIFICIAL INTELLIGENCE & DEEP TECH' :
    'ORIGINAL EDITORIAL INTELLIGENCE'
  );

  const authorName = typeof mergedStory.author === 'string'
    ? mergedStory.author
    : mergedStory.author?.name || `${brandName} Bureau`;
  const authorRole = mergedStory.author?.title || mergedStory.author?.role || mergedStory.role || 'Senior Intelligence Editor';
  const authorAvatar = mergedStory.author?.avatar || mergedStory.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&auto=format&fit=crop&q=80';
  const publishDate = mergedStory.publishedAt || mergedStory.date || 'Recent Feature';
  const readDuration = mergedStory.readTime || '5 min read';

  const heroImage = mergedStory.heroImage || mergedStory.image || mergedStory.fallbackImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80';
  const heroBadge = mergedStory.heroBadgeText || `${categoryTag.toUpperCase()} · ORIGINAL EXCLUSIVE`;
  const heroCaption = mergedStory.heroCaption || mergedStory.photoCredit || `${authorName} — GoReadPost Desk Coverage`;

  // Initials generator for badges
  const getInitials = (name) => {
    if (!name) return 'GP';
    return name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // Actions
  const handleShare = () => {
    if (onShareStory) {
      onShareStory(mergedStory);
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      if (onShowToast) onShowToast('Story link copied to clipboard!');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleClap = () => {
    const nextState = !liked;
    setLiked(nextState);
    setLikeCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));

    if (nextState) {
      if (onClapStory) onClapStory(mergedStory.id || mergedStory._id);
      confetti({
        particleCount: 55,
        spread: 75,
        origin: { y: 0.75 },
        colors: ['#ea580c', '#f97316', '#fb923c', '#dc2626', '#ec4899', '#10b981']
      });
      if (onShowToast) onShowToast('👏 Applauded story! Shared with GoReadPost community.');
    }
  };

  const toggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      setIsPlayingAudio(!isPlayingAudio);
      if (onShowToast) onShowToast(isPlayingAudio ? 'Audio narration paused' : '🎙️ Audio narration playing');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      if (onShowToast) onShowToast('Audio narration paused');
    } else {
      window.speechSynthesis.cancel();
      const text = mergedStory.audioNarrationText || `${headline}. Reported by ${authorName} for ${brandName}. ${subtitle || ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      if (onShowToast) onShowToast(`🎙️ Audio narration playing: "${headline}"`);
    }
  };

  // Comments handler
  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = {
      id: Date.now(),
      author: newAuthor.trim() || "Guest Reader",
      role: "GoReadPost Community Member",
      time: "Just now",
      text: newComment.trim(),
      likes: 0
    };

    setComments([added, ...comments]);
    setNewComment('');
    if (onShowToast) onShowToast("Comment posted to the conversation!");
  };

  const handleLikeComment = (commentId) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        const isLiked = !c.isLiked;
        return {
          ...c,
          isLiked,
          likes: isLiked ? (c.likes || 0) + 1 : Math.max(0, (c.likes || 1) - 1)
        };
      }
      return c;
    }));
  };

  const leadParagraph = mergedStory.leadParagraph || parsedParagraphs[0];
  const leadDropCap = mergedStory.leadDropCap || (leadParagraph ? leadParagraph.charAt(0) : 'W');
  const leadProseRest = mergedStory.leadParagraph ? leadParagraph : leadParagraph.slice(1);
  const leadSubtext = mergedStory.leadSubtext || parsedParagraphs[1];

  const mottoText = mergedStory.mottoText || mergedStory.philosophyQuote || (
    parsedParagraphs[2] ? `“${parsedParagraphs[2]}”` :
    "“When you prioritize authentic value creation over financial vanity metrics, compounding growth inevitably follows.”"
  );
  const mottoAuthor = mergedStory.mottoAuthor || authorName;
  const mottoRole = mergedStory.mottoRole || authorRole;

  const section2Title = mergedStory.section2Title || 'Operational Execution & Overcoming Formative Roadblocks';
  const section2Prose1 = mergedStory.section2Prose1 || parsedParagraphs[2] || 'Rather than cutting corners with low-grade shortcuts, the leadership invested heavily in specialized supply chain and processing excellence.';
  const section2Prose2 = mergedStory.section2Prose2 || parsedParagraphs[3] || 'Every operational stage was engineered to withstand systemic headwinds, volatile input costs, and shifting consumer expectations.';

  const pullquoteText = mergedStory.pullquoteText || (
    parsedParagraphs[4] ? `“${parsedParagraphs[4]}”` :
    "“If your product quality and unit economics are unquestionable, customer trust compounds organically. Word-of-mouth recommendations are ten times more enduring than transient promotional hype.”"
  );
  const pullquoteAuthor = mergedStory.pullquoteAuthor || mottoAuthor;
  const pullquoteRole = mergedStory.pullquoteRole || mottoRole;

  const dossierTitle = mergedStory.dossierTitle || 'Strategic Market Dossier & Unit Economics';
  const dossierPills = mergedStory.dossierPills || [categoryTag, 'Pan-India Footprint', 'Ecosystem Moat', 'Profitable Scale'];
  const dossierProse1 = mergedStory.dossierProse1 || parsedParagraphs[4] || 'While competitors poured millions into short-sighted acquisition burns, this venture pursued a grounded, contrarian playbook: establishing deep roots across tangible operational hubs.';
  const dossierProse2 = mergedStory.dossierProse2 || parsedParagraphs[5] || 'Today, sustainable cash flows power continuous expansion, ensuring the brand maintains sovereign pricing power across key touchpoints.';

  const section3Title = mergedStory.section3Title || 'Sustainable Scale & The Long-Term Frontier';
  const section3Prose1 = mergedStory.section3Prose1 || parsedParagraphs[5] || 'Over continuous quarters of disciplined execution, the enterprise has maintained healthy margins without diluting core product fidelity.';
  const section3Prose2 = mergedStory.section3Prose2 || parsedParagraphs[6] || 'By reinvesting internal cash flows into redundancy, capacity breadth, and team capability, the company proves that patient capital outlasts hyper-growth burn models.';

  const takeaways = mergedStory.takeaways || [
    'Product-first execution beats transient ad burn over the long run.',
    'A balanced omnichannel and offline footprint shields margins against digital volatility.',
    'Formulating specifically for localized ground realities creates unbreakable customer loyalty.',
    'Disciplined unit economics allow builders to maintain generational control.'
  ];

  const bioSummary = mergedStory.bioSummary || 'Covering innovation, enterprise leadership, venture capital, and grassroots business transformation across India and the global emerging markets.';
  const tags = mergedStory.tags || [categoryTag, brandName, 'Innovation', 'Growth', 'ScaleIndia', 'Leadership'];

  const handleSimilarCardClick = (item) => {
    if (onSelectStory) {
      onSelectStory(item);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onShowToast) {
      onShowToast(`📖 Now reading: "${item.title}"`);
    }
  };

  return (
    <div className="smb-story-page" ref={articleRef}>
      
      {/* 1. TOP READING PROGRESS BAR */}
      <div className="smb-reading-progress-track">
        <div 
          className="smb-reading-progress-fill" 
          style={{ width: `${readProgress}%` }} 
        />
      </div>

      <div className="container">
        
        {/* 2. BREADCRUMBS & BRAND IDENTITY */}
        <nav className="smb-page-breadcrumbs">
          <button 
            type="button" 
            className="smb-breadcrumb-btn" 
            onClick={onBack}
          >
            <ArrowLeft size={15} />
            <span>Home</span>
          </button>
          <span className="smb-breadcrumb-sep">/</span>
          <span className="smb-breadcrumb-muted">Brands</span>
          <span className="smb-breadcrumb-sep">/</span>
          <div className="smb-brand-pill">
            <span className="smb-brand-badge-text">{brandName}</span>
            <span className="smb-brand-exclusive">Exclusive</span>
          </div>
        </nav>

        {/* 3. HERO SHOWCASE WRAPPER */}
        <section className="smb-hero-spotlight-wrapper">
          
          {/* Main Headline */}
          <div className="smb-hero-headline-block">
            <div className="smb-category-eyebrow">
              <span className="smb-eyebrow-tag">{categoryTag}</span>
              <span className="smb-eyebrow-dot">·</span>
              <span className="smb-eyebrow-sub">{subEyebrow}</span>
            </div>
            <h1 className="smb-article-title">
              {headline}
            </h1>
            {subtitle && (
              <p className="smb-hero-subheading">
                {subtitle}
              </p>
            )}
          </div>

          {/* Byline & Engagement Ribbon */}
          <div className="smb-byline-card-box">
            <div className="smb-byline-left">
              <img 
                src={authorAvatar} 
                alt={authorName} 
                className="smb-author-avatar-img"
              />
              <div className="smb-author-meta-info">
                <div className="smb-author-name-row">
                  <span className="smb-author-fullname">{authorName}</span>
                  <span className="smb-author-verified-badge" title={`${brandName} Verified Desk`}>
                    <CheckCircle size={13} fill="#ea580c" color="#ffffff" />
                  </span>
                </div>
                <div className="smb-author-submeta">
                  <span className="smb-author-role">{authorRole}</span>
                  <span className="smb-meta-divider">·</span>
                  <span className="smb-publish-date">{publishDate}</span>
                  <span className="smb-meta-divider">·</span>
                  <span className="smb-readtime-pill">
                    <Clock size={12} />
                    <span>{readDuration}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="smb-byline-actions">
              <button 
                type="button" 
                className={`smb-action-pill-btn ${isPlayingAudio ? 'active-audio' : ''}`}
                onClick={toggleAudio}
                title={isPlayingAudio ? 'Pause Narration' : 'Listen to story narration'}
              >
                {isPlayingAudio ? <Pause size={14} /> : <Volume2 size={14} />}
                <span>{isPlayingAudio ? 'Playing' : 'Listen'}</span>
              </button>

              <button 
                type="button" 
                className={`smb-action-pill-btn ${liked ? 'active-clap' : ''}`}
                onClick={handleClap}
                title="Applaud story"
              >
                <Heart size={14} fill={liked ? '#dc2626' : 'none'} color={liked ? '#dc2626' : 'currentColor'} />
                <span>{likeCount}</span>
              </button>

              <button 
                type="button" 
                className="smb-action-pill-btn"
                onClick={handleShare}
                title="Share story"
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              <button 
                type="button" 
                className={`smb-action-pill-btn ${isArticleSaved ? 'active-save' : ''}`}
                onClick={() => onToggleSave && onToggleSave(mergedStory)}
                title={isArticleSaved ? 'Saved in Bookmarks' : 'Save for later'}
              >
                <Bookmark size={14} fill={isArticleSaved ? '#ea580c' : 'none'} color={isArticleSaved ? '#ea580c' : 'currentColor'} />
                <span>{isArticleSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="smb-hero-media-showcase">
            <img 
              src={heroImage} 
              alt={headline} 
              className="smb-hero-full-img"
              loading="eager"
            />
            <div className="smb-hero-floating-badge">
              <Award size={14} color="#ea580c" />
              <span>{heroBadge}</span>
            </div>
            <div className="smb-hero-media-caption">
              <span>{heroCaption}</span>
            </div>
          </div>

        </section>

        {/* 4. KEY METRICS STATS GRID (ROW) */}
        {stats && stats.length > 0 && (
          <section className="smb-metrics-card-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="smb-metric-item">
                <span className="smb-metric-value">{stat.value}</span>
                <span className="smb-metric-label">{stat.label}</span>
                <span className="smb-metric-sub">{stat.sub}</span>
              </div>
            ))}
          </section>
        )}

        {/* 5. ROW-WISE CONTENT ARCHITECTURE */}
        <div className="smb-content-rows-container">
          
          {/* ── ROW 1: Lead Origin Story Card + Founder Mindset Quote Side-by-Side ── */}
          <div className="smb-split-row">
            
            {/* Left: Lead Story Narrative Card */}
            <div className="smb-lead-narrative-card">
              <p className="smb-prose-lead">
                <span className="smb-dropcap">{leadDropCap}</span>
                {leadProseRest}
              </p>
              {leadSubtext && (
                <p className="smb-lead-subtext">
                  {leadSubtext}
                </p>
              )}
            </div>

            {/* Right: Conviction Mindset Quote Card */}
            <div className="smb-mindset-quote-card">
              <div className="smb-mindset-glow" />
              <Quote size={28} className="smb-mindset-quote-icon" />
              <div className="smb-mindset-body">
                <blockquote className="smb-mindset-text">
                  {mottoText}
                </blockquote>
                <div className="smb-mindset-author-row">
                  <div className="smb-mindset-avatar-badge">
                    {getInitials(mottoAuthor)}
                  </div>
                  <div>
                    <span className="smb-mindset-author-name">{mottoAuthor}</span>
                    <span className="smb-mindset-author-title">{mottoRole}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── ROW 2: Chapter Narrative Deep Dive + Pullquote Side-by-Side ── */}
          <div className="smb-split-row">
            
            {/* Left: Chapter Narrative Card */}
            <div className="smb-chapter-narrative-card">
              <h2 className="smb-row-card-title">
                {section2Title}
              </h2>
              <p className="smb-row-prose">
                {section2Prose1}
              </p>
              {section2Prose2 && (
                <p className="smb-row-prose" style={{ marginBottom: 0 }}>
                  {section2Prose2}
                </p>
              )}
            </div>

            {/* Right: Signature Pullquote Card */}
            <div className="smb-signature-pullquote-card">
              <blockquote className="smb-signature-quote-text">
                {pullquoteText}
              </blockquote>
              <div className="smb-pullquote-author-row">
                <div className="smb-mindset-avatar-badge" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  {getInitials(pullquoteAuthor)}
                </div>
                <div>
                  <span className="smb-mindset-author-name">{pullquoteAuthor}</span>
                  <span className="smb-mindset-author-title">{pullquoteRole}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── ROW 3: Horizontal Dossier Row ── */}
          <div className="smb-horizontal-dossier-card">
            <div className="smb-dossier-left-col">
              <span className="smb-dossier-eyebrow">STRATEGIC DOSSIER</span>
              <h3 className="smb-dossier-title">
                {dossierTitle}
              </h3>
              {dossierPills && dossierPills.length > 0 && (
                <div className="smb-dossier-stats-pills">
                  {dossierPills.map((pill, pIdx) => (
                    <span key={pIdx} className="smb-dossier-pill">{pill}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="smb-dossier-right-col">
              <p className="smb-dossier-prose">
                {dossierProse1}
              </p>
              {dossierProse2 && (
                <p className="smb-dossier-prose" style={{ marginBottom: 0 }}>
                  {dossierProse2}
                </p>
              )}
            </div>
          </div>

          {/* ── ROW 4: Strategic Takeaways + Chapter Narrative Side-by-Side ── */}
          <div className="smb-split-row">
            
            {/* Left: Chapter Narrative Card */}
            <div className="smb-chapter-narrative-card">
              <h2 className="smb-row-card-title">
                {section3Title}
              </h2>
              <p className="smb-row-prose">
                {section3Prose1}
              </p>
              {section3Prose2 && (
                <p className="smb-row-prose" style={{ marginBottom: 0 }}>
                  {section3Prose2}
                </p>
              )}
            </div>

            {/* Right: Key Takeaways Card */}
            <div className="smb-takeaways-card" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="smb-takeaways-header">
                <Lightbulb size={18} className="smb-sparkle-icon" />
                <h3>Key Takeaways for Indian Entrepreneurs</h3>
              </div>
              <ul className="smb-takeaways-list">
                {takeaways.map((item, tIdx) => (
                  <li key={tIdx}>
                    <CheckCircle size={16} className="smb-check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* ── ROW 5: Article Footer Split Row: Author Profile on Left, Community Engagement & Tags on Right ── */}
          <div className="smb-split-row smb-footer-split-row">
            
            {/* Left: Author Profile Bio Card */}
            <div className="smb-author-bio-card">
              <img 
                src={authorAvatar} 
                alt={authorName} 
                className="smb-bio-avatar-img"
              />
              <div className="smb-bio-details">
                <div className="smb-bio-header">
                  <div>
                    <h4 className="smb-bio-name">{authorName}</h4>
                    <span className="smb-bio-role">{authorRole}</span>
                  </div>
                  <span className="smb-verified-badge-pill">
                    <CheckCircle size={12} fill="#ea580c" color="#ffffff" />
                    Verified Desk
                  </span>
                </div>
                <p className="smb-bio-summary">
                  {bioSummary}
                </p>
              </div>
            </div>

            {/* Right: Engagement & Topic Pills Card */}
            <div className="smb-engagement-footer-card">
              <div className="smb-footer-actions-row">
                <button 
                  type="button" 
                  className={`smb-clap-btn ${liked ? 'active' : ''}`}
                  onClick={handleClap}
                >
                  <Heart size={18} fill={liked ? '#dc2626' : 'none'} color={liked ? '#dc2626' : 'currentColor'} />
                  <span>{liked ? 'Applauded' : 'Clap for Story'}</span>
                  <span className="smb-clap-counter">{likeCount}</span>
                </button>

                <button 
                  type="button" 
                  className="smb-secondary-action-btn"
                  onClick={handleShare}
                >
                  <Share2 size={16} />
                  <span>{copied ? 'Link Copied!' : 'Share Story'}</span>
                </button>

                <button 
                  type="button" 
                  className={`smb-secondary-action-btn ${isArticleSaved ? 'saved' : ''}`}
                  onClick={() => onToggleSave && onToggleSave(mergedStory)}
                >
                  <Bookmark size={16} fill={isArticleSaved ? '#ea580c' : 'none'} color={isArticleSaved ? '#ea580c' : 'currentColor'} />
                  <span>{isArticleSaved ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
              </div>

              {/* Hashtag Pills */}
              <div className="smb-article-tags-wrap" style={{ marginTop: '1.25rem' }}>
                {tags.map(tag => (
                  <span key={tag} className="smb-story-tag-pill">#{tag}</span>
                ))}
              </div>
            </div>

          </div>

          {/* ── ROW 6: Reader Perspectives & Discussion (Horizontally in one row) ── */}
          <section className="fs-discussion-section" style={{ width: '100%', marginTop: '1.5rem' }}>
            <div className="fs-discussion-header">
              <h3>
                <MessageSquare size={19} />
                <span>Reader Discussion ({comments.length})</span>
              </h3>
              <span className="fs-rules-tag">Community Moderated</span>
            </div>

            <div className="fs-discussion-split-row">
              {/* Left Column: Post Perspective Form Card */}
              <form onSubmit={handlePostComment} className="fs-comment-box-form">
                <div className="fs-form-card-header">
                  <h4 className="fs-form-card-title">Share Your Perspective</h4>
                  <span className="fs-rules-tag">Community Rules</span>
                </div>

                <div className="fs-form-inputs-group">
                  <input 
                    type="text" 
                    placeholder="Your Name / Designation..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="fs-comment-input"
                  />
                  <textarea 
                    className="fs-comment-textarea"
                    placeholder="Share your perspective, operational counterpoint, or industry insights..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                </div>

                <div className="fs-comment-form-actions">
                  <span className="fs-hint-text">Markdown supported</span>
                  <button type="submit" className="pitch-btn fs-submit-btn">
                    <Send size={13} />
                    <span>Post Perspective</span>
                  </button>
                </div>
              </form>

              {/* Right Column: Recent Perspectives Feed */}
              <div className="fs-comments-feed-col">
                <div className="fs-comments-feed">
                  {comments.map((comment) => (
                    <div key={comment.id} className="fs-comment-bubble">
                      <div className="fs-bubble-top">
                        <div className="fs-bubble-user">
                          <div className="fs-bubble-avatar">{comment.author.charAt(0)}</div>
                          <div>
                            <div className="fs-bubble-name">{comment.author}</div>
                            <div className="fs-bubble-role">{comment.role} • {comment.time}</div>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className={`fs-bubble-like-btn ${comment.isLiked ? 'active' : ''}`}
                          onClick={() => handleLikeComment(comment.id)}
                          title={comment.isLiked ? "Unlike / remove like" : "Applaud perspective (1 like)"}
                          aria-pressed={Boolean(comment.isLiked)}
                        >
                          <ThumbsUp size={12} fill={comment.isLiked ? "currentColor" : "none"} />
                          <span>{comment.likes || 0}</span>
                        </button>
                      </div>
                      <p className="fs-bubble-text">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* 6. SIMILAR STORIES GRID (8 CARDS IN 2 ROWS) */}
        {similarStories.length > 0 && (
          <section className="smb-similar-stories-section">
            
            <div className="smb-similar-header-row">
              <div>
                <h2 className="smb-similar-title">Similar Stories</h2>
                <p className="smb-similar-subtitle">
                  More stories you can explore from across GoReadPost desks
                </p>
              </div>

              <button 
                type="button" 
                className="smb-view-all-btn"
                onClick={onBack}
              >
                <span>Explore All Desks</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="smb-similar-cards-grid">
              {similarStories.map((item) => {
                const isItemSaved = isSaved ? isSaved(item.id || item._id) : false;
                const itemCat = item.categoryLabel || item.categoryTag || item.tag || item.category || 'FEATURED';
                const itemAuthor = typeof item.author === 'string' ? item.author : item.author?.name || 'Editorial Desk';
                const itemAvatar = item.author?.avatar || item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

                return (
                  <article 
                    key={item.id || item._id} 
                    className="smb-similar-card"
                    onClick={() => handleSimilarCardClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="smb-similar-card-media">
                      <img 
                        src={item.image || item.heroImage || item.featuredImage?.url || item.featuredImage || item.fallbackImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80'} 
                        alt={item.title} 
                        className="smb-similar-card-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = item.fallbackImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="smb-similar-cat-badge">{itemCat}</span>
                      <button 
                        type="button" 
                        className={`smb-similar-bookmark-btn ${isItemSaved ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSave) onToggleSave(item);
                        }}
                        title={isItemSaved ? 'Saved' : 'Save'}
                        aria-label="Bookmark"
                      >
                        <Bookmark size={14} fill={isItemSaved ? '#ea580c' : 'none'} color={isItemSaved ? '#ea580c' : 'white'} />
                      </button>
                    </div>

                    <div className="smb-similar-card-body">
                      <div className="smb-similar-card-date-row">
                        <span className="smb-similar-date">{item.publishedAt || item.date || 'Recent'}</span>
                      </div>

                      <h3 className="smb-similar-card-title">{item.title}</h3>
                      <p className="smb-similar-card-desc">{item.subtitle || item.summary}</p>
                      
                      <div className="smb-similar-card-footer">
                        <div className="smb-similar-author-row">
                          <img 
                            src={itemAvatar} 
                            alt={itemAuthor} 
                            className="smb-similar-avatar"
                          />
                          <span className="smb-similar-author-name">{itemAuthor}</span>
                        </div>
                        <span className="smb-similar-read-pill">
                          <Clock size={11} />
                          {item.readTime || '4 min'}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

          </section>
        )}

      </div>
    </div>
  );
}
