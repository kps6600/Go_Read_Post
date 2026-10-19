import React, { useState, useEffect } from 'react';
import { PageService } from '../services/pageService';
import DynamicHero from './dynamic/DynamicHero';
import DynamicText from './dynamic/DynamicText';
import DynamicServices from './dynamic/DynamicServices';
import DynamicPortfolio from './dynamic/DynamicPortfolio';
import DynamicTestimonials from './dynamic/DynamicTestimonials';
import DynamicCTA from './dynamic/DynamicCTA';
import DynamicFAQ from './dynamic/DynamicFAQ';
import DynamicContact from './dynamic/DynamicContact';
import DynamicImageText from './dynamic/DynamicImageText';
import DynamicFeatures from './dynamic/DynamicFeatures';
import DynamicStats from './dynamic/DynamicStats';
import DynamicBrands from './dynamic/DynamicBrands';
import AboutSection from './AboutSection';
import NotFoundPage from './NotFoundPage';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

export default function DynamicPageRenderer({ 
  slug, 
  onBackToHome, 
  onOpenAdmin,
  onShowToast
}) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(slug !== '404' && slug !== 'not-found');
  const [error, setError] = useState(slug === '404' || slug === 'not-found' ? 'Page not found' : null);

  useEffect(() => {
    if (!slug) return;
    if (slug === '404' || slug === 'not-found') {
      setLoading(false);
      setError('Page not found');
      setPage(null);
      return;
    }
    loadPage(slug);
  }, [slug]);

  const loadPage = async (pageSlug) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PageService.getPageBySlug(pageSlug);
      if (!data) {
        setError('Page not found');
        setPage(null);
      } else {
        setPage(data);
        // Set dynamic document title and meta description
        const pageTitle = data.seo?.title || `${data.title} | GoReadPost`;
        document.title = pageTitle;

        if (data.seo?.description) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', data.seo.description);
        }
      }
    } catch (err) {
      setError(err.message || 'Page not found');
      setPage(null);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section, idx) => {
    if (section.enabled === false) return null;
    const { type, data = {} } = section;

    switch (type) {
      case 'hero':
        return <DynamicHero key={section.id || idx} data={data} />;
      case 'text':
        return <DynamicText key={section.id || idx} data={data} />;
      case 'services':
        return <DynamicServices key={section.id || idx} data={data} />;
      case 'portfolio':
        return <DynamicPortfolio key={section.id || idx} data={data} />;
      case 'testimonials':
        return <DynamicTestimonials key={section.id || idx} data={data} />;
      case 'cta':
        return <DynamicCTA key={section.id || idx} data={data} />;
      case 'faq':
        return <DynamicFAQ key={section.id || idx} data={data} />;
      case 'contact':
        return <DynamicContact key={section.id || idx} data={data} />;
      case 'image_text':
        return <DynamicImageText key={section.id || idx} data={data} />;
      case 'features':
        return <DynamicFeatures key={section.id || idx} data={data} />;
      case 'stats':
        return <DynamicStats key={section.id || idx} data={data} />;
      case 'brands':
        return <DynamicBrands key={section.id || idx} data={data} />;
      default:
        return (
          <div key={section.id || idx} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            [Custom Section: {type}]
          </div>
        );
    }
  };

  // Sort sections by order
  const activeSections = (page?.sections || [])
    .filter(s => s.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="dynamic-page-root" style={{ width: '100%', maxWidth: '100%', minHeight: '60vh', margin: 0, padding: 0 }}>
      <main className="dynamic-page-main" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
        {loading ? (
          <div className="dynamic-page-loader" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
            <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: 'var(--brand-primary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading content...</p>
          </div>
        ) : error || !page ? (
          <NotFoundPage 
            path={`/${slug}`} 
            onBackToHome={onBackToHome}
            onOpenAdmin={onOpenAdmin}
          />
        ) : (slug === 'about' || page?.slug === 'about' || slug === '/about' || slug === 'about-us' || page?.slug === 'about-us' || slug === '/about-us') ? (
          <AboutSection page={page} />
        ) : (
          <div className="dynamic-page-sections" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
            {activeSections.length > 0 ? (
              activeSections.map((sec, idx) => renderSection(sec, idx))
            ) : (
              <div className="dynamic-page-empty">
                <div className="dyn-container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
                  <Sparkles size={40} style={{ color: 'var(--accent-indigo)', marginBottom: '1rem' }} />
                  <h2>{page.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto' }}>
                    {page.description || 'This page has been created and published, but no sections have been configured yet.'}
                  </p>
                  {onOpenAdmin && (
                    <button className="btn-primary" onClick={onOpenAdmin}>
                      Add Sections in Admin CMS
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
