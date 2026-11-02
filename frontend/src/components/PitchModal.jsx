import React, { useState, useEffect } from 'react';
import { 
  X, Send, FileText, Video as VideoIcon, Sparkles, Image as ImageIcon, 
  Clock, Tag, User, Link as LinkIcon, Play, Check, AlertCircle, HelpCircle,
  Heading2, Bold, Italic, List, Quote, ExternalLink, Film, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthService } from '../services/authService';
import { ArticleService } from '../services/articleService';
import { VideoService } from '../services/videoService';
import { SubmissionService } from '../services/submissionService';

// Preset sample hero images for quick selection
const SAMPLE_ARTICLE_IMAGES = [
  { label: 'AI & DeepTech', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Startup Founder', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Tech Lab & Robot', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Enterprise Cloud', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80' }
];

export function parseYouTubeUrl(input) {
  if (!input) return null;
  const str = String(input).trim();
  const ytMatch = str.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      maxResThumb: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      hqThumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    };
  }
  return null;
}

export function slugify(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PitchModal({ isOpen, onClose, onAddStory, onShowToast, currentUser: propUser }) {
  const authorUser = propUser || AuthService.getUser() || { name: 'Aditi Shrivastava', email: 'aditi-shrivastava@goreadpost.com', role: 'AUTHOR' };
  const scrollContainerRef = React.useRef(null);
  const titleInputRef = React.useRef(null);
  
  // Pitch mode: 'article' | 'video'
  const [pitchType, setPitchType] = useState('article');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Article Form State (Matching Admin Article Form)
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    categoryName: 'Startups',
    categoryId: 'cat_startups',
    readingTime: '4 min read',
    featuredImageUrl: SAMPLE_ARTICLE_IMAGES[0].url,
    tags: 'Startups, Innovation, Tech',
    content: ''
  });

  // 2. Video Form State (Matching Admin Video Form)
  const [videoForm, setVideoForm] = useState({
    title: '',
    slug: '',
    videoUrl: '',
    youtubeEmbedUrl: '',
    image: '',
    duration: '18:30',
    category: 'interviews',
    categoryLabel: 'Founder Interview',
    series: 'Founders Unfiltered',
    guestName: '',
    guestRole: '',
    description: '',
    tags: 'FounderStories, DeepTech, Leadership'
  });

  // Reset or initialize state
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-generate slug for article
  const handleArticleTitleChange = (val) => {
    setArticleForm(prev => ({
      ...prev,
      title: val,
      slug: slugify(val)
    }));
  };

  // Auto-generate slug & parse YouTube for video
  const handleVideoUrlChange = (val) => {
    const parsed = parseYouTubeUrl(val);
    setVideoForm(prev => ({
      ...prev,
      videoUrl: val,
      youtubeEmbedUrl: parsed ? parsed.embedUrl : (val.includes('embed') ? val : ''),
      image: prev.image || (parsed ? (parsed.maxResThumb || parsed.hqThumb) : prev.image)
    }));
  };

  const handleVideoTitleChange = (val) => {
    setVideoForm(prev => ({
      ...prev,
      title: val,
      slug: slugify(val)
    }));
  };

  // Quick formatting insertion for article content
  const insertFormatting = (token) => {
    setArticleForm(prev => {
      let addition = '';
      if (token === 'h2') addition = '\n\n## Section Headline\n';
      else if (token === 'h3') addition = '\n\n### Sub-heading\n';
      else if (token === 'bold') addition = ' **key insight** ';
      else if (token === 'italic') addition = ' *highlighted quote* ';
      else if (token === 'bullet') addition = '\n- First major takeaway\n- Second growth factor\n- Third innovation driver\n';
      else if (token === 'quote') addition = '\n\n> "Building a high-conviction product requires solving the bottleneck 10x better than existing alternatives."\n\n';
      return { ...prev, content: (prev.content || '') + addition };
    });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');

    // Field-by-field validation with auto-focus & scroll
    if (pitchType === 'article') {
      if (!articleForm.title.trim()) {
        const msg = 'Please enter an Article Headline / Title.';
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg);
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => titleInputRef.current?.focus(), 100);
        return;
      }
      if (!articleForm.subtitle.trim()) {
        const msg = 'Please enter a Subtitle / Card Hook.';
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg);
        return;
      }
      if (!articleForm.content.trim()) {
        const msg = 'Please enter the Article Story Text.';
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg);
        return;
      }
    } else {
      if (!videoForm.title.trim()) {
        const msg = 'Please enter a Video Title.';
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg);
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!videoForm.videoUrl.trim()) {
        const msg = 'Please provide a YouTube video URL.';
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg);
        return;
      }
      if (!videoForm.description.trim()) {
        const msg = 'Please enter video show notes or description.';
        setErrorMsg(msg);
        if (onShowToast) onShowToast(msg);
        return;
      }
    }

    setSubmitting(true);

    try {
      if (pitchType === 'article') {
        const cleanSlug = articleForm.slug.trim() || slugify(articleForm.title) || ('story-' + Date.now());
        const authorName = authorUser.name || authorUser.username || 'Contributing Author';
        const authorAvatar = authorUser.avatar || authorUser.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';
        const authorTitle = authorUser.title || authorUser.designation || 'Staff Reporter & Author';

        const articlePayload = {
          title: articleForm.title.trim(),
          slug: cleanSlug,
          subtitle: articleForm.subtitle.trim(),
          excerpt: articleForm.subtitle.trim(),
          categoryName: articleForm.categoryName,
          // Explicit null to avoid MongoDB ObjectId CastError
          categoryId: null,
          authorId: null,
          readingTime: articleForm.readingTime || '4 min read',
          featuredImage: {
            url: articleForm.featuredImageUrl || SAMPLE_ARTICLE_IMAGES[0].url,
            alt: articleForm.title.trim(),
            caption: 'Story pitched by ' + authorName
          },
          image: articleForm.featuredImageUrl || SAMPLE_ARTICLE_IMAGES[0].url,
          authorName,
          authorAvatar,
          authorTitle,
          tags: articleForm.tags,
          content: articleForm.content.trim(),
          status: 'draft',
          isPitch: true,
          pitchedBy: authorName,
          pitchedByEmail: authorUser.email || '',
          pitchedAt: new Date().toISOString()
        };

        // 1. Persist to Backend API as Draft
        const createdArticle = await ArticleService.createArticle(articlePayload);
        const draftArticleId = createdArticle?._id || createdArticle?.id || null;

        // 2. Register into Submissions so it shows on Admin Submissions (/admin/submissions)
        try {
          await SubmissionService.createSubmission({
            type: 'pitch',
            pitchFormat: 'article',
            draftArticleId: draftArticleId ? String(draftArticleId) : null,
            startupName: articleForm.categoryName || 'Author Story Pitch',
            founderName: authorName,
            founderRole: authorTitle,
            sector: articleForm.categoryName || 'Startups',
            stage: 'Authored Story Draft',
            headline: articleForm.title.trim(),
            summary: articleForm.subtitle.trim(),
            details: articleForm.content.trim().slice(0, 500) + (articleForm.content.length > 500 ? '...' : ''),
            coverImage: articleForm.featuredImageUrl || SAMPLE_ARTICLE_IMAGES[0].url,
            name: authorName,
            email: authorUser.email || '',
            authorEmail: authorUser.email || '',
            category: articleForm.categoryName,
            status: 'pending'
          });
        } catch (submErr) {
          console.warn('Submission registration warning:', submErr);
        }

        // Celebrate submission
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch (cErr) {}

        if (onShowToast) {
          onShowToast('🎉 Pitch Submitted! Your article "' + articleForm.title + '" has been sent to the Admin Panel for review & approval.');
        }
        onClose();

      } else {
        // Video Pitch Submission
        const parsed = parseYouTubeUrl(videoForm.videoUrl);
        const embedUrl = videoForm.youtubeEmbedUrl || (parsed ? parsed.embedUrl : videoForm.videoUrl);
        const thumbUrl = videoForm.image || (parsed ? (parsed.maxResThumb || parsed.hqThumb) : 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80');
        const cleanSlug = videoForm.slug.trim() || slugify(videoForm.title) || ('video-' + Date.now());
        const authorName = authorUser.name || authorUser.username || 'Editorial Bureau';

        const videoPayload = {
          title: videoForm.title.trim(),
          slug: cleanSlug,
          videoUrl: videoForm.videoUrl.trim(),
          youtubeEmbedUrl: embedUrl,
          image: thumbUrl,
          duration: videoForm.duration || '24:00',
          category: videoForm.category,
          categoryLabel: videoForm.categoryLabel,
          series: videoForm.series,
          guestName: videoForm.guestName || '',
          guestRole: videoForm.guestRole || '',
          author: authorName,
          description: videoForm.description.trim(),
          tags: videoForm.tags.split(',').map(t => t.trim()).filter(Boolean),
          status: 'draft',
          isPitch: true,
          pitchedBy: authorName,
          pitchedByEmail: authorUser.email || '',
          pitchedAt: new Date().toISOString()
        };

        // 1. Persist to Backend Video API as Draft
        const createdVideo = await VideoService.createVideo(videoPayload);
        const draftVideoId = createdVideo?._id || createdVideo?.id || null;

        // 2. Register into Submissions so it shows on Admin Submissions (/admin/submissions)
        try {
          await SubmissionService.createSubmission({
            type: 'pitch',
            pitchFormat: 'video',
            draftVideoId: draftVideoId ? String(draftVideoId) : null,
            startupName: videoForm.series || videoForm.categoryLabel || 'Video Story Pitch',
            founderName: authorName,
            founderRole: authorUser.title || 'Video Creator',
            sector: videoForm.categoryLabel || videoForm.category || 'Interviews',
            stage: 'Authored Video Draft',
            headline: videoForm.title.trim(),
            summary: videoForm.description.trim().slice(0, 300),
            details: `YouTube URL: ${videoForm.videoUrl}\nDuration: ${videoForm.duration || '20:00'}\nSeries: ${videoForm.series}\n\n${videoForm.description.trim()}`,
            coverImage: thumbUrl,
            videoUrl: videoForm.videoUrl.trim(),
            name: authorName,
            email: authorUser.email || '',
            authorEmail: authorUser.email || '',
            category: videoForm.categoryLabel || videoForm.category,
            status: 'pending'
          });
        } catch (submErr) {
          console.warn('Video submission registration warning:', submErr);
        }

        // Celebrate submission
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch (cErr) {}

        if (onShowToast) {
          onShowToast('🎬 Video Story Pitched! Your video "' + videoForm.title + '" has been sent to the Admin Panel for review & approval.');
        }
        onClose();
      }
    } catch (err) {
      console.error('Pitch submission error:', err);
      const msg = err.message || 'Failed to submit pitch story. Please review form fields.';
      setErrorMsg(msg);
      if (onShowToast) onShowToast(msg);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const parsedVideoPreview = parseYouTubeUrl(videoForm.videoUrl);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999, overflowY: 'auto', padding: '1.5rem 1rem' }}>
      <div 
        className="pitch-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: 'var(--bg-card, #ffffff)'
        }}
      >
        {/* 1. Modal Top Bar */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-light, #e5e7eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface, #ffffff)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(220, 38, 38, 0.12)',
                color: '#dc2626',
                textTransform: 'uppercase'
              }}>
                ✍️ Author Studio
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6b7280)' }}>
                Pitch Story &amp; Publish Live
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-primary, #0f172a)' }}>
              {pitchType === 'article' ? 'Create & Publish Article' : 'Submit & Publish Video Story'}
            </h2>
          </div>

          <button 
            type="button" 
            className="reader-close-btn" 
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary, #f1f5f9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary, #475569)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Format Selector Tabs (Article vs Video) */}
        <div style={{
          padding: '0.85rem 1.75rem',
          background: 'var(--bg-secondary, #f8fafc)',
          borderBottom: '1px solid var(--border-light, #e5e7eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => { setPitchType('article'); setErrorMsg(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: pitchType === 'article' ? '2px solid #dc2626' : '1px solid var(--border-light, #cbd5e1)',
                background: pitchType === 'article' ? '#ffffff' : 'transparent',
                color: pitchType === 'article' ? '#dc2626' : 'var(--text-secondary, #475569)',
                fontWeight: 750,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: pitchType === 'article' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <FileText size={16} color={pitchType === 'article' ? '#dc2626' : 'currentColor'} />
              <span>Article Story</span>
            </button>

            <button
              type="button"
              onClick={() => { setPitchType('video'); setErrorMsg(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: pitchType === 'video' ? '2px solid #dc2626' : '1px solid var(--border-light, #cbd5e1)',
                background: pitchType === 'video' ? '#ffffff' : 'transparent',
                color: pitchType === 'video' ? '#dc2626' : 'var(--text-secondary, #475569)',
                fontWeight: 750,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: pitchType === 'video' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <VideoIcon size={16} color={pitchType === 'video' ? '#dc2626' : 'currentColor'} />
              <span>Video Story</span>
            </button>
          </div>

          {/* Author Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            padding: '4px 10px',
            borderRadius: '20px'
          }}>
            <span style={{ color: '#64748b' }}>Author Byline:</span>
            <strong style={{ color: '#dc2626' }}>{authorUser.name || 'Aditi Shrivastava'}</strong>
          </div>
        </div>

        {/* 3. Form Content (Scrollable) */}
        <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '0.84rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Editorial Review Workflow Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            fontSize: '0.8rem',
            marginBottom: '1.25rem',
            lineHeight: 1.45
          }}>
            <HelpCircle size={18} style={{ flexShrink: 0, color: '#3b82f6' }} />
            <span>
              <strong>Editorial Approval Workflow:</strong> When you submit a story, it is routed directly to the <strong>Admin Panel</strong> for review. Once approved by an editor or administrator, your story will be published live on the frontend.
            </span>
          </div>

          <form id="pitch-story-form" noValidate onSubmit={handleSubmit}>
            {/* ======================================================== */}
            {/* A. ARTICLE CREATION VIEW (Matches Admin Article Studio) */}
            {/* ======================================================== */}
            {pitchType === 'article' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Title & Slug */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 750, color: 'var(--text-primary)' }}>
                    Article Headline / Title *
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    required
                    placeholder="e.g. How Edge AI &amp; Neural Sensors Are Transforming Industrial Robotics"
                    value={articleForm.title}
                    onChange={(e) => handleArticleTitleChange(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '1rem', fontWeight: 650 }}
                  />
                  {articleForm.slug && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Slug: <code style={{ color: '#0284c7' }}>/article/{articleForm.slug}</code>
                    </div>
                  )}
                </div>

                {/* 2. Category & Reading Time Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>Desk / Category *</label>
                    <select
                      className="form-select"
                      value={articleForm.categoryName}
                      onChange={(e) => {
                        const val = e.target.value;
                        const catId = val.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        setArticleForm(prev => ({ ...prev, categoryName: val, categoryId: `cat_${catId}` }));
                      }}
                    >
                      <option value="Startups">Startups</option>
                      <option value="Technology">Technology</option>
                      <option value="AI & DeepTech">AI &amp; DeepTech</option>
                      <option value="Enterprise">Enterprise &amp; SaaS</option>
                      <option value="SMBStory">SMBStory / D2C</option>
                      <option value="HerStory">HerStory</option>
                      <option value="SocialStory">SocialStory</option>
                      <option value="FinTech">FinTech</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>Reading Time</label>
                    <select
                      className="form-select"
                      value={articleForm.readingTime}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, readingTime: e.target.value }))}
                    >
                      <option value="3 min read">3 min read</option>
                      <option value="4 min read">4 min read</option>
                      <option value="5 min read">5 min read</option>
                      <option value="6 min read">6 min read</option>
                      <option value="8 min read">8 min read</option>
                      <option value="10 min read">10 min read (Deep Dive)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Subtitle / Card Excerpt */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 750, color: 'var(--text-primary)' }}>
                    Subtitle / Card Hook *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="A punchy 1-2 sentence lead explaining why this story matters to founders and operators..."
                    value={articleForm.subtitle}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="form-input"
                  />
                </div>

                {/* 4. Featured Image URL + Quick Presets + Preview */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Featured Cover Image URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={articleForm.featuredImageUrl}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, featuredImageUrl: e.target.value }))}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                  </div>

                  {/* Presets */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Quick image presets:</span>
                    {SAMPLE_ARTICLE_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setArticleForm(prev => ({ ...prev, featuredImageUrl: preset.url }))}
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: articleForm.featuredImageUrl === preset.url ? '1px solid #dc2626' : '1px solid #cbd5e1',
                          background: articleForm.featuredImageUrl === preset.url ? '#fef2f2' : '#ffffff',
                          color: articleForm.featuredImageUrl === preset.url ? '#dc2626' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Thumbnail Preview */}
                  {articleForm.featuredImageUrl && (
                    <div style={{ marginTop: '8px', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#000' }}>
                      <img 
                        src={articleForm.featuredImageUrl} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* 5. Article Full Content with formatting toolbar */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 750 }}>
                      Article Body / Story Text *
                    </label>

                    {/* Toolbar buttons */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        type="button" 
                        title="Add Heading"
                        onClick={() => insertFormatting('h2')}
                        style={{ padding: '3px 7px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        H2
                      </button>
                      <button 
                        type="button" 
                        title="Add Sub-heading"
                        onClick={() => insertFormatting('h3')}
                        style={{ padding: '3px 7px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        H3
                      </button>
                      <button 
                        type="button" 
                        title="Add Bullet Points"
                        onClick={() => insertFormatting('bullet')}
                        style={{ padding: '3px 7px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        • List
                      </button>
                      <button 
                        type="button" 
                        title="Add Pullquote"
                        onClick={() => insertFormatting('quote')}
                        style={{ padding: '3px 7px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        "Quote
                      </button>
                    </div>
                  </div>

                  <textarea
                    required
                    rows={8}
                    className="form-textarea"
                    placeholder="Write your in-depth story here. Share the origin story, customer testimonials, technical architecture, and revenue milestones..."
                    value={articleForm.content}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                    style={{ lineHeight: 1.6, fontSize: '0.92rem', minHeight: '160px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    <span>Supports Markdown, paragraphs &amp; headings</span>
                    <span>{articleForm.content.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>

                {/* 6. Tags */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Story Tags &amp; Topics</label>
                  <input
                    type="text"
                    placeholder="e.g. Startups, AI, DeepTech, Funding"
                    value={articleForm.tags}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* B. VIDEO CREATION VIEW (Matches Admin Video Studio)    */}
            {/* ======================================================== */}
            {pitchType === 'video' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Video Title */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 750, color: 'var(--text-primary)' }}>
                    Video Story Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Building India's Largest SpaceTech Propulsion Stack: In Conversation with Agnikul"
                    value={videoForm.title}
                    onChange={(e) => handleVideoTitleChange(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '1rem', fontWeight: 650 }}
                  />
                  {videoForm.slug && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Video Slug: <code style={{ color: '#dc2626' }}>/videos/{videoForm.slug}</code>
                    </div>
                  )}
                </div>

                {/* 2. Video URL with live preview */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 750 }}>
                    YouTube Watch or Embed URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoForm.videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    className="form-input"
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    Paste standard YouTube link, Shorts, or embed link. Thumbnail is auto-detected.
                  </span>

                  {/* Live Embed Preview Player */}
                  {videoForm.youtubeEmbedUrl && (
                    <div style={{ marginTop: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#000', aspectRatio: '16/9', maxHeight: '200px' }}>
                      <iframe
                        src={videoForm.youtubeEmbedUrl}
                        title="Video Preview"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                {/* 3. Category, Series & Duration Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>Show Category</label>
                    <select
                      className="form-select"
                      value={videoForm.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const labelMap = {
                          interviews: 'Founder Interview',
                          masterclass: 'Studio Masterclass',
                          deeptech: 'DeepTech Special',
                          keynotes: 'Keynotes & Summits',
                          market: 'Market Dispatches'
                        };
                        setVideoForm(prev => ({ ...prev, category: val, categoryLabel: labelMap[val] || 'Founder Interview' }));
                      }}
                    >
                      <option value="interviews">Founder Interview</option>
                      <option value="masterclass">Studio Masterclass</option>
                      <option value="deeptech">DeepTech Special</option>
                      <option value="keynotes">Keynotes &amp; Summits</option>
                      <option value="market">Market Dispatches</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>Series Franchise</label>
                    <select
                      className="form-select"
                      value={videoForm.series}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, series: e.target.value }))}
                    >
                      <option value="Founders Unfiltered">Founders Unfiltered</option>
                      <option value="Studio Masterclass">Studio Masterclass</option>
                      <option value="DeepTech Horizons">DeepTech Horizons</option>
                      <option value="TechSparks Sessions">TechSparks Sessions</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 18:45"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* 4. Featured Guest Information */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary, #f8fafc)',
                  border: '1px solid var(--border-light, #e2e8f0)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '10px'
                }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Guest / Founder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Srinath Ravichandran"
                      value={videoForm.guestName}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, guestName: e.target.value }))}
                      className="form-input"
                      style={{ background: '#fff' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Guest Title &amp; Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Co-founder &amp; CEO, Agnikul Cosmos"
                      value={videoForm.guestRole}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, guestRole: e.target.value }))}
                      className="form-input"
                      style={{ background: '#fff' }}
                    />
                  </div>
                </div>

                {/* 5. Custom Thumbnail Cover (Optional override) */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Custom Thumbnail / Poster URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or auto-detected YouTube thumbnail"
                    value={videoForm.image}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, image: e.target.value }))}
                    className="form-input"
                  />
                </div>

                {/* 6. Description & Show Notes */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 750 }}>
                    Video Synopsis &amp; Show Notes *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="form-textarea"
                    placeholder="Detail the key topics covered in this video episode: discussion milestones, technology architecture, fundraising insights, and timestamps..."
                    value={videoForm.description}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                    style={{ lineHeight: 1.55 }}
                  />
                </div>

                {/* 7. Tags */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Video Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. DeepTech, StartupStory, SpaceTech, FoundersUnfiltered"
                    value={videoForm.tags}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Error Notice if Error occurred */}
        {errorMsg && (
          <div style={{
            padding: '8px 1.75rem',
            background: '#fef2f2',
            borderTop: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 650
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 4. Modal Action Bar (Sticky Footer) */}
        <div style={{
          padding: '1rem 1.75rem',
          borderTop: '1px solid var(--border-light, #e5e7eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface, #ffffff)',
          position: 'sticky',
          bottom: 0,
          zIndex: 10
        }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #cbd5e1)',
              background: 'transparent',
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 22px',
              borderRadius: '8px',
              background: submitting ? '#94a3b8' : '#dc2626',
              border: 'none',
              color: '#ffffff',
              fontWeight: 750,
              fontSize: '0.9rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            {submitting ? (
              <span>Submitting for review...</span>
            ) : pitchType === 'article' ? (
              <>
                <Send size={15} />
                <span>Submit Article for Approval</span>
              </>
            ) : (
              <>
                <Play size={15} />
                <span>Submit Video for Approval</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
