import React from 'react';
import { 
  CheckCircle2, ArrowRight, Zap, Shield, 
  Award, Layers, Globe, Sparkles 
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

export default function DynamicServices({ data = {} }) {
  const title = data.title || data.heading || 'Core Newsroom Desks';
  const subtitle = data.subtitle || data.subheading || '';
  const badge = data.badge || 'OUR BEATS';
  
  const items = (Array.isArray(data.services) && data.services.length > 0)
    ? data.services
    : (Array.isArray(data.items) && data.items.length > 0)
      ? data.items
      : [];

  if (items.length === 0) return null;

  return (
    <section className="dyn-section dyn-services-section">
      <div className="dyn-container">
        <div className="dyn-section-header">
          {badge && <span className="dyn-section-badge">{badge}</span>}
          <h2 className="dyn-section-title">{title}</h2>
          {subtitle && <p className="dyn-section-subtitle">{subtitle}</p>}
        </div>

        <div className="dyn-services-grid">
          {items.map((srv, index) => {
            const IconComponent = (srv.icon && ICON_MAP[srv.icon]) || CheckCircle2;

            return (
              <div key={index} className="dyn-service-card">
                <div className="dyn-service-card-top">
                  <div className="dyn-service-icon">
                    <IconComponent size={22} color="var(--brand-primary, #ea580c)" />
                  </div>
                  {srv.badge && <span className="dyn-service-badge">{srv.badge}</span>}
                </div>
                <h3 className="dyn-service-card-title">{srv.title}</h3>
                <p className="dyn-service-card-desc">{srv.description}</p>
                {srv.link && (
                  <a href={srv.link} className="dyn-service-link">
                    <span>Learn more</span>
                    <ArrowRight size={14} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
