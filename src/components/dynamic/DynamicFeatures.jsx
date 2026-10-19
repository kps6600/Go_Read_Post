import React from 'react';
import { 
  Zap, Shield, Award, Layers, Globe, Sparkles, CheckCircle2 
} from 'lucide-react';

const ICON_MAP = {
  Zap,
  Shield,
  Award,
  Layers,
  Globe,
  Sparkles,
  CheckCircle2
};

export default function DynamicFeatures({ data = {} }) {
  const title = data.title || data.heading || 'Key Platform Features';
  const subtitle = data.subtitle || data.subheading || '';
  const badge = data.badge || '';
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length === 0 && !title) return null;

  return (
    <section className="dyn-section" style={{ padding: '3.5rem 0', width: '100%' }}>
      <div className="dyn-container">
        {(title || subtitle || badge) && (
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {badge}
              </span>
            )}
            {title && (
              <h2 style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.75rem' 
          }}
        >
          {items.map((feat, index) => {
            const IconComponent = (feat.icon && ICON_MAP[feat.icon]) || Zap;

            return (
              <div 
                key={index} 
                style={{ 
                  background: 'var(--bg-surface, #ffffff)', 
                  border: '1px solid var(--border-color, #e2e8f0)', 
                  borderRadius: '14px', 
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div 
                  style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '10px', 
                    background: 'rgba(234, 88, 12, 0.1)', 
                    color: 'var(--brand-primary, #ea580c)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <IconComponent size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {feat.title || feat.heading}
                </h3>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {feat.description || feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
