import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, ArrowRight, AlertCircle, RefreshCw, CheckCircle, Share2, 
  Bookmark, Link2, Mail, Check, Quote, Lock, Edit3, Trash2, X,
  ChevronRight, ChevronDown, ChevronUp, ExternalLink, MessageSquare, ThumbsUp, Send, Sparkles, Star
} from 'lucide-react';
import { ArticleService } from '../services/articleService';
import { CommentService } from '../services/commentService';
import { AuthService } from '../services/authService';
import { ALL_STORIES } from '../data/storiesData';
import './ArticlePage.css';

function getReaderClientId() {
  if (typeof window === 'undefined') return 'guest_reader';
  try {
    let cid = localStorage.getItem('goreadpost_reader_client_id');
    if (!cid) {
      cid = 'rdr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('goreadpost_reader_client_id', cid);
    }
    return cid;
  } catch (e) {
    return 'guest_reader';
  }
}

export default function ArticlePage({
  slug,
  story = null,
  onBack,
  isSaved,
  onToggleSave,
  onShareStory,
  onShowToast,
  onClapStory,
  onSelectStory,
  stories = [],
  currentUser: propUser = null,
  onOpenAuthModal
}) {
  const [article, setArticle] = useState(story);
  const [loading, setLoading] = useState(!story && Boolean(slug));
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);

  // Authentication State for Comments & Discussion
  const [currentUser, setCurrentUser] = useState(() => propUser || AuthService.getUser() || AuthService.getAdminUser());

  useEffect(() => {
    if (propUser !== undefined) {
      setCurrentUser(propUser);
    }
  }, [propUser]);

  useEffect(() => {
    const handleAuth = (e) => setCurrentUser(e.detail || AuthService.getUser() || AuthService.getAdminUser());
    const handleLogout = () => setCurrentUser(null);
    window.addEventListener('auth:login', handleAuth);
    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:change', handleAuth);
    return () => {
      window.removeEventListener('auth:login', handleAuth);
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:change', handleAuth);
    };
  }, []);

  // Reader Discussion & Comments State (persisted permanently in DB per post)
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newComment, setNewComment] = useState('');

  // Post slug identifier for discussion
  const activeSlug = slug || story?.slug || article?.slug || (story?._id || story?.id || article?._id || article?.id);

  // Fetch comments from database whenever the article/slug changes
  useEffect(() => {
    if (!activeSlug) return;
    let isCancelled = false;
    setLoadingComments(true);

    CommentService.getComments(activeSlug)
      .then((data) => {
        if (!isCancelled && Array.isArray(data)) {
          setComments(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load discussion comments:', err);
      })
      .finally(() => {
        if (!isCancelled) setLoadingComments(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSlug]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      if (onShowToast) onShowToast('Please sign in to share your perspective.');
      if (onOpenAuthModal) onOpenAuthModal('login');
      return;
    }

    if (!newComment.trim() || isSubmittingComment) return;

    const targetSlug = activeSlug || 'general';
    const authorVal = currentUser.name || currentUser.username || (newAuthor.trim() || 'Community Reader');
    const roleVal = currentUser.title || currentUser.designation || (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' ? 'Editorial Team' : 'Community Member');

    const optimisticId = 'temp_' + Date.now();
    const optimisticItem = {
      id: optimisticId,
      _id: optimisticId,
      author: authorVal,
      role: roleVal,
      time: 'Just now',
      text: newComment.trim(),
      likes: 0
    };

    // Optimistically show in UI
    setComments(prev => [optimisticItem, ...prev]);
    const submittedText = newComment.trim();
    setNewComment('');
    setIsSubmittingComment(true);

    try {
      const saved = await CommentService.postComment(targetSlug, {
        author: authorVal,
        role: roleVal,
        text: submittedText
      });
      if (saved) {
        setComments(prev => prev.map(c => (c.id === optimisticId || c._id === optimisticId) ? saved : c));
      }
      if (onShowToast) onShowToast('Thank you! Your perspective has been saved to the database.');
    } catch (err) {
      console.error('Failed to save comment to database:', err);
      if (err.message && err.message.toLowerCase().includes('sign in')) {
        if (onShowToast) onShowToast(err.message);
        if (onOpenAuthModal) onOpenAuthModal('login');
      } else if (onShowToast) {
        onShowToast(err.message || 'Failed to post perspective.');
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    const userIdentifier = currentUser ? String(currentUser.id || currentUser._id || currentUser.email) : getReaderClientId();

    // Optimistically toggle like (strictly 1 like per user or unlike)
    setComments(prev => prev.map(c => {
      if (c.id === commentId || c._id === commentId) {
        const likedBy = Array.isArray(c.likedBy) ? [...c.likedBy] : [];
        const alreadyLiked = likedBy.includes(userIdentifier);
        const updatedLikedBy = alreadyLiked
          ? likedBy.filter(id => id !== userIdentifier)
          : [...likedBy, userIdentifier];
        const updatedLikes = alreadyLiked
          ? Math.max(0, (c.likes || 1) - 1)
          : (c.likes || 0) + 1;

        return {
          ...c,
          likes: updatedLikes,
          likedBy: updatedLikedBy,
          isLiked: !alreadyLiked
        };
      }
      return c;
    }));

    try {
      const res = await CommentService.likeComment(commentId, userIdentifier);
      if (res && typeof res.likes === 'number') {
        setComments(prev => prev.map(c => {
          if (c.id === commentId || c._id === commentId) {
            const likedBy = Array.isArray(c.likedBy) ? [...c.likedBy] : [];
            let finalLikedBy = likedBy;
            if (res.liked && !finalLikedBy.includes(userIdentifier)) {
              finalLikedBy = [...finalLikedBy, userIdentifier];
            } else if (!res.liked && finalLikedBy.includes(userIdentifier)) {
              finalLikedBy = finalLikedBy.filter(id => id !== userIdentifier);
            }
            return {
              ...c,
              likes: res.likes,
              likedBy: finalLikedBy,
              isLiked: res.liked
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.warn('Could not toggle comment like:', err);
    }
  };

  // Edit & Delete Perspective Handlers
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const checkIsCommentOwner = (comment) => {
    if (!currentUser || !comment) return false;
    const currentUserId = String(currentUser.id || currentUser._id || '');
    const commentUserId = String(comment.userId || '');
    if (currentUserId && commentUserId && currentUserId === commentUserId) return true;
    if (comment.userEmail && currentUser.email && comment.userEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (comment.author && (currentUser.name || currentUser.username) && comment.author.toLowerCase() === (currentUser.name || currentUser.username).toLowerCase()) return true;
    if (AuthService.isStaff && AuthService.isStaff(currentUser)) return true;
    return false;
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id || comment._id);
    setEditCommentText(comment.text || '');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editCommentText.trim() || isUpdatingComment) return;
    setIsUpdatingComment(true);
    try {
      const updated = await CommentService.updateComment(commentId, editCommentText.trim());
      setComments(prev => prev.map(c => {
        if (c.id === commentId || c._id === commentId) {
          return {
            ...c,
            text: updated.text || editCommentText.trim(),
            isEdited: true
          };
        }
        return c;
      }));
      setEditingCommentId(null);
      setEditCommentText('');
      if (onShowToast) onShowToast('Your perspective has been updated successfully.');
    } catch (err) {
      console.error('Failed to update perspective:', err);
      if (onShowToast) onShowToast(err.message || 'Failed to update perspective.');
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this perspective?');
    if (!confirmDelete) return;

    setDeletingCommentId(commentId);
    try {
      await CommentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => (c.id !== commentId && c._id !== commentId)));
      if (onShowToast) onShowToast('Your perspective has been deleted.');
    } catch (err) {
      console.error('Failed to delete perspective:', err);
      if (onShowToast) onShowToast(err.message || 'Failed to delete perspective.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  // 1. Load article by slug if not provided or if slug changed
  useEffect(() => {
    if (!slug) {
      if (story) setArticle(story);
      return;
    }
    // If story already matches slug, display it immediately and sync latest from database in background
    if (story && (story.slug === slug || story.id === slug || story._id === slug)) {
      setArticle(story);
      setLoading(false);
      loadArticle(slug, true);
      return;
    }
    loadArticle(slug, false);
  }, [slug, story]);

  // 2. SEO Title, Metadata & JSON-LD Structured Data
  useEffect(() => {
    if (!article?.title) return;

    const pageTitle = article.seo?.title || `${article.title} | GoReadPost`;
    document.title = pageTitle;

    const metaDescText = article.seo?.description || article.excerpt || article.subtitle || '';
    const imgUrl = (typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage?.url) || article.image || '';
    const canonUrl = article.seo?.canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

    // Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', metaDescText);

    // Canonical Link
    let linkCanon = document.querySelector('link[rel="canonical"]');
    if (!linkCanon) {
      linkCanon = document.createElement('link');
      linkCanon.rel = 'canonical';
      document.head.appendChild(linkCanon);
    }
    linkCanon.setAttribute('href', canonUrl);

    // JSON-LD Structured Data
    const scriptId = 'article-structured-jsonld';
    let jsonLdScript = document.getElementById(scriptId);
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = scriptId;
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': article.title,
      'description': metaDescText,
      'image': imgUrl ? [imgUrl] : [],
      'datePublished': article.publishedAt || article.createdAt,
      'dateModified': article.updatedAt || article.publishedAt || article.createdAt,
      'author': {
        '@type': 'Person',
        'name': article.authorName || 'Editorial Desk'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'GoReadPost',
        'url': 'https://goreadpost.com'
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': canonUrl
      }
    };
    jsonLdScript.textContent = JSON.stringify(structuredData);

    return () => {
      document.title = 'GoReadPost - Business, Tech & Startup Intelligence';
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [article]);

  const loadArticle = async (targetSlug, isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await ArticleService.getArticleBySlug(targetSlug);
      if (data) {
        setArticle(data);
      } else if (!isBackground) {
        // Fallback: check live stories array
        const match = (stories || []).find(s => s.slug === targetSlug || s.id === targetSlug || s._id === targetSlug);
        if (match) {
          setArticle(match);
        } else {
          setError('Article not found or has been unpublished.');
        }
      }
    } catch (err) {
      if (!isBackground) {
        const match = (stories || []).find(s => s.slug === targetSlug || s.id === targetSlug || s._id === targetSlug);
        if (match) {
          setArticle(match);
        } else {
          setError(err.message || 'Article not found');
        }
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  // 3. Format and normalize current article fields
  const current = useMemo(() => {
    if (!article) return null;
    const catName = article.categoryName || article.categoryLabel || article.category || 'TECHNOLOGY';
    const sectionImg = (article.contentBlocks?.find(b => (b.images && b.images.length > 0) || b.image)?.images?.[0]?.url) || 
                       (typeof article.contentBlocks?.find(b => b.image)?.image === 'string' ? article.contentBlocks?.find(b => b.image)?.image : article.contentBlocks?.find(b => b.image)?.image?.url) || 
                       '';
    const rawImg = article.featuredImage?.url || 
                   (typeof article.featuredImage === 'string' ? article.featuredImage : null) || 
                   article.image || 
                   article.heroImage || 
                   sectionImg ||
                   '';

    const authorName = article.authorName || 
                       (typeof article.author === 'string' ? article.author : article.author?.name) || 
                       'Priya Sharma';
    const authorAvatar = article.authorAvatar || 
                         article.author?.avatar || 
                         article.avatar || 
                         'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';

    const publishedDate = article.publishedAt 
      ? new Date(article.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      : (article.date || '12 Jun 2025');

    const rawDuration = article.readingTime || article.readTime || '6 min read';
    const readDuration = typeof rawDuration === 'string' && rawDuration.toLowerCase().includes('min')
      ? rawDuration
      : `${rawDuration} min read`;

    const photoCredit = article.photoCredit || 
                        article.featuredImage?.credit || '';

    return {
      ...article,
      id: article.id || article._id || article.slug,
      title: article.title || 'How AI Is Changing Indian Startups: Opportunities, Challenges and What’s Next',
      subtitle: article.subtitle || article.excerpt || article.summary || 'From smarter automation to personalised customer experiences, AI is helping Indian startups build faster, scale bigger and solve real-world problems.',
      categoryName: catName.toUpperCase(),
      categorySlug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: rawImg,
      authorName,
      authorAvatar,
      publishedDate,
      readDuration,
      photoCredit,
      tags: Array.isArray(article.tags) ? article.tags : ['AI', 'Startups', 'India', 'Technology', 'Innovation', 'Future'],
      topics: Array.isArray(article.topics) && article.topics.length > 0
        ? article.topics
        : (Array.isArray(article.topicIds) ? article.topicIds.map(t => (typeof t === 'object' && t ? t.name : t)).filter(Boolean) : (article.topic ? [article.topic] : []))
    };
  }, [article]);

  // Check if current.image is already rendered inside the article body/sections
  const isCoverRenderedInBody = useMemo(() => {
    if (!current?.image || !Array.isArray(current?.contentBlocks)) return false;
    const cleanCover = current.image.trim().replace(/^https?:\/\/[^\/]+/, '').split('?')[0];
    if (!cleanCover) return false;

    for (const block of current.contentBlocks) {
      if (!block) continue;
      if (block.type === 'section') {
        if (Array.isArray(block.images)) {
          for (const img of block.images) {
            const u = (img?.url || (typeof img === 'string' ? img : '')).trim();
            if (u && (u === current.image || u.replace(/^https?:\/\/[^\/]+/, '').split('?')[0] === cleanCover)) {
              return true;
            }
          }
        }
        const singleSecImg = (block.image?.url || (typeof block.image === 'string' ? block.image : '')).trim();
        if (singleSecImg && (singleSecImg === current.image || singleSecImg.replace(/^https?:\/\/[^\/]+/, '').split('?')[0] === cleanCover)) {
          return true;
        }
      } else if (block.type === 'image' && block.url) {
        const u = block.url.trim();
        if (u === current.image || u.replace(/^https?:\/\/[^\/]+/, '').split('?')[0] === cleanCover) {
          return true;
        }
      } else if (block.type === 'gallery' && Array.isArray(block.images)) {
        for (const img of block.images) {
          const u = (img?.url || (typeof img === 'string' ? img : '')).trim();
          if (u && (u === current.image || u.replace(/^https?:\/\/[^\/]+/, '').split('?')[0] === cleanCover)) {
            return true;
          }
        }
      }
    }
    return false;
  }, [current?.image, current?.contentBlocks]);

  // Helper for category normalization and matching
  const normalizeCat = (cat) => {
    if (!cat) return '';
    if (typeof cat === 'object') {
      cat = cat.name || cat.slug || cat.title || '';
    }
    const s = String(cat).toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (s === 'ai' || s === 'ai-deeptech' || s === 'artificial-intelligence' || s === 'deep-tech' || s === 'deeptech' || s === 'ai-story') {
      return 'ai';
    }
    if (s === 'startup' || s === 'startups' || s === 'founder-first' || s === 'funding' || s === 'venture-capital') {
      return 'startups';
    }
    if (s === 'tech' || s === 'technology' || s === 'big-tech' || s === 'cloud' || s === 'software') {
      return 'technology';
    }
    if (s === 'enterprise' || s === 'saas' || s === 'b2b') {
      return 'enterprise';
    }
    if (s === 'fintech' || s === 'bfsi' || s === 'banking' || s === 'web3' || s === 'crypto') {
      return 'fintech';
    }
    if (s === 'her-story' || s === 'herstory' || s === 'women') {
      return 'herstory';
    }
    if (s === 'smb' || s === 'smbstory' || s === 'smb-story' || s === 'msme' || s === 'd2c' || s === 'retail') {
      return 'smbstory';
    }
    if (s === 'hindi' || s === 'ys-hindi' || s === 'yshindi') {
      return 'hindi';
    }
    if (s === 'social' || s === 'social-story' || s === 'socialstory' || s === 'impact' || s === 'climate') {
      return 'social-story';
    }
    if (s === 'leadership' || s === 'workplace') {
      return 'leadership';
    }
    return s;
  };

  const getCanonicalCat = (storyItem) => {
    if (!storyItem) return '';
    if (storyItem.category) {
      const n = normalizeCat(storyItem.category);
      if (n) return n;
    }
    if (storyItem.categoryName) {
      const n = normalizeCat(storyItem.categoryName);
      if (n) return n;
    }
    if (storyItem.categoryLabel) {
      const n = normalizeCat(storyItem.categoryLabel);
      if (n) return n;
    }
    if (storyItem.categorySlug) {
      const n = normalizeCat(storyItem.categorySlug);
      if (n) return n;
    }
    return '';
  };

  // Combined candidate pool of stories (live stories + curated fallback stories)
  const allStoriesPool = useMemo(() => {
    const list = Array.isArray(stories) && stories.length > 0 ? [...stories] : [];
    const seen = new Set();
    list.forEach(item => {
      const key = String(item.id || item._id || item.slug || item.title || '').trim();
      if (key) seen.add(key);
    });
    (ALL_STORIES || []).forEach(item => {
      const key = String(item.id || item._id || item.slug || item.title || '').trim();
      if (key && !seen.has(key)) {
        list.push(item);
        seen.add(key);
      }
    });
    return list;
  }, [stories]);

  // Helper to test if a candidate story is the currently open article
  const isCurrentArticle = (s) => {
    if (!current || !s) return false;
    const currentId = String(current.id || current._id || current.slug || '');
    const currentSlug = String(current.slug || '');
    const currentTitle = String(current.title || '').trim().toLowerCase();

    const sId = String(s.id || s._id || s.slug || '');
    if (currentId && (sId === currentId || s._id === currentId || s.id === currentId)) return true;
    if (currentSlug && (s.slug === currentSlug || sId === currentSlug)) return true;
    if (currentTitle && String(s.title || '').trim().toLowerCase() === currentTitle) return true;
    return false;
  };

  // 4. Related Articles (Intelligent matching: category match -> topics/tags -> fallback fill to always show 4 articles)
  const relatedArticles = useMemo(() => {
    if (!current) return [];
    const currentCatNorm = getCanonicalCat(current);
    const currentTopics = (current.topics || []).map(t => String(typeof t === 'object' && t ? t.name : t).toLowerCase().trim()).filter(Boolean);
    const currentTags = (current.tags || []).map(t => String(t).toLowerCase().trim()).filter(Boolean);

    // Candidates excluding current story
    const candidates = allStoriesPool.filter(s => !isCurrentArticle(s));

    // Relevance scoring
    const scored = candidates.map(s => {
      let score = 0;
      const sCatNorm = getCanonicalCat(s);

      // Exact category match gets high priority
      if (currentCatNorm && sCatNorm && sCatNorm === currentCatNorm) {
        score += 100;
      }

      // Matching topics or tags
      const sTopics = (s.topics || []).map(t => String(typeof t === 'object' && t ? t.name : t).toLowerCase().trim());
      const sTags = (s.tags || []).map(t => String(t).toLowerCase().trim());
      currentTopics.forEach(top => {
        if (sTopics.includes(top) || sTags.includes(top)) score += 25;
      });
      currentTags.forEach(tag => {
        if (sTags.includes(tag) || sTopics.includes(tag)) score += 15;
      });

      if (s.isTrending || s.trending) score += 10;

      const dateVal = s.publishedAt ? new Date(s.publishedAt).getTime() : 0;
      return { item: s, score, dateVal };
    });

    // Sort by relevance score desc, then date desc
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.dateVal - a.dateVal;
    });

    return scored.slice(0, 4).map(({ item }) => ({
      ...item,
      id: item.id || item._id || item.slug,
      slug: item.slug || item.id || item._id,
      title: item.title,
      image: item.image || item.heroImage || (typeof item.featuredImage === 'string' ? item.featuredImage : item.featuredImage?.url) || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=80',
      category: (item.categoryName || item.categoryLabel || item.category || current.categoryName || 'ARTICLE').toUpperCase(),
      date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : (item.date || 'Recent')
    }));
  }, [current, allStoriesPool]);

  // 4b. Latest Articles (Sorted by most recent publishedAt)
  const latestArticles = useMemo(() => {
    const list = allStoriesPool.filter(s => !isCurrentArticle(s));
    list.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    return list.slice(0, 4).map(item => ({
      ...item,
      id: item.id || item._id || item.slug,
      slug: item.slug || item.id || item._id,
      title: item.title,
      image: item.image || item.heroImage || (typeof item.featuredImage === 'string' ? item.featuredImage : item.featuredImage?.url) || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=80',
      category: (item.categoryName || item.categoryLabel || item.category || 'LATEST').toUpperCase(),
      date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : (item.date || 'Recent')
    }));
  }, [current, allStoriesPool]);

  // 5. Trending Now (5 items with numbered circle badges)
  const trendingArticles = useMemo(() => {
    const candidates = allStoriesPool.filter(s => !isCurrentArticle(s));
    const liveTrending = candidates.filter(s => s.isTrending || s.trending || (s.views && s.views > 20)).slice(0, 5);
    if (liveTrending.length > 0) {
      return liveTrending.map((s, idx) => ({
        id: s.id || s._id || s.slug || `trend-${idx}`,
        title: s.title,
        ...s
      }));
    }
    return candidates.slice(0, 5).map((s, idx) => ({
      id: s.id || s._id || s.slug || `trend-${idx}`,
      title: s.title,
      ...s
    }));
  }, [current, allStoriesPool]);

  // 6. Bottom "You May Also Like" (Articles with graceful fallback)
  const bottomArticles = useMemo(() => {
    if (!current) return [];
    const currentCatNorm = getCanonicalCat(current);
    const relatedIds = new Set(relatedArticles.map(r => String(r.id || r._id || r.slug || '')));

    const candidates = allStoriesPool.filter(s => !isCurrentArticle(s) && !relatedIds.has(String(s.id || s._id || s.slug || '')));

    const scored = candidates.map(s => {
      let score = 0;
      const sCatNorm = getCanonicalCat(s);
      if (currentCatNorm && sCatNorm && sCatNorm === currentCatNorm) score += 50;
      if (s.isTrending || s.trending) score += 10;
      const dateVal = s.publishedAt ? new Date(s.publishedAt).getTime() : 0;
      return { item: s, score, dateVal };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.dateVal - a.dateVal;
    });

    const poolToUse = scored.length >= 4 ? scored.map(x => x.item) : candidates;

    return poolToUse.slice(0, 4).map(s => ({
      ...s,
      id: s.id || s._id || s.slug,
      slug: s.slug || s.id || s._id,
      title: s.title,
      image: s.image || s.heroImage || (typeof s.featuredImage === 'string' ? s.featuredImage : s.featuredImage?.url) || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
      category: (s.categoryName || s.categoryLabel || s.category || current.categoryName || 'ARTICLE').toUpperCase(),
      date: s.publishedAt ? new Date(s.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : (s.date || 'Recent')
    }));
  }, [current, allStoriesPool, relatedArticles]);

  // Social Sharing Handlers
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://goreadpost.com';
  const shareTitle = current?.title || 'GoReadPost Editorial Story';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        if (onShowToast) onShowToast('Story link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const handleSubscribeNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    if (onShowToast) onShowToast('Thank you for subscribing to GoReadPost newsletter!');
    setNewsletterEmail('');
  };

  const handleTagClick = (tagStr) => {
    const slugTag = tagStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    window.history.pushState(null, '', `/tag/${slugTag}`);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTopicClick = (topicStr) => {
    const slugTopic = topicStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    window.history.pushState(null, '', `/topic/${slugTopic}`);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (catSlug) => {
    window.history.pushState(null, '', `/category/${catSlug}`);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateLatest = () => {
    window.history.pushState(null, '', '/latest');
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTrending = () => {
    window.history.pushState(null, '', '/trending');
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateRelated = () => {
    const rawCat = current?.categorySlug || current?.category || current?.categoryName || current?.categoryLabel;
    if (rawCat) {
      const slugCat = String(rawCat).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      handleCategoryClick(slugCat);
    } else {
      handleNavigateLatest();
    }
  };

  const handleArticleClick = (item) => {
    if (onSelectStory) {
      onSelectStory(item);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading State
  if (loading && !current) {
    return (
      <div className="modern-article-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <RefreshCw size={36} color="var(--brand-primary, #dc2626)" style={{ animation: 'spin 1.2s linear infinite', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Loading Article...</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>Retrieving live coverage from GoReadPost</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !current) {
    return (
      <div className="modern-article-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#dc2626' }}>
            <AlertCircle size={30} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#dc2626', textTransform: 'uppercase' }}>
            404 · STORY NOT FOUND
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0.5rem 0 1rem', color: 'var(--text-primary)' }}>
            Article Unavailable
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The requested article could not be located. It may have been unpublished or renamed.
          </p>
          <button 
            type="button" 
            onClick={onBack}
            className="modern-pitch-btn"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem' }}
          >
            <ArrowLeft size={16} /> Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-article-wrapper">
      <div className="modern-article-container">
        
        {/* ── Breadcrumb Navigation ── */}
        <nav className="map-breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="map-breadcrumb-link" onClick={onBack}>
            Home
          </button>
          <span className="map-breadcrumb-sep">&gt;</span>
          <button 
            type="button" 
            className="map-breadcrumb-link" 
            onClick={() => handleCategoryClick(current.categorySlug)}
          >
            {current.categoryName}
          </button>
          <span className="map-breadcrumb-sep">&gt;</span>
          <span className="map-breadcrumb-current" title={current.title}>
            {current.title}
          </span>
        </nav>

        {/* ── Main Two-Column Layout ── */}
        <div className="modern-article-grid">
          
          {/* ════════════════════════════════════════════════
              LEFT COLUMN: MAIN ARTICLE EDITORIAL CONTENT
             ════════════════════════════════════════════════ */}
          <main className="modern-article-main">
            
            {/* Featured Image (Only rendered if not already in content blocks) */}
            {current.image && !isCoverRenderedInBody ? (
              <div className="map-hero-wrapper">
                <img 
                  src={current.image} 
                  alt={current.title} 
                  className="map-hero-img"
                  loading="eager"
                />
              </div>
            ) : null}

            {/* Article Headline with Show Full Text Button */}
            <div className="map-title-row">
              <h1 
                className={`map-title ${isTitleExpanded ? 'expanded' : ''}`} 
                title={current.title}
                onClick={() => setIsTitleExpanded(prev => !prev)}
              >
                {current.title}
              </h1>
              
              <button 
                type="button" 
                className="map-title-toggle-btn"
                onClick={() => setIsTitleExpanded(prev => !prev)}
                aria-expanded={isTitleExpanded}
                title={isTitleExpanded ? "Collapse title" : "Show full text"}
              >
                <span>{isTitleExpanded ? 'Show less' : 'Show full text'}</span>
                {isTitleExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Author Byline & Social Sharing Row (Positioned below image) */}
            <div className="map-meta-row">
              <div className="map-author-cluster">
                <img 
                  src={current.authorAvatar} 
                  alt={current.authorName} 
                  className="map-author-avatar"
                />
                <div className="map-author-info">
                  <div className="map-author-name-row">
                    <span>By {current.authorName}</span>
                    <span className="map-verified-badge" title="Verified Author">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#0284c7">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </span>
                  </div>
                  <div className="map-date-read-row">
                    Updated on {current.publishedDate} • {current.readDuration}
                  </div>
                </div>
              </div>

              {/* Social Share Icons Cluster */}
              <div className="map-social-share-row">
                <button 
                  type="button" 
                  className="map-share-btn fb" 
                  onClick={handleShareFacebook}
                  title="Share on Facebook"
                  aria-label="Facebook"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button 
                  type="button" 
                  className="map-share-btn tw" 
                  onClick={handleShareTwitter}
                  title="Share on X (Twitter)"
                  aria-label="X"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button 
                  type="button" 
                  className="map-share-btn li" 
                  onClick={handleShareLinkedIn}
                  title="Share on LinkedIn"
                  aria-label="LinkedIn"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </button>
                <button 
                  type="button" 
                  className="map-share-btn wa" 
                  onClick={handleShareWhatsApp}
                  title="Share on WhatsApp"
                  aria-label="WhatsApp"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                  </svg>
                </button>
                <button 
                  type="button" 
                  className="map-share-btn" 
                  onClick={handleCopyLink}
                  title="Copy Story Link"
                  aria-label="Copy Link"
                >
                  <Link2 size={14} />
                </button>
                <button 
                  type="button" 
                  className={`map-share-btn bookmark-btn ${isSaved && isSaved(current.id) ? 'active' : ''}`} 
                  onClick={() => onToggleSave && onToggleSave(current)}
                  title={isSaved && isSaved(current.id) ? "Remove from reading list" : "Save to read later"}
                  aria-label="Save story"
                >
                  <Bookmark size={14} fill={isSaved && isSaved(current.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* ── Article Body Content ── */}
            <article className="map-body-content">
              {Array.isArray(current.contentBlocks) && current.contentBlocks.length > 0 ? (
                // 1. Structured Dynamic Content Blocks (Headings, Multiple Images, Testimonials, Galleries, Takeaways)
                current.contentBlocks.map((block, idx) => {
                  if (!block) return null;
                  const key = block.id || idx;

                  // Combined Section (Heading + Image(s) + Multiple Paragraphs)
                  if (block.type === 'section') {
                    const hasHtml = /<[a-z][\s\S]*>/i.test(block.content || '');
                    const paragraphs = !hasHtml ? (block.content || '').split('\n').filter(p => p.trim()) : [];
                    const secImages = Array.isArray(block.images) && block.images.length > 0
                      ? block.images
                      : (block.image?.url ? [block.image] : (typeof block.image === 'string' && block.image ? [{ url: block.image }] : []));

                    const renderSecImages = () => secImages.map((img, sIdx) => (
                      <figure key={sIdx} className="map-inline-figure standard" style={{ margin: '1.25rem 0' }}>
                        <img src={img.url || img} alt={img.caption || img.alt || 'Section illustration'} className="map-inline-img" />
                        {(img.caption || img.credit) && (
                          <figcaption className="map-inline-caption">
                            {img.caption} {img.credit ? `(Photo: ${img.credit})` : ''}
                          </figcaption>
                        )}
                      </figure>
                    ));

                    return (
                      <div key={key} className="map-section-group" style={{ margin: '1.75rem 0' }}>
                        {block.heading && (
                          <h2 className="map-body-heading">
                            {block.heading}
                          </h2>
                        )}
                        {block.imagePosition !== 'bottom' && renderSecImages()}
                        {hasHtml ? (
                          <div className="map-body-rich-content" dangerouslySetInnerHTML={{ __html: block.content }} />
                        ) : paragraphs.length > 0 ? (
                          paragraphs.map((p, pIdx) => (
                            <p key={pIdx} dangerouslySetInnerHTML={{ __html: p }} />
                          ))
                        ) : (
                          block.text && <p dangerouslySetInnerHTML={{ __html: block.text }} />
                        )}
                        {block.imagePosition === 'bottom' && renderSecImages()}
                      </div>
                    );
                  }

                  // Heading Block
                  if (block.type === 'heading') {
                    if (block.level === 3) {
                      return (
                        <h3 key={key} className="map-body-subheading" style={{ fontSize: '1.4rem', fontWeight: 750, margin: '2.2rem 0 0.85rem 0', color: 'var(--text-primary)' }}>
                          {block.text}
                        </h3>
                      );
                    }
                    return (
                      <h2 key={key} className="map-body-heading">
                        {block.text}
                      </h2>
                    );
                  }

                  // Paragraph / Rich Text Block
                  if (block.type === 'paragraph' || block.type === 'text') {
                    return (
                      <p 
                        key={key} 
                        dangerouslySetInnerHTML={{ __html: block.html || block.text || '' }} 
                      />
                    );
                  }

                  // Multiple Blog Images (Inline Figure with Caption, Credits & Alt)
                  if (block.type === 'image') {
                    if (!block.url) return null;
                    return (
                      <figure key={key} className={`map-inline-figure ${block.layout || 'standard'}`}>
                        <img 
                          src={block.url} 
                          alt={block.alt || block.caption || current.title || 'Blog photo'} 
                          className="map-inline-img" 
                          loading="lazy"
                        />
                        {(block.caption || block.credit) && (
                          <figcaption className="map-inline-caption">
                            {block.caption}
                            {block.credit && (
                              <span className="map-photo-credit"> (Photo: {block.credit})</span>
                            )}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }

                  // Multiple Images Gallery Grid
                  if (block.type === 'gallery') {
                    const galleryImgs = Array.isArray(block.images) ? block.images : [];
                    if (galleryImgs.length === 0) return null;
                    return (
                      <div key={key} className={`map-gallery-grid cols-${galleryImgs.length > 2 ? 3 : 2}`}>
                        {galleryImgs.map((img, i) => (
                          <figure key={i} className="map-gallery-item">
                            <img src={img.url || img} alt={img.caption || 'Article photo'} loading="lazy" />
                            {img.caption && <figcaption className="map-gallery-caption">{img.caption}</figcaption>}
                          </figure>
                        ))}
                      </div>
                    );
                  }

                  // Testimonial / Founder Pullquote Block
                  if (block.type === 'testimonial' || block.type === 'quote') {
                    return (
                      <div key={key} className="map-quote-card map-testimonial-card">
                        <div className="map-quote-icon-wrap">
                          <Quote size={20} />
                        </div>
                        <blockquote className="map-quote-text">
                          “{block.quote || block.text}”
                        </blockquote>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '1.15rem' }}>
                          {block.avatar && (
                            <img 
                              src={block.avatar} 
                              alt={block.author || 'Speaker'} 
                              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(2, 132, 199, 0.3)' }} 
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="map-quote-author" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                              {block.author || 'Industry Leader'}
                            </div>
                            {(block.designation || block.company) && (
                              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
                                {block.designation}{block.designation && block.company ? ' · ' : ''}{block.company}
                              </div>
                            )}
                          </div>
                          {block.rating && (
                            <div style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '2px', display: 'flex' }}>
                              {'★'.repeat(Math.min(5, Math.max(1, Number(block.rating) || 5)))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Key Highlights / Takeaways Card
                  if (block.type === 'takeaways' || block.type === 'highlights') {
                    const items = Array.isArray(block.items) 
                      ? block.items 
                      : (typeof block.items === 'string' ? block.items.split('\n').filter(Boolean) : []);
                    return (
                      <div key={key} className="map-takeaways-card" style={{ background: 'var(--bg-tertiary, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '14px', padding: '1.75rem', margin: '2.25rem 0' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary, #dc2626)' }}>
                          <Sparkles size={18} /> {block.title || 'Key Highlights & Takeaways'}
                        </h4>
                        <ul className="map-checklist">
                          {items.map((it, i) => (
                            <li key={i} className="map-checklist-item">
                              <span className="map-check-badge"><Check size={13} strokeWidth={3} /></span>
                              <div>{it}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  // Raw HTML block
                  if (block.type === 'html') {
                    return <div key={key} dangerouslySetInnerHTML={{ __html: block.html || '' }} />;
                  }

                  return null;
                })
              ) : current.content && typeof current.content === 'string' && current.content.trim().length > 0 ? (
                // 2. Rendered HTML content from Rich Text editor
                <div 
                  className="map-rendered-html-body" 
                  dangerouslySetInnerHTML={{ __html: current.content }} 
                />
              ) : (
                // 3. Editorial Fallback Content (if empty)
                <>
                  <h2 className="map-body-heading">Introduction</h2>
                  <p>
                    Artificial Intelligence (AI) is no longer just a buzzword — it’s becoming a core part of how Indian startups operate, innovate and grow. From automating everyday tasks to creating new products, AI is helping founders solve complex problems and reach more customers than ever before. This article explores how AI is impacting the Indian startup ecosystem, key opportunities it brings, the challenges founders face, and what the future holds.
                  </p>

                  <h2 className="map-body-heading">1. The Rise of AI in Indian Startups</h2>
                  <p>
                    In the last few years, Indian startups have started integrating AI into their products and services at a rapid pace. Sectors like healthcare, fintech, edtech, agritech and e-commerce are seeing significant innovation. According to a recent report, over 60% of Indian startups are either using AI or planning to adopt it in the next 12 months.
                  </p>

                  <div className="map-quote-card">
                    <blockquote className="map-quote-text">
                      “AI is not just a technology, it’s a multiplier for human potential. Indian startups are using it to solve real problems at scale.”
                    </blockquote>
                    <div className="map-quote-author">
                      — Ankur Warikoo, <span style={{ fontWeight: 500, color: '#64748b' }}>Founder, Investor &amp; Author</span>
                    </div>
                  </div>

                  <h2 className="map-body-heading">2. Key Opportunities</h2>
                  <ul className="map-checklist">
                    <li className="map-checklist-item">
                      <span className="map-check-badge"><Check size={13} strokeWidth={3} /></span>
                      <div><strong>Automation &amp; Efficiency</strong> – Reduces manual work and saves time.</div>
                    </li>
                    <li className="map-checklist-item">
                      <span className="map-check-badge"><Check size={13} strokeWidth={3} /></span>
                      <div><strong>Better Customer Experience</strong> – Enables personalized and faster services.</div>
                    </li>
                    <li className="map-checklist-item">
                      <span className="map-check-badge"><Check size={13} strokeWidth={3} /></span>
                      <div><strong>Data-Driven Decisions</strong> – Helps in making smarter business decisions.</div>
                    </li>
                    <li className="map-checklist-item">
                      <span className="map-check-badge"><Check size={13} strokeWidth={3} /></span>
                      <div><strong>New Business Models</strong> – Creates opportunities in new and emerging markets.</div>
                    </li>
                  </ul>

                  <h2 className="map-body-heading">3. Challenges for Founders</h2>
                  <ul className="map-warning-list">
                    <li className="map-warning-item">
                      <div><strong>High Implementation Costs</strong> – AI tools and talent can be expensive.</div>
                    </li>
                    <li className="map-warning-item">
                      <div><strong>Lack of Skilled Workforce</strong> – Finding the right AI talent is still a challenge.</div>
                    </li>
                    <li className="map-warning-item">
                      <div><strong>Data Privacy &amp; Security</strong> – Ensuring data safety is critical.</div>
                    </li>
                    <li className="map-warning-item">
                      <div><strong>Regulatory Uncertainty</strong> – Policies and compliance are evolving.</div>
                    </li>
                  </ul>

                  <h2 className="map-body-heading">4. What's Next?</h2>
                  <p>
                    The next phase will see more startups building AI-native products, using generative AI, and exploring advanced technologies like machine learning, computer vision and natural language processing. With the right support, India can become a global leader in AI-driven innovation.
                  </p>

                  <h2 className="map-body-heading">Conclusion</h2>
                  <p>
                    AI is creating new possibilities for Indian startups — but it’s not without challenges. The future will depend on how well founders, investors and policymakers work together to build a healthy and sustainable AI ecosystem.
                  </p>

                  <div className="map-sources-card">
                    <div className="map-sources-header">
                      <span>Sources</span>
                    </div>
                    <ul className="map-sources-list">
                      <li><a href="https://nasscom.in" target="_blank" rel="noreferrer">NASSCOM – AI in Indian Startups Report</a></li>
                      <li><a href="https://economictimes.com" target="_blank" rel="noreferrer">Economic Times – AI Adoption in Indian Startups</a></li>
                      <li><a href="https://yourstory.com" target="_blank" rel="noreferrer">YourStory – Indian Startups and AI</a></li>
                    </ul>
                  </div>
                </>
              )}

              {/* Story Hashtag Tags Cluster */}
              {current.tags && current.tags.length > 0 && (
                <div className="map-article-tags-wrap">
                  <span className="map-tags-label">Tags:</span>
                  <div className="map-tags-pills">
                    {current.tags.map((tg, idx) => (
                      <button 
                        key={idx}
                        type="button" 
                        onClick={() => handleTagClick(tg)}
                        className="map-article-tag-pill"
                      >
                        #{tg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </article>

            {/* 5. READER PERSPECTIVES & DISCUSSION */}
            {article?.allowComments !== false && (
              <section className="fs-discussion-section" style={{ width: '100%', marginTop: '2.5rem' }}>
                <div className="fs-discussion-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Reader Discussion ({comments.length})</span>
                  </h3>
                  <span className="fs-rules-tag">Community Moderated</span>
                </div>

                <div className="fs-discussion-split-row">
                  {/* Left Column: Post Perspective Form Card */}
                  {!currentUser ? (
                    <div className="fs-comment-box-form fs-auth-required-box">
                      <div className="fs-auth-prompt-content">
                        <div className="fs-auth-prompt-icon">
                          <Lock size={24} color="#ea580c" />
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenAuthModal ? onOpenAuthModal('login') : null}
                          className="pitch-btn fs-auth-login-btn"
                        >
                          Sign In to Post Perspective
                        </button>
                        <p className="fs-auth-signup-hint">
                          Don’t have an account?{' '}
                          <button
                            type="button"
                            className="fs-auth-inline-link"
                            onClick={() => onOpenAuthModal ? onOpenAuthModal('signup') : null}
                          >
                            Sign up free
                          </button>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePostComment} className="fs-comment-box-form">
                      <div className="fs-form-card-header">
                        <h4 className="fs-form-card-title">Share Your Perspective</h4>
                        <span className="fs-rules-tag">Logged In</span>
                      </div>

                      {/* Logged In User Identity */}
                      <div className="fs-logged-in-user-bar">
                        <div className="fs-bubble-avatar" style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}>
                          {(currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 750, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser.name || currentUser.username}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {currentUser.title || currentUser.designation || (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' ? 'Editorial Team' : 'Community Member')}
                          </div>
                        </div>
                      </div>

                      <div className="fs-form-inputs-group">
                        <textarea 
                          className="fs-comment-textarea"
                          placeholder="Share your perspective, operational counterpoint, or industry insights..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                          required
                        />
                      </div>

                      <div className="fs-comment-form-actions">
                        <span className="fs-hint-text">Markdown supported</span>
                        <button 
                          type="submit" 
                          disabled={isSubmittingComment}
                          className="pitch-btn fs-submit-btn" 
                          style={{ 
                            background: 'var(--brand-primary, #ea580c)', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '6px', 
                            fontWeight: 700, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            cursor: isSubmittingComment ? 'not-allowed' : 'pointer',
                            opacity: isSubmittingComment ? 0.75 : 1
                          }}
                        >
                          <Send size={13} />
                          <span>{isSubmittingComment ? 'Saving...' : 'Post Perspective'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Right Column: Recent Perspectives Feed */}
                  <div className="fs-comments-feed-col">
                    <div className="fs-comments-feed">
                      {loadingComments && comments.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          Loading discussion perspectives...
                        </div>
                      ) : comments.length === 0 ? (
                        <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-light)', color: 'var(--text-muted)' }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.92rem' }}>No perspectives shared yet.</p>
                          <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem' }}>Be the first to share your thoughts and start the conversation!</p>
                        </div>
                      ) : (
                        comments.map((comment) => {
                          const commentKey = comment.id || comment._id;
                          const isOwner = checkIsCommentOwner(comment);
                          const isEditing = editingCommentId === commentKey;
                          const isDeleting = deletingCommentId === commentKey;
                          const userIdentifier = currentUser ? String(currentUser.id || currentUser._id || currentUser.email) : getReaderClientId();
                          const isLiked = Boolean(
                            comment.isLiked || 
                            (Array.isArray(comment.likedBy) && comment.likedBy.includes(userIdentifier))
                          );

                          return (
                            <div key={commentKey} className={`fs-comment-bubble ${isEditing ? 'fs-editing' : ''}`}>
                              <div className="fs-bubble-top">
                                <div className="fs-bubble-user">
                                  <div className="fs-bubble-avatar">
                                    {(comment.author || 'R').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="fs-bubble-name">{comment.author || 'Reader Contributor'}</div>
                                    <div className="fs-bubble-role">
                                      {comment.role || 'Community Member'} • {comment.time || 'Recently'}
                                    </div>
                                  </div>
                                </div>

                                <div className="fs-bubble-actions-cluster">
                                  <button 
                                    type="button" 
                                    className={`fs-bubble-like-btn ${isLiked ? 'active' : ''}`}
                                    onClick={() => handleLikeComment(commentKey)}
                                    title={isLiked ? "Unlike / remove like" : "Applaud perspective (1 like)"}
                                    aria-pressed={isLiked}
                                  >
                                    <ThumbsUp size={12} fill={isLiked ? "currentColor" : "none"} />
                                    <span>{comment.likes || 0}</span>
                                  </button>

                                {isOwner && (
                                  <div className="fs-owner-actions-wrap">
                                    <button
                                      type="button"
                                      className="fs-owner-action-btn edit"
                                      onClick={() => handleStartEdit(comment)}
                                      title="Edit your perspective"
                                      aria-label="Edit perspective"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isDeleting}
                                      className="fs-owner-action-btn delete"
                                      onClick={() => handleDeleteComment(commentKey)}
                                      title="Delete your perspective"
                                      aria-label="Delete perspective"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {isEditing ? (
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleSaveEdit(commentKey);
                                }} 
                                className="fs-bubble-edit-form"
                              >
                                <textarea
                                  className="fs-comment-textarea fs-bubble-edit-textarea"
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  rows={3}
                                  required
                                  autoFocus
                                />
                                <div className="fs-bubble-edit-btns">
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={isUpdatingComment}
                                    className="fs-bubble-edit-cancel"
                                  >
                                    <X size={13} />
                                    <span>Cancel</span>
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={isUpdatingComment || !editCommentText.trim()}
                                    className="pitch-btn fs-bubble-edit-save"
                                  >
                                    <Check size={13} />
                                    <span>{isUpdatingComment ? 'Saving...' : 'Save Changes'}</span>
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <p className="fs-bubble-text">
                                {comment.text}
                                {comment.isEdited && (
                                  <span className="fs-bubble-edited-tag" title="Edited by author"> (edited)</span>
                                )}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  </div>
                </div>
              </section>
            )}

          </main>

          {/* ════════════════════════════════════════════════
              RIGHT COLUMN: EDITORIAL SIDEBAR
             ════════════════════════════════════════════════ */}
          <aside className="modern-article-sidebar">
            
            {/* 1. Latest Articles Widget (Before Trending) */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-header">
                <h3 className="sidebar-widget-title">Latest Articles</h3>
                <button
                  type="button"
                  className="sidebar-widget-view-all"
                  onClick={handleNavigateLatest}
                  title="View all latest articles"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="sidebar-related-list">
                {latestArticles.map((lat) => {
                  const isLatSaved = isSaved ? Boolean(isSaved(lat.id || lat._id || lat.slug)) : false;
                  return (
                    <div 
                      key={lat.id} 
                      className="sidebar-related-item"
                      onClick={() => handleArticleClick(lat)}
                    >
                      <img 
                        src={lat.image} 
                        alt={lat.title} 
                        className="sidebar-related-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="sidebar-related-info">
                        <h4 className="sidebar-related-title">{lat.title}</h4>
                        <div className="sidebar-related-meta">
                          <span className="cat">{lat.category}</span> • {lat.date}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`sidebar-related-save-btn ${isLatSaved ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSave) onToggleSave(lat);
                        }}
                        title={isLatSaved ? 'Remove from reading list' : 'Save to read later'}
                        aria-label="Save story"
                      >
                        <Bookmark size={13} fill={isLatSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Trending Now Widget */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-header">
                <h3 className="sidebar-widget-title">Trending Now</h3>
                <button
                  type="button"
                  className="sidebar-widget-view-all"
                  onClick={handleNavigateTrending}
                  title="View all trending stories"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="sidebar-trending-list">
                {trendingArticles.map((tr, index) => (
                  <div 
                    key={tr.id || index} 
                    className="sidebar-trending-item"
                    onClick={() => handleArticleClick(tr)}
                  >
                    <div className="sidebar-trending-badge">{index + 1}</div>
                    <p className="sidebar-trending-title">{tr.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Related Articles Widget */}
            <div className="sidebar-widget">
              <div className="sidebar-widget-header">
                <h3 className="sidebar-widget-title">Related Articles</h3>
                <button
                  type="button"
                  className="sidebar-widget-view-all"
                  onClick={handleNavigateRelated}
                  title="View all related articles"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>
              <div className="sidebar-related-list">
                {relatedArticles.map((rel) => {
                  const isRelSaved = isSaved ? Boolean(isSaved(rel.id || rel._id || rel.slug)) : false;
                  return (
                    <div 
                      key={rel.id} 
                      className="sidebar-related-item"
                      onClick={() => handleArticleClick(rel)}
                    >
                      <img 
                        src={rel.image} 
                        alt={rel.title} 
                        className="sidebar-related-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="sidebar-related-info">
                        <h4 className="sidebar-related-title">{rel.title}</h4>
                        <div className="sidebar-related-meta">
                          <span className="cat">{rel.category}</span> • {rel.date}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`sidebar-related-save-btn ${isRelSaved ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSave) onToggleSave(rel);
                        }}
                        title={isRelSaved ? 'Remove from reading list' : 'Save to read later'}
                        aria-label="Save story"
                      >
                        <Bookmark size={13} fill={isRelSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>




          </aside>

        </div>

        {/* ── 5. Bottom "More in [Category]" Section ── */}
        {bottomArticles.length > 0 && (
          <section className="map-bottom-section">
            <div className="map-bottom-header-row">
              <h2 className="map-bottom-title">More in {current.categoryName}</h2>
              <button 
                type="button" 
                className="map-bottom-view-all"
                onClick={() => {
                  window.history.pushState(null, '', `/category/${current.categorySlug}`);
                  window.dispatchEvent(new Event('popstate'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                View All
              </button>
            </div>

            <div className="map-bottom-cards-grid">
              {bottomArticles.map((bItem) => {
                const isBottomSaved = isSaved ? Boolean(isSaved(bItem.id || bItem._id || bItem.slug)) : false;
                return (
                  <article 
                    key={bItem.id} 
                    className="map-bottom-card"
                    onClick={() => handleArticleClick(bItem)}
                  >
                    <div className="map-bottom-card-img-wrap">
                      <img 
                        src={bItem.image} 
                        alt={bItem.title} 
                        className="map-bottom-card-img"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className={`map-card-save-btn ${isBottomSaved ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleSave) onToggleSave(bItem);
                        }}
                        title={isBottomSaved ? 'Remove from reading list' : 'Save to read later'}
                        aria-label="Save story"
                      >
                        <Bookmark size={14} fill={isBottomSaved ? '#ffffff' : 'none'} color={isBottomSaved ? '#ffffff' : 'currentColor'} />
                      </button>
                    </div>
                    <h3 className="map-bottom-card-title">{bItem.title}</h3>
                    <div className="map-bottom-card-meta">
                      <span className="cat">{bItem.category}</span> • {bItem.date}
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
