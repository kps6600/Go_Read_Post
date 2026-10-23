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

  // 2. EDITORIAL TEAM
  {
    id: "editorial-team",
    title: "Editorial Team",
    slug: "editorial-team",
    brand: "GoReadPost",
    description: "Meet the investigative reporters, editors, analysts, and newsroom leaders at GoReadPost.",
    heroHeadline: "The Minds Behind the Reporting",
    heroSubhead: "Meet the veteran investigative journalists, deeptech analysts, venture editors, and multimedia producers powering GoReadPost's daily coverage.",
    heroBanner: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: false,
    order: 11,
    seo: {
      title: "Editorial Team & Bureau Leadership | GoReadPost",
      description: "Meet the investigative reporters, editors, and research analysts delivering trusted startup and technology reporting.",
      keywords: ["editorial team", "journalists", "masthead", "editors", "GoReadPost newsroom"]
    },
    sections: [
      {
        id: "team_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          badge: "NEWSROOM LEADERSHIP",
          headline: "The Minds Behind the Reporting",
          subheadline: "Meet the veteran investigative journalists, deeptech analysts, venture editors, and multimedia producers powering GoReadPost's daily coverage.",
          primaryBtnText: "Read Editorial Guidelines",
          primaryBtnUrl: "#ethics",
          secondaryBtnText: "Send a Story Lead",
          secondaryBtnUrl: "/pitch",
          bgImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
        }
      },
      {
        id: "team_leaders",
        type: "services",
        order: 2,
        enabled: true,
        data: {
          badge: "BUREAU EDITORS",
          heading: "Senior Editorial Leadership",
          subheading: "Experienced editors guiding our investigative desks across Bengaluru, New Delhi, San Francisco, and Singapore.",
          items: [
            {
              icon: "Award",
              title: "Shradha Sharma",
              description: "Founder & Editor-in-Chief. Pioneer in Indian startup journalism, author, and champion of founder voices across global ecosystems."
            },
            {
              icon: "Zap",
              title: "Dr. Madanmohan Rao",
              description: "Research Director & DeepTech Editor. Tech historian, author, and analyst leading our sovereign compute, AI, and frontier research."
            },
            {
              icon: "Shield",
              title: "Aravind Mohan",
              description: "Executive Editor — Venture & Capital. Former private equity analyst directing our investigative coverage of term sheets, cap tables, and governance."
            },
            {
              icon: "Layers",
              title: "Pooja Roy",
              description: "Senior Editor — AI & Cloud Architecture. Tracking foundational model architectures, data center scale, and semiconductor supply chains."
            },
            {
              icon: "Globe",
              title: "Vikram Sengupta",
              description: "Investigative Bureau Lead. Award-winning reporter overseeing deep financial forensic investigations and board audits."
            },
            {
              icon: "Sparkles",
              title: "Nandita Iyer",
              description: "Editor — HerStory & Social Impact. Highlighting pioneering women founders, climate technologies, and inclusive ventures."
            }
          ]
        }
      },
      {
        id: "team_ethics",
        type: "text",
        order: 3,
        enabled: true,
        data: {
          title: "Editorial Ethics, Byline Independence & Corrections",
          alignment: "left",
          maxWidth: "860px",
          content: `
            <div id="ethics" style="line-height: 1.8; color: var(--text-secondary);">
              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin-bottom: 0.75rem;">Source Protection & Confidentiality</h3>
              <p style="margin-bottom: 1.25rem;">
                GoReadPost journalists safeguard confidential sources under all circumstances. We provide secure channels including encrypted Signal lines and PGP keys for whistleblowers and insiders sharing public-interest documentation.
              </p>
              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin-bottom: 0.75rem;">Commitment to Factual Corrections</h3>
              <p style="margin-bottom: 1.25rem;">
                When a factual error occurs, we correct it promptly and transparently with an explicit correction footnote detailing what was changed and when. Readers can notify our corrections desk directly at <code style="background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; color: var(--brand-primary);">corrections@goreadpost.com</code>.
              </p>
            </div>
          `
        }
      },
      {
        id: "team_cta",
        type: "cta",
        order: 4,
        enabled: true,
        data: {
          badge: "WORK WITH US",
          heading: "Interested in Joining Our Bureau?",
          description: "We are continually scouting high-caliber correspondents, video documentary leads, and market analysts.",
          primaryBtnText: "Explore Open Careers",
          primaryBtnUrl: "/careers",
          secondaryBtnText: "Pitch Your Story",
          secondaryBtnUrl: "/pitch"
        }
      }
    ]
  },

  // 3. CAREERS
  {
    id: "careers",
    title: "Careers",
    slug: "careers",
    brand: "GoReadPost",
    description: "Join GoReadPost newsroom, engineering, video studio, and market research teams.",
    heroHeadline: "Build the Future of Modern Technology Journalism",
    heroSubhead: "We are assembling ambitious investigative journalists, data analysts, creative producers, and software engineers to redefine tech media.",
    heroBanner: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: false,
    order: 12,
    seo: {
      title: "Careers at GoReadPost | Work in Tech Media",
      description: "Explore open job positions across journalism, multimedia, software engineering, and research at GoReadPost.",
      keywords: ["careers", "jobs", "journalism jobs", "tech reporter", "engineering jobs"]
    },
    sections: [
      {
        id: "careers_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          badge: "WE ARE HIRING",
          headline: "Build the Future of Modern Technology Journalism",
          subheadline: "We are assembling ambitious investigative journalists, data analysts, creative producers, and software engineers to redefine tech media.",
          primaryBtnText: "View Open Roles",
          primaryBtnUrl: "#services",
          secondaryBtnText: "Our Culture & Perks",
          secondaryBtnUrl: "#faq",
          bgImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&q=80"
        }
      },
      {
        id: "careers_openings",
        type: "services",
        order: 2,
        enabled: true,
        data: {
          badge: "ACTIVE OPENINGS",
          heading: "Featured Newsroom & Tech Positions",
          subheading: "Competitive compensation, equity, flexible hybrid work models, and comprehensive health coverage.",
          items: [
            {
              icon: "Zap",
              title: "Senior Correspondent — AI & DeepTech",
              description: "Location: Bengaluru (Hybrid) / Full-Time. Lead investigative reporting on India's sovereign compute stack, GPUs, and LLM foundational builders."
            },
            {
              icon: "Shield",
              title: "Venture Capital Reporter — The CapTable",
              description: "Location: Mumbai or Delhi / Full-Time. Uncover term sheet terms, bridge rounds, secondary exits, and private fund governance."
            },
            {
              icon: "Layers",
              title: "Staff Frontend Engineer — Next-Gen CMS",
              description: "Location: Remote or Bengaluru / Full-Time. Architect blazing-fast reader interfaces, editorial tooling, and custom publishing canvases."
            },
            {
              icon: "Award",
              title: "Lead Video Producer — GoReadPost Studio",
              description: "Location: Bengaluru / Full-Time. Direct high-production cinema founder interviews, keynotes, and documentary mini-series."
            },
            {
              icon: "Globe",
              title: "Research Analyst — Venture Data & Reports",
              description: "Location: Remote / Full-Time. Formulate quarterly funding indices, sector maps, and deep-dive valuation whitepapers."
            },
            {
              icon: "Sparkles",
              title: "Audience Growth & Newsletter Strategist",
              description: "Location: Remote / Full-Time. Scale subscriber retention, deliver editorial dispatches, and optimize multi-channel reach."
            }
          ]
        }
      },
      {
        id: "careers_faq",
        type: "faq",
        order: 3,
        enabled: true,
        data: {
          badge: "CULTURE & BENEFITS",
          heading: "Why Join the GoReadPost Newsroom?",
          subheading: "Everything you need to know about our culture, speed, and benefits.",
          items: [
            {
              question: "What is the working model at GoReadPost?",
              answer: "We offer flexible hybrid setups with hubs in Bengaluru, Delhi, and Mumbai, alongside fully remote roles for specialized beat reporters and engineering leads."
            },
            {
              question: "What benefits and healthcare plans are provided?",
              answer: "Comprehensive health insurance for you and your dependents, annual learning and conference allowances, top-tier Apple hardware, and generous wellness stipends."
            },
            {
              question: "How does GoReadPost support editorial autonomy?",
              answer: "We champion fearless reporting. Our journalists have the complete freedom to pursue hard-hitting investigations without commercial interference."
            },
            {
              question: "How do I apply if my role isn't listed?",
              answer: "Send your resume, links to your best published work or GitHub portfolio, and a short pitch to careers@goreadpost.com."
            }
          ]
        }
      },
      {
        id: "careers_cta",
        type: "cta",
        order: 4,
        enabled: true,
        data: {
          badge: "APPLY NOW",
          heading: "Ready to Chronicle the Builders of Tomorrow?",
          description: "Send your resume and portfolio directly to our talent acquisition team.",
          primaryBtnText: "Email Careers Desk (careers@goreadpost.com)",
          primaryBtnUrl: "mailto:careers@goreadpost.com",
          secondaryBtnText: "Explore About Us",
          secondaryBtnUrl: "/about"
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

  // 5. PRIVACY POLICY
  {
    id: "privacy",
    title: "Privacy Policy",
    slug: "privacy",
    brand: "GoReadPost",
    description: "GoReadPost data collection practices, reader privacy protections, and compliance guidelines.",
    heroHeadline: "Privacy Policy & Reader Data Protection",
    heroSubhead: "Transparency regarding how we collect, use, store, and safeguard your data across all GoReadPost media platforms, apps, and newsletters.",
    heroBanner: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: false,
    order: 14,
    seo: {
      title: "Privacy Policy | GoReadPost",
      description: "Our privacy commitments, cookie policies, reader data governance, and DPDP / GDPR compliance disclosures.",
      keywords: ["privacy policy", "data protection", "cookies", "reader rights", "GDPR", "DPDP"]
    },
    sections: [
      {
        id: "privacy_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          badge: "LEGAL & COMPLIANCE",
          headline: "Privacy Policy & Reader Data Protection",
          subheadline: "Transparency regarding how we collect, use, store, and safeguard your data across all GoReadPost media platforms, apps, and newsletters.",
          primaryBtnText: "Read Policy Terms",
          primaryBtnUrl: "#policy-content",
          secondaryBtnText: "Contact Data Protection Officer",
          secondaryBtnUrl: "mailto:privacy@goreadpost.com",
          bgImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80"
        }
      },
      {
        id: "privacy_body",
        type: "text",
        order: 2,
        enabled: true,
        data: {
          title: "Privacy Policy & Governance Disclosures",
          alignment: "left",
          maxWidth: "860px",
          content: `
            <div id="policy-content" style="line-height: 1.8; color: var(--text-secondary);">
              <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">
                <em>Effective Date: January 1, 2026 · Last Updated: October 2026</em>
              </p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">1. Information We Collect</h3>
              <p>We collect information that you directly provide when registering for an account, saving bookmarks, signing up for the GoReadPost Daily Dispatch newsletter, or pitching a story. This includes your name, email address, username, and professional affiliation.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">2. How We Use Reader Information</h3>
              <p>Your data is used solely to provide and improve your reading experience: delivering subscribed morning intelligence emails, saving your reading list bookmarks, securing your account authentication, and aggregating anonymous traffic analytics to understand reader interest.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">3. Zero-Sale Commitment</h3>
              <p>We <strong>never sell, lease, or monetize your personal information</strong> to third-party data brokers, ad networks, or telemarketers. We believe reader trust is non-negotiable.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">4. Cookies & Session Storage</h3>
              <p>We utilize standard browser cookies and local storage tokens strictly to maintain your authenticated login session, preserve your light/dark theme preference, and cache offline bookmarks.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">5. Reader Rights (Access, Correction & Deletion)</h3>
              <p>You have the absolute right to request an export of your stored personal data, correct inaccurate details, or request full account and bookmark deletion at any time by contacting our privacy desk.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">6. Data Protection Officer Contact</h3>
              <p>For any privacy inquiries or compliance requests, email our dedicated Data Protection Officer at <code style="background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; color: var(--brand-primary);">privacy@goreadpost.com</code>.</p>
            </div>
          `
        }
      }
    ]
  },

  // 6. TERMS OF SERVICE
  {
    id: "terms",
    title: "Terms of Service",
    slug: "terms",
    brand: "GoReadPost",
    description: "Terms and conditions governing access to and use of GoReadPost journalism, video studio, and APIs.",
    heroHeadline: "Terms of Service & Editorial Usage Agreement",
    heroSubhead: "The terms and legal conditions governing your access to GoReadPost articles, newsletters, video studio productions, and digital community features.",
    heroBanner: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: false,
    order: 15,
    seo: {
      title: "Terms of Service | GoReadPost",
      description: "Terms of service, copyright notices, content licensing, and acceptable use guidelines for GoReadPost.",
      keywords: ["terms of service", "terms of use", "copyright", "licensing", "legal"]
    },
    sections: [
      {
        id: "terms_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          badge: "TERMS OF SERVICE",
          headline: "Terms of Service & Editorial Usage Agreement",
          subheadline: "The terms and legal conditions governing your access to GoReadPost articles, newsletters, video studio productions, and digital community features.",
          primaryBtnText: "Read Agreement",
          primaryBtnUrl: "#terms-content",
          secondaryBtnText: "View Disclaimer",
          secondaryBtnUrl: "/disclaimer",
          bgImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80"
        }
      },
      {
        id: "terms_body",
        type: "text",
        order: 2,
        enabled: true,
        data: {
          title: "Terms of Service & Intellectual Property",
          alignment: "left",
          maxWidth: "860px",
          content: `
            <div id="terms-content" style="line-height: 1.8; color: var(--text-secondary);">
              <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">
                <em>Effective Date: January 1, 2026 · Last Updated: October 2026</em>
              </p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">1. Acceptance of Terms</h3>
              <p>By browsing, accessing, or subscribing to GoReadPost platforms, you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, please discontinue platform use.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">2. Intellectual Property & Syndication Rights</h3>
              <p>All written journalism, video episodes, photographs, graphics, trademarks, and code on GoReadPost are the exclusive intellectual property of GoReadPost Media Technologies Pvt. Ltd. You may not republish, scrape, or syndicate entire articles without prior written authorization.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">3. Fair Use & Quotation Standards</h3>
              <p>Short excerpts (up to 75 words) may be cited for academic, educational, or press review purposes, provided explicit attribution is given with a direct clickable link to the original GoReadPost canonical URL.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">4. User Conduct & Acceptable Use</h3>
              <p>Users must not attempt to compromise website security, flood form endpoints, scrape protected directories, or impersonate editorial staff.</p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">5. Governing Jurisdiction</h3>
              <p>These terms shall be governed by and construed in accordance with the laws of India, with exclusive jurisdiction in the courts of Bengaluru, Karnataka.</p>
            </div>
          `
        }
      }
    ]
  },

  // 7. DISCLAIMER
  {
    id: "disclaimer",
    title: "Disclaimer",
    slug: "disclaimer",
    brand: "GoReadPost",
    description: "Editorial independence statement, investment disclosure, and liability exclusions.",
    heroHeadline: "Editorial Independence & Financial Disclaimers",
    heroSubhead: "Important disclosures regarding financial reporting, investment risks, sponsored brand partnerships, and journalistic impartiality.",
    heroBanner: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: false,
    order: 16,
    seo: {
      title: "Disclaimer & Editorial Disclosures | GoReadPost",
      description: "Financial, legal, and investment disclaimers regarding journalism published by GoReadPost.",
      keywords: ["disclaimer", "investment disclosure", "financial disclaimer", "editorial integrity"]
    },
    sections: [
      {
        id: "disclaimer_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          badge: "EDITORIAL DISCLOSURE",
          headline: "Editorial Independence & Financial Disclaimers",
          subheadline: "Important disclosures regarding financial reporting, investment risks, sponsored brand partnerships, and journalistic impartiality.",
          primaryBtnText: "Read Disclaimers",
          primaryBtnUrl: "#disclaimer-content",
          secondaryBtnText: "Privacy Policy",
          secondaryBtnUrl: "/privacy",
          bgImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80"
        }
      },
      {
        id: "disclaimer_body",
        type: "text",
        order: 2,
        enabled: true,
        data: {
          title: "Legal & Journalistic Disclaimers",
          alignment: "left",
          maxWidth: "860px",
          content: `
            <div id="disclaimer-content" style="line-height: 1.8; color: var(--text-secondary);">
              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">1. Not Financial, Investment, or Legal Advice</h3>
              <p style="margin-bottom: 1.25rem;">
                All articles, valuations, cap table breakdowns, and funding reports published on GoReadPost are strictly for <strong>informational, educational, and journalistic purposes</strong>. Nothing published constitutes an offer to buy or sell securities, or personalized investment, legal, or tax advice. Readers must conduct independent due diligence before making capital allocation decisions.
              </p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">2. Journalistic Impartiality & Equity Holdings</h3>
              <p style="margin-bottom: 1.25rem;">
                GoReadPost journalists are strictly prohibited from holding undisclosed equity, advisory tokens, or compensation in the private startups they report on. Any personal conflicts of interest are formally disclosed in the story's byline.
              </p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">3. Sponsored Content & Brand Partnerships</h3>
              <p style="margin-bottom: 1.25rem;">
                Commercial content produced in partnership with corporate sponsors is explicitly demarcated with unambiguous <strong>"Sponsored Feature"</strong>, <strong>"Brand Lab"</strong>, or <strong>"Partner Solution"</strong> labels. The independent GoReadPost newsroom is never involved in the creation of paid commercial advertising.
              </p>

              <h3 style="font-size: 1.25rem; font-weight: 750; color: var(--text-primary); margin: 1.5rem 0 0.5rem;">4. Accuracy & Historical Archives</h3>
              <p style="margin-bottom: 1.25rem;">
                While every effort is made to verify metrics at the time of publication, market conditions evolve rapidly. GoReadPost disclaims liability for decisions made based on archived historical reporting.
              </p>
            </div>
          `
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
          cardsPerPage: 10,
          defaultSort: "latest",
          showPills: true,
          showHero: true,
          curation: {}
        }
      }
    ]
  },
  {
    id: "founder-first",
    slug: "founder-first",
    title: "Founder First - Zero to One Playbooks",
    brand: "GoReadPost",
    description: "Curated founder playbooks, bootstrapping miracles, and startup scaling blueprints from India's audacious builders.",
    heroHeadline: "Founder First Desk",
    heroSubhead: "Unfiltered founder playbooks, bootstrapping lessons, and scaling blueprints from India’s audacious builders.",
    heroBanner: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 5,
    sections: [
      { id: "founder_playbooks", type: "stories", order: 1, enabled: true, title: "Founder Playbooks" },
      { id: "founder_cta", type: "cta", order: 2, enabled: true, title: "Pitch Callout Banner" }
    ],
    seo: {
      title: "Founder First | Zero-to-One Playbooks & Builder Journeys",
      description: "Unfiltered founder playbooks, bootstrapping lessons, and scaling blueprints from India’s audacious builders.",
      keywords: ["startups", "founder stories", "zero to one", "bootstrapped", "playbooks"]
    }
  }
];

// Helper to find a fallback page by slug or id
export function getFallbackPageBySlug(slug) {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim().replace(/^\/+/, '');
  return COMPANY_AND_LEGAL_PAGES.find(p => {
    const pSlug = (p.slug || '').toLowerCase().replace(/^\/+/, '');
    if (pSlug === clean || p.id === clean) return true;
    if ((clean === 'founder' || clean === 'founder-first') && (pSlug === 'founder-first' || p.id === 'founder-first')) return true;
    if ((clean === 'categories' || clean === 'category' || clean === 'content') && (pSlug === 'categories' || p.id === 'category')) return true;
    if (clean === 'about-us' && pSlug === 'about') return true;
    if ((clean === 'contact' || clean === 'contact-us') && (pSlug === 'pitch' || pSlug === 'contact')) return true;
    if (clean === 'team' && pSlug === 'editorial-team') return true;
    if (clean === 'authors' && pSlug === 'editorial-team') return true;
    if (clean === 'jobs' && pSlug === 'careers') return true;
    if (clean === 'privacy-policy' && pSlug === 'privacy') return true;
    if (clean === 'terms-of-service' && pSlug === 'terms') return true;
    return false;
  }) || null;
}
