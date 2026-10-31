const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'admin', 'LiveSectionEditor.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add handleInlineArticleUpdate if not present
if (!content.includes('const handleInlineArticleUpdate =')) {
  const inlineFn = `
  const handleInlineArticleUpdate = async (story, updates) => {
    if (!story) return;
    const artId = story._id || story.id || story.slug;
    
    // Update activeArticles in state immediately
    const updatedActive = activeArticles.map(a => {
      const aId = a._id || a.id || a.slug;
      if (String(aId) === String(artId)) {
        return { ...a, ...updates };
      }
      return a;
    });
    setActiveArticles(updatedActive);

    // If section has custom articles stored in data, update data.articles
    if (Array.isArray(data.articles) && data.articles.length > 0) {
      const nextCustom = data.articles.map(a => {
        const aId = a._id || a.id || a.slug;
        if (String(aId) === String(artId)) {
          return { ...a, ...updates };
        }
        return a;
      });
      persistToDatabase({ ...data, articles: nextCustom });
    } else {
      persistToDatabase({ ...data, articles: updatedActive });
    }

    // Also persist to backend Article/Story API in background
    try {
      const payload = { ...updates };
      if (updates.authorName) {
        payload.authorName = updates.authorName;
        payload.author = { name: updates.authorName };
      }
      if (updates.category) {
        payload.categoryName = updates.category;
        payload.categoryLabel = updates.category;
      }
      try {
        await ArticleService.updateArticle(artId, payload);
      } catch (e1) {
        try {
          await StoryService.updateStory(artId, payload);
        } catch (e2) {}
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('article:change'));
        window.dispatchEvent(new CustomEvent('story:change'));
      }
    } catch (err) {
      console.warn('Background article update note:', err);
    }
  };
`;
  content = content.replace('const handleOpenArticleEditor = (article) => {', inlineFn + '\n  const handleOpenArticleEditor = (article) => {');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Added handleInlineArticleUpdate to LiveSectionEditor.jsx');

