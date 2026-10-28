import React, { useState } from 'react';
import { Home, ArrowLeft, Search, TrendingUp, Sparkles, Compass, ShieldAlert, BookOpen, Mail } from 'lucide-react';

export default function NotFoundPage({ 
  path = '', 
  onBackToHome, 
  onSearch, 
  onOpenAdmin 
}) {
  const [query, setQuery] = useState('');

  const displayPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query.trim());
    } else {
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(query.trim())}`);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const navigateTo = (url) => {
    window.history.pushState(null, '', url);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="not-found-page-wrapper" style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      background: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        textAlign: 'center',
        background: 'var(--bg-secondary, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '24px',
        padding: '3.5rem 2.5rem',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          fontWeight: 700,
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem'
        }}>
          <ShieldAlert size={16} /> 404 Error • Page Not Found
        </div>

        {/* 404 Giant Number with Gradient */}
        <div style={{
          fontSize: 'clamp(5rem, 14vw, 8rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #ef4444 0%, #8b5cf6 50%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          userSelect: 'none'
        }}>
          404
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
          fontWeight: 800,
          color: 'var(--text-primary, #0f172a)',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em'
        }}>
          Lost in Cyberspace?
        </h1>

        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary, #64748b)',
          lineHeight: 1.6,
          maxWidth: '520px',
          margin: '0 auto 2rem'
        }}>
          The page <code style={{
            background: 'var(--bg-tertiary, #f1f5f9)',
            color: 'var(--brand-primary, #4f46e5)',
            padding: '0.15rem 0.5rem',
            borderRadius: '6px',
            fontSize: '0.9em',
            fontWeight: 600
          }}>{displayPath}</code> could not be found. It may have been moved, renamed, or is temporarily unavailable.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{
          maxWidth: '460px',
          margin: '0 auto 2.5rem',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '1rem',
            color: 'var(--text-tertiary, #94a3b8)',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, or authors..."
            style={{
              width: '100%',
              padding: '0.85rem 6.5rem 0.85rem 2.85rem',
              borderRadius: '14px',
              border: '1.5px solid var(--border-color, #cbd5e1)',
              background: 'var(--bg-primary, #f8fafc)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.95rem',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '6px',
              background: 'var(--brand-primary, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Search
          </button>
        </form>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2.5rem'
        }}>
          <button
            onClick={() => {
              if (onBackToHome) onBackToHome();
              else navigateTo('/');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--brand-primary, #4f46e5)',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Home size={18} /> Return to Homepage
          </button>

          <button
            onClick={() => navigateTo('/trending')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-primary, #f8fafc)',
              color: 'var(--text-primary, #0f172a)',
              border: '1px solid var(--border-color, #cbd5e1)',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            <TrendingUp size={18} /> Browse Trending
          </button>

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                color: 'var(--text-secondary, #64748b)',
                border: '1px dashed var(--border-color, #cbd5e1)',
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={16} /> Open CMS Studio
            </button>
          )}
        </div>

        {/* Quick Links Section */}
        <div style={{
          borderTop: '1px solid var(--border-color, #e2e8f0)',
          paddingTop: '2rem',
          textAlign: 'left'
        }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-tertiary, #94a3b8)',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Popular Destinations
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
            justifyContent: 'center'
          }}>
            {[
              { label: '🔥 Trending', url: '/trending' },
              { label: '⚡ Latest Stories', url: '/latest' },
              { label: '🤖 Artificial Intelligence', url: '/topic/artificial-intelligence' },
              { label: '🏷️ #ChatGPT', url: '/tag/chatgpt' },
              { label: '📬 Newsletter', url: '/newsletter' },
              { label: '🏢 About Us', url: '/about' },
              { label: '✉️ Contact Us', url: '/contact' },
              { label: '📢 Advertise', url: '/advertise' },
              { label: '⚖️ Editorial Policy', url: '/editorial-policy' }
            ].map((link, idx) => (
              <button
                key={idx}
                onClick={() => navigateTo(link.url)}
                style={{
                  background: 'var(--bg-tertiary, #f1f5f9)',
                  border: '1px solid transparent',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary, #475569)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary, #4f46e5)';
                  e.currentTarget.style.color = 'var(--brand-primary, #4f46e5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary, #475569)';
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
