import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function DynamicImageText({ data = {} }) {
  const {
    heading = '',
    description = '',
    image = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80',
    imagePosition = 'left',
    buttonText = '',
    buttonUrl = '',
    badge = ''
  } = data;

  if (!heading && !description && !image) return null;

  const isImgRight = imagePosition === 'right';

  return (
    <section className="dyn-section" style={{ padding: '3.5rem 0', width: '100%' }}>
      <div 
        className="dyn-container" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '3rem', 
          alignItems: 'center' 
        }}
      >
        <div style={{ order: isImgRight ? 2 : 1 }}>
          <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}>
            <img 
              src={image} 
              alt={heading || 'Visual spotlight'} 
              style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        </div>

        <div style={{ order: isImgRight ? 1 : 2 }}>
          {badge && (
            <span 
              style={{ 
                display: 'inline-block',
                fontSize: '0.75rem', 
                fontWeight: 800, 
                color: 'var(--brand-primary, #ea580c)', 
                background: 'rgba(234, 88, 12, 0.1)', 
                padding: '0.3rem 0.75rem', 
                borderRadius: '9999px',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {badge}
            </span>
          )}
          {heading && (
            <h2 style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.25, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
              {heading}
            </h2>
          )}
          {description && (
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 0 1.75rem' }}>
              {description}
            </p>
          )}
          {buttonText && (
            <a 
              href={buttonUrl || '#'} 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.75rem 1.5rem', 
                background: 'var(--brand-primary, #ea580c)', 
                color: '#ffffff', 
                borderRadius: '8px', 
                fontWeight: 700, 
                textDecoration: 'none',
                transition: 'transform 0.15s ease'
              }}
            >
              <span>{buttonText}</span>
              <ArrowRight size={16} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
