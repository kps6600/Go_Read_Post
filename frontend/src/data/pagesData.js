// Default and Fallback Content for Company & Legal Pages
// (About Us, Editorial Team, Careers, Pitch Story, Privacy Policy, Terms of Service, Disclaimer)

export const COMPANY_AND_LEGAL_PAGES = [
  // 1. ABOUT US
  {
    id: "about",
    title: "About Us",
    slug: "about",
    brand: "GoReadPost",
    description: "Welcome to Our Blog — Ideas, Stories & Inspiration. We believe every great idea deserves to be shared.",
    heroHeadline: "Welcome to Our Blog — Ideas, Stories & Inspiration",
    heroSubhead: "We believe every great idea deserves to be shared. Our blog is a platform for discovering fresh perspectives, learning something new, and staying updated with the topics that matter to you.",
    heroBanner: "",
    status: "published",
    showInNav: false,
    order: 10,
    seo: {
      title: "About Us | GoReadPost",
      description: "Welcome to Our Blog — Ideas, Stories & Inspiration. We believe every great idea deserves to be shared. Explore informative articles, practical tips, and inspiring stories.",
      keywords: ["about us", "GoReadPost", "ideas stories inspiration", "informative articles", "tips and guides"]
    },
    sections: [
      {
        id: "about_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          badge: "ABOUT GOREADPOST",
          headline: "The Definitive Journal of Innovation, Capital & Builders",
          subheadline: "GoReadPost chronicles breakthrough founders, deep technology, AI revolutions, venture capital, and economic innovation across India and the global ecosystem.",
          primaryBtnText: "Explore Editorial Desks",
          primaryBtnUrl: "#services",
          secondaryBtnText: "Meet Our Bureau",
          secondaryBtnUrl: "/editorial-team",
          bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80"
        }
      },
      {
        id: "about_mission",
        type: "text",
        order: 2,
        enabled: true,
        data: {
          title: "Our Mission & Journalistic Manifesto",
          alignment: "left",
          maxWidth: "860px",
          content: `
            <p class="lead-para" style="font-size: 1.15rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 1.25rem;">
              We believe that entrepreneurs, engineers, and risk-takers are the foundational architects of the future. Our newsroom exists to report their triumphs, audits, pivots, and operational breakthroughs with uncompromising independence and technical rigor.
            </p>
            <h3 style="font-size: 1.25rem; font-weight: 750; margin: 1.75rem 0 0.75rem; color: var(--text-primary);">The Pillars of GoReadPost Reporting</h3>
            <ul style="padding-left: 1.25rem; line-height: 1.8; margin-bottom: 1.5rem; color: var(--text-secondary);">
              <li><strong>Zero Pay-to-Play Coverage:</strong> Editorial coverage is 100% earned. Our newsroom maintains an impenetrable wall between editorial judgment and commercial partnerships.</li>
              <li><strong>First-Principles Technical Depth:</strong> We go beyond surface press releases to inspect unit economics, infrastructure architecture, and compute bottlenecks.</li>
              <li><strong>Radical Transparency & Empathy:</strong> We document the brutal realities of venture capital, down-rounds, and turnaround journeys alongside hypergrowth triumphs.</li>
            </ul>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 2rem 0; padding: 1.5rem; background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-light);">
              <div><strong style="display: block; font-size: 1.75rem; color: var(--brand-primary); font-weight: 850;">15M+</strong><span style="font-size: 0.85rem; color: var(--text-muted);">Monthly Active Readers</span></div>
              <div><strong style="display: block; font-size: 1.75rem; color: var(--brand-primary); font-weight: 850;">4,800+</strong><span style="font-size: 0.85rem; color: var(--text-muted);">Unfiltered Founder Playbooks</span></div>
              <div><strong style="display: block; font-size: 1.75rem; color: var(--brand-primary); font-weight: 850;">40+</strong><span style="font-size: 0.85rem; color: var(--text-muted);">Bureau Journalists</span></div>
              <div><strong style="display: block; font-size: 1.75rem; color: var(--brand-primary); font-weight: 850;">6</strong><span style="font-size: 0.85rem; color: var(--text-muted);">Global Newsroom Hubs</span></div>
            </div>
          `
        }
      },
      {
        id: "about_beats",
        type: "services",
        order: 3,
        enabled: true,
        data: {
          badge: "OUR BEATS",
          heading: "Core Newsroom Desks",
          subheading: "Dedicated bureaus delivering daily investigations, market analyses, and founder access.",
          items: [
            {
              icon: "Zap",
              title: "AI & Sovereign DeepTech",
              description: "Tracking frontier foundation models, GPU compute sovereignty, robotics, and semiconductor supply chains."
            },
            {
              icon: "Shield",
              title: "The CapTable & Venture Capital",
              description: "Seed-to-IPO cap table movements, term sheet diligence, LP-GP dynamics, and private market audits."
            },
            {
              icon: "Award",
              title: "Founders Unfiltered",
              description: "Behind-the-scenes long-form journalism chronicling the operational pivots, failures, and triumphs of company builders."
            },
            {
              icon: "Layers",
              title: "Enterprise & Cloud Resilience",
              description: "Enterprise software, cybersecurity, GCCs, and high-stakes digital transformations shaping global corporate stacks."
            },
            {
              icon: "Globe",
              title: "HerStory & Inclusivity",
              description: "Amplifying trailblazing women founders, corporate innovators, and researchers breaking industry barriers."
            },
            {
              icon: "Sparkles",
              title: "SMBStory & Manufacturing",
              description: "The heartbeat of Indian manufacturing hubs, direct-to-consumer (D2C) brands, and scaling MSME powerhouses."
            }
          ]
        }
      },
      {
        id: "about_cta",
        type: "cta",
        order: 4,
        enabled: true,
        data: {
          badge: "GET IN TOUCH",
          heading: "Have a Breaking Story or Whistleblower Tip?",
          description: "Our investigative desk reviews tips, funding announcements, and exclusive data on a continuous basis.",
          primaryBtnText: "Pitch Your Story to the Bureau",
          primaryBtnUrl: "/pitch",
          secondaryBtnText: "Meet the Editorial Team",
          secondaryBtnUrl: "/editorial-team"
        }
      }
    ]
  },

  // 4. PITCH STORY
  {
    id: "pitch",
    title: "Pitch Story",
    slug: "pitch",
    brand: "GoReadPost",
    description: "Submit your startup story, funding announcement, or investigative tip to the GoReadPost editorial bureau.",
    heroHeadline: "Pitch Your Story to the GoReadPost Bureau",
    heroSubhead: "We uncover the human grit, engineering genius, and venture capital powering startups from pre-seed to market leadership.",
    heroBanner: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: false,
    order: 13,
    seo: {
      title: "Pitch Your Story | GoReadPost Editorial Desk",
      description: "Pitch your startup story, seed round, technical innovation, or exclusive scoop directly to GoReadPost reporters.",
      keywords: ["pitch story", "startup pitch", "PR pitch", "press release", "GoReadPost editorial"]
    },
    sections: [
      {
        id: "pitch_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          badge: "FOUNDER & PR DESK",
          headline: "Pitch Your Story to the GoReadPost Bureau",
          subheadline: "We uncover the human grit, engineering genius, and venture capital powering startups from pre-seed to market leadership.",
          primaryBtnText: "Review Pitching Guidelines",
          primaryBtnUrl: "#guidelines",
          secondaryBtnText: "Submit Pitch Form",
          secondaryBtnUrl: "#contact",
          bgImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80"
        }
      },
      {
        id: "pitch_guidelines",
        type: "text",
        order: 2,
        enabled: true,
        data: {
          title: "Editorial Pitch Guidelines — What Gets Covered",
          alignment: "left",
          maxWidth: "860px",
          content: `
            <div id="guidelines" style="line-height: 1.8; color: var(--text-secondary);">
              <p class="lead-para" style="font-size: 1.15rem; color: var(--text-primary); margin-bottom: 1.25rem;">
                Our desk evaluates hundreds of pitches weekly. To maximize your chances of getting reviewed and assigned to a beat reporter, please adhere to these standards:
              </p>
              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">1. Verified Funding Announcements</h3>
              <p>Include check size, lead institutional investors, participating angels, valuation context (if disclosed), and specific product/infrastructure allocation plans.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">2. Technical & Product Breakthroughs</h3>
              <p>Highlight proprietary benchmarks, patent milestones, architecture diagrams, and demonstrable customer traction rather than buzzword marketing.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">3. Embargoes & Exclusives</h3>
              <p>We respect strict embargoes. Please provide at least <strong>48 to 72 hours advance notice</strong> before public release to allow our correspondents time for deep interviews and fact-checking.</p>
              <div style="margin: 1.5rem 0; padding: 1rem 1.25rem; background: rgba(225,29,72,0.08); border-left: 4px solid var(--brand-primary); border-radius: 6px; color: var(--text-primary);">
                <strong>Important:</strong> GoReadPost editorial coverage is <strong>100% free and earned</strong>. Anyone claiming to charge money for an editorial story on GoReadPost does not represent our newsroom.
              </div>
            </div>
          `
        }
      },
      {
        id: "pitch_contact",
        type: "contact",
        order: 3,
        enabled: true,
        data: {
          badge: "SUBMISSION DESK",
          heading: "Submit Your Pitch Online",
          subheading: "Our bureau editors review submissions every morning at 09:00 IST.",
          email: "editorial@goreadpost.com",
          phone: "+91 (80) 4567-8900",
          address: "GoReadPost Media Bureau, Indiranagar, Bengaluru, KA 560038"
        }
      }
    ]
  },

  // 8. CATEGORIES & DESKS
  {
    id: "category",
    title: "Category Content & Desks",
    slug: "categories",
    brand: "GoReadPost",
    description: "Comprehensive reporting, strategic perspectives, and startup breakdowns across all editorial categories and desks.",
    heroHeadline: "Curated Reporting Across All Editorial Verticals",
    heroSubhead: "Explore deep insights, operational lessons, and strategic perspectives from Indian founders and industry pioneers.",
    heroBanner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 5,
    seo: {
      title: "Editorial Categories & Desks | GoReadPost Intelligence",
      description: "Curated reporting, deep analysis, and breaking investigative coverage from the editorial desks at GoReadPost.",
      keywords: ["categories", "startups", "technology", "ai", "enterprise", "fintech"]
    },
    sections: [
      {
        id: "category_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          title: "Category Featured Spotlight",
          heading: "Curated Reporting Across All Editorial Verticals",
          headline: "Curated Reporting Across All Editorial Verticals",
          subheadline: "Explore deep insights, operational lessons, and strategic perspectives from Indian founders and industry pioneers.",
          badge: "EDITORIAL DESKS",
          buttonText: "Read Story",
          buttonUrl: "#feed",
          image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80",
          heroSource: "auto"
        }
      },
      {
        id: "category_feed",
        type: "stories_feed",
        order: 2,
        enabled: true,
        data: {
          title: "Category Editorial Feed",
          heading: "All Editorial Desks",
          subtitle: "Discover high-impact stories, breaking scoops, and founder journeys across curated verticals",
          layoutMode: "grid",
          cardsPerPage: 12,
          defaultSort: "latest",
          showPills: true,
          showHero: true,
          curation: {}
        }
      }
    ]
  },
  ];

// Helper to find a fallback page by slug or id
export function getFallbackPageBySlug(slug) {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim().replace(/^\/+/, '');
  return COMPANY_AND_LEGAL_PAGES.find(p => {
    const pSlug = (p.slug || '').toLowerCase().replace(/^\/+/, '');
    if (pSlug === clean || p.id === clean) return true;
    if ((clean === 'categories' || clean === 'category' || clean === 'content') && (pSlug === 'categories' || p.id === 'category')) return true;
    if (clean === 'about-us' && pSlug === 'about') return true;
    if ((clean === 'pitch' || clean === 'pitch-story') && (pSlug === 'pitch' || p.id === 'pitch')) return true;
    return false;
  }) || null;
}
