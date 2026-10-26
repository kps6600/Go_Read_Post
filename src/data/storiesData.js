// GoReadPost Curated Nav Links & Categories
export const NAV_LINKS = [
  { id: "latest", label: "Latest", hasDropdown: false, url: "/latest" },
  { id: "trending", label: "Trending", hasDropdown: false, url: "/trending" },
  { id: "categories", label: "Categories", hasDropdown: true, url: "/category/startups" },
  { id: "videos", label: "Videos", hasDropdown: false, url: "/videos" },
  { id: "newsletter", label: "Newsletter", hasDropdown: false, url: "/newsletter" }
];

export const NAV_DROPDOWNS_DATA = {
  company: {
    align: 'center',
    columns: [
      {
        title: 'COMPANY & CONNECT',
        items: [
          { label: 'About Us', url: '/about', badge: 'Our Story' },
          { label: 'Contact Us', url: '/contact', badge: 'Get in Touch' },
          { label: 'Advertise With Us', url: '/advertise', badge: 'Partner' },
          { label: 'Editorial Team', url: '/editorial-team', badge: 'Newsroom' },
          { label: 'Careers', url: '/careers', badge: "We're Hiring" },
          { label: 'Pitch Story', url: '/pitch', badge: 'Submit' }
        ]
      },
      {
        title: 'STANDARDS & TRUST',
        items: [
          { label: 'Editorial Policy', url: '/editorial-policy', badge: 'Ethics' },
          { label: 'Privacy Policy', url: '/privacy-policy' },
          { label: 'Terms of Service', url: '/terms' },
          { label: 'Disclaimer', url: '/disclaimer' }
        ]
      },
      {
        title: 'FEATURED HUBS',
        items: [
          { label: 'Trending News', url: '/trending', badge: 'Hot' },
          { label: 'Latest Dispatches', url: '/latest' },
          { label: 'Newsletter Digest', url: '/newsletter' }
        ]
      }
    ]
  },
  categories: {
    align: 'center',
    columns: [
      {
        title: 'CORE DESKS',
        items: [
          { label: 'Startups & Ecosystem', url: '/category/startups', badge: 'Hot' },
          { label: 'Technology & Cloud', url: '/category/technology' },
          { label: 'AI & DeepTech', url: '/category/ai-deeptech', badge: 'Frontier' },
          { label: 'Enterprise & SaaS', url: '/category/enterprise' },
          { label: 'FinTech & Web3', url: '/category/fintech' }
        ]
      },
      {
        title: 'SPECIALTY DESKS',
        items: [
          { label: 'Founder Stories', url: '/category/startups' },
          { label: 'HerStory (Women Pioneers)', url: '/category/her-story', badge: 'Pioneers' },
          { label: 'SMBStory (MSME & D2C)', url: '/category/smbstory' },
          { label: 'SocialStory (Impact & Climate)', url: '/category/social-story' }
        ]
      },
      {
        title: 'MULTIMEDIA & HUBS',
        items: [
          { label: 'Videos & Studio Shows', url: '/videos', badge: 'Watch' }
        ]
      }
    ]
  },
  topics: {
    align: 'center',
    columns: [
      {
        title: 'FRONTIER TECH',
        items: [
          { label: 'Artificial Intelligence', url: '/topic/artificial-intelligence', badge: 'Hub' },
          { label: 'ChatGPT & LLMs', url: '/tag/chatgpt', badge: 'Tag' },
          { label: 'Sovereign Compute & Chips', url: '/topic/compute' },
          { label: 'Cybersecurity & Defense Tech', url: '/topic/cyber' },
          { label: 'Robotics & Automation', url: '/topic/robotics' }
        ]
      },
      {
        title: 'MARKETS & CAPITAL',
        items: [
          { label: 'Venture Capital & Deals', url: '/topic/venture-capital', badge: 'Live' },
          { label: 'Early-Stage Seed & Pre-A', url: '/topic/seed-funding' },
          { label: 'Unicorns & Late Stage', url: '/topic/unicorns' },
          { label: 'IPO & Public Markets', url: '/topic/ipo' }
        ]
      },
      {
        title: 'GLOBAL THEMES',
        items: [
          { label: 'Climate Tech & Energy', url: '/topic/climate-tech' },
          { label: 'Digital Public Infrastructure', url: '/topic/dpi' },
          { label: 'B2B SaaS & Cloud', url: '/topic/saas' },
          { label: 'Web3 & Tokenization', url: '/topic/web3' }
        ]
      }
    ]
  }
};

export const BRANDS_MENU_DATA = [
  // Column 1
  {
    col: 1,
    title: "The CapTable",
    categoryId: "captable",
    externalUrl: "https://the-captable.com/",
    storyTitle: "Anthropic's prospectus of radical confession",
    image: "https://images.yourstory.com/cs/2/d99b1110116911ed9e63f54395117598/Imager9c1-1783326136995.jpg?ar=16%3A9&mode=crop&crop=faces&format=auto&w=256&q=75",
    fallbackImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
  },
  {
    col: 1,
    title: "SocialStory",
    categoryId: "social-story",
    storyTitle: "Four Indian brands putting a new spin on khadi",
    image: "https://images.yourstory.com/cs/4/8e7cc4102d6c11e9aa979329348d4c3e/ModernKhadi1600x900-1790843426768.jpg?ar=16%3A9&mode=crop&crop=faces&format=auto&w=256&q=75",
    fallbackImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80"
  },
  // Column 2
  {
    col: 2,
    title: "AI Story",
    categoryId: "ai-story",
    storyTitle: "Trump calls for artificial intelligence to be renamed 'super intelligence' in the...",
    image: "https://images.yourstory.com/cs/4/8e7cc4102d6c11e9aa979329348d4c3e/Screenshot2026-10-02at1-1790926676701.png?ar=16%3A9&mode=crop&crop=faces&format=auto&w=256&q=75",
    fallbackImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
  },
  {
    col: 2,
    title: "SMBStory",
    categoryId: "smbstory",
    storyTitle: "This Mumbai-based company is building a global-grade beauty brand without...",
    image: "https://images.yourstory.com/cs/120/31ee0510ca7c11eba975c529dced399e/cover-image-1632994696616.png?ar=16%3A9&mode=crop&crop=faces&format=auto&w=256&q=75",
    fallbackImage: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80"
  },
  {
    col: 2,
    title: "Tamil",
    categoryId: "tamil",
    storyTitle: "10 கிலோ பனீரில் தொடங்கி இன்று ரூ.10,000 கோடி...",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80"
  },
  // Column 3
  {
    col: 3,
    title: "HerStory",
    categoryId: "her-story",
    storyTitle: "She couldn't do one pull-up. Today, Prableen Kaur Gill is Asia's No. 1 street...",
    image: "https://images.yourstory.com/cs/4/d99b1110116911ed9e63f54395117598/hockey-1790945861133.png?format=auto&w=256&q=75",
    fallbackImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
  },
  {
    col: 3,
    title: "EnterpriseStory",
    categoryId: "enterprise",
    storyTitle: "Pharma's real AI challenge is embedding it into day-to-day operations: Karan...",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80"
  }
];

export const SIDEBAR_DESKS = [

  {
    title: "Editorial Desks",
    items: [
      { id: "startups", label: "Startups & Ecosystem" },
      { id: "deep-tech", label: "AI & Deep Tech" },
      { id: "funding", label: "Funding & VC Deals" },
      { id: "enterprise", label: "Enterprise & SaaS" },
      { id: "fintech", label: "Fintech & Web3" },
      { id: "d2c", label: "Consumer & D2C" },
      { id: "her-story", label: "HerStory (Women Pioneers)" },
      { id: "social-story", label: "SocialStory (Impact)" },
      { id: "leadership", label: "Leadership Lens" }
    ]
  },
  {
    title: "Brands & Properties",
    items: [
      { id: "techsparks", label: "TechSparks Summit" },
      { id: "captable", label: "The CapTable" },
      { id: "smbstory", label: "SMBStory" },
      { id: "ystv", label: "YSTV Studio & Shows" },
      { id: "spark", label: "The Spark Series" },
      { id: "mavericks", label: "Mavericks" },
      { id: "disruptor", label: "Disruptor Dialogues" }
    ]
  },
  {
    title: "Resources & Intelligence",
    items: [
      { id: "research", label: "Research & Sector Reports" },
      { id: "handbooks", label: "Founder Handbooks" },
      { id: "funding-tracker", label: "Deals Tracker" },
      { id: "pitch", label: "Pitch Your Story to Editorial" }
    ]
  }
];

export const TOP_PICKS = [
  {
    id: "pick-1",
    title: "I wanted to quit boxing but I continued, had to change colour of Asiad medal: Lovlina",
    categoryLabel: "HerStory",
    category: "her-story",
    readTime: "5 min read",
    publishedAt: "2 hours ago",
    author: {
      name: "Press Trust of India",
      title: "Sports Correspondent",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/4/8e7cc4102d6c11e9aa979329348d4c3e/Screenshot2026-10-02at1-1790926676701.png?ar=16%3A9&mode=crop&crop=faces&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80",
    summary: "Olympic bronze medallist Lovlina Borgohain opens up about self-doubt, rigorous tactical transformations, and her relentless drive to upgrade her Asian Games medal into gold.",
    content: [
      "In an emotional and candid interview following her podium triumph, Olympic medallist Lovlina Borgohain revealed that she had seriously contemplated stepping away from competitive boxing during the peak of training exhaustion.",
      "“There were days when the physical toll and the tactical adjustments felt overwhelming. But I made a quiet vow to myself: I had to change the colour of the medal. I couldn't stop at bronze when India was counting on me,” she said.",
      "Lovlina reworked her footwork and infighting defence over ten grueling months in Patiala, focusing on counter-punching against taller southpaws. Her perseverance bore fruit with a dominating performance that secured her berth at the upcoming Olympic qualifiers."
    ]
  },
  {
    id: "pick-2",
    title: "Four Indian brands putting a new spin on khadi",
    categoryLabel: "SMBStory",
    category: "smbstory",
    readTime: "6 min read",
    publishedAt: "3 hours ago",
    author: {
      name: "Palak Agarwal",
      title: "SMBStory Desk",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/4/8e7cc4102d6c11e9aa979329348d4c3e/ModernKhadi1600x900-1790843426768.jpg?ar=16%3A9&mode=crop&crop=faces&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80",
    summary: "From high-fashion jackets in Milan to everyday urban streetwear, how indigenous artisan collectives and modern designers are redefining India's heritage fabric.",
    content: [
      "Khadi is no longer confined to traditional national occasions. A rising wave of contemporary homegrown brands is fusing handspun, zero-carbon cotton and silk with modern cuts, neutral tones, and durable tailoring.",
      "By collaborating directly with weaver clusters across West Bengal, Karnataka, and Andhra Pradesh, these labels ensure living wages for rural artisans while introducing khadi to Gen Z and millennial wardrobes.",
      "“We want people to touch the fabric and realise that it is the ultimate natural luxury: breathable in heat, insulated in cool evenings, and entirely biodegradable,” says one of the featured designers."
    ]
  },
  {
    id: "pick-3",
    title: "Telangana, Maharashtra, UP lead state rankings in data centre policy attractiveness: S&P Global",
    categoryLabel: "Big Tech",
    category: "deep-tech",
    readTime: "5 min read",
    publishedAt: "4 hours ago",
    author: {
      name: "Enterprise Bureau",
      title: "Infrastructure & Cloud",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/120/31ee0510ca7c11eba975c529dced399e/cover-image-1632994696616.png?ar=16%3A9&mode=crop&crop=faces&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    summary: "A comprehensive S&P Global ratings report highlights state-level power tariffs, renewable energy zoning, and single-window statutory clearances as key drivers of hyperscale cloud capacity.",
    content: [
      "India's data centre capacity is projected to cross 2.5 Gigawatts by 2027, driven by exponential generative AI training and strict local data residency mandates.",
      "According to S&P Global, Telangana, Maharashtra, and Uttar Pradesh have outpaced neighboring industrial corridors by offering subsidized dual-grid electricity, fast-track environmental clearance, and dedicated sub-sea cable landing connectivity in coastal regions.",
      "Global hyperscalers including AWS, Microsoft, and Google have committed multi-billion dollar capital expenditure plans in Hyderabad and Navi Mumbai over the next five fiscal years."
    ]
  },
  {
    id: "pick-4",
    title: "White-collar hiring grows 2% led by AI/ML sector in Sep: Report",
    categoryLabel: "Workplace",
    category: "leadership",
    readTime: "4 min read",
    publishedAt: "5 hours ago",
    author: {
      name: "Research Desk",
      title: "Labour & Talent Analytics",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/2/d99b1110116911ed9e63f54395117598/Imager9c1-1783326136995.jpg?ar=16%3A9&mode=crop&crop=faces&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
    summary: "Specialized roles in machine learning deployment, computer vision, and neural network optimization saw a 28% year-on-year surge, stabilizing broad white-collar recruitment indices.",
    content: [
      "While traditional IT recruitment and generalist software engineering remained flat, hiring for artificial intelligence, machine learning ops (MLOps), and specialized data architecture recorded brisk sequential momentum.",
      "The latest monthly employment tracker reveals that Bengaluru and Hyderabad accounted for over 48% of all high-value tech openings, with salary premiums for senior AI researchers expanding significantly.",
      "“Companies are no longer doing speculative mass hiring. Every open requisition requires demonstrated capability in deploying large-scale automated pipelines,” said a leading HR executive."
    ]
  }
];

export const LEAD_STORY = {
  id: "lead-hockey",
  title: "Lalremsiami's strike, Bichu Devi's wall of resistance power India to hockey gold, LA Olympics berth",
  subtitle: "Lalremsiami's superb reverse-stick strike in the 10th minute gave India the lead, but it was goalkeeper Bichu Devi's heroics and a defence that refused to yield that ultimately settled the final.",
  categoryLabel: "Sports & Nation",
  category: "her-story",
  readTime: "7 min read",
  publishedAt: "Oct 3, 2026",
  author: {
    name: "Press Trust of India",
    title: "Chief Sports Correspondent",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
  },
  claps: 3420,
  commentsCount: 52,
  image: "https://images.yourstory.com/cs/4/d99b1110116911ed9e63f54395117598/hockey-1790945861133.png?format=auto&w=1920&q=75",
  fallbackImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80",
  summary: "A masterclass in tactical discipline and heroic goalkeeping as the Indian women's hockey team captures Asian Games gold and punches its official ticket to the Los Angeles Olympic Games.",
  content: [
    "In one of the most thrilling hockey finals in recent memory, India's women's hockey squad defended their hearts out to secure a memorable 1-0 victory, claiming Asian Games gold and an automatic berth for the upcoming Los Angeles Olympic Games.",
    "The defining offensive moment arrived in the 10th minute when forward Lalremsiami, receiving a pinpoint cross from the right flank, controlled the ball on the spin and fired an unstoppable reverse-stick drive into the top left corner.",
    "From that moment on, it was an exhibition of sheer defensive grit. In the fourth quarter alone, India conceded four penalty corners under intense offensive bombardment. Each time, goalkeeper Bichu Devi stood tall, producing reflex stick saves and clearing rebounds under suffocating pressure.",
    "“We promised each other that not a single inch would be given easily,” Lalremsiami remarked after the final whistle. “Every drop of sweat in the training camps over the last three years was for this flag and this gold medal.”",
    "With this victory, the squad secures direct qualification for LA 2028, cementing their position among the world's elite hockey nations."
  ]
};

export const CAPTABLE_STORIES = [
  {
    id: "captable-1",
    title: "India's IT services pyramid Is hollowing out from the middle",
    categoryLabel: "The CapTable",
    category: "captable",
    readTime: "8 min read",
    publishedAt: "Yesterday",
    author: {
      name: "The CapTable Bureau",
      title: "Enterprise Strategy",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/2/47afd43024ec11ec9ecb9b7afb0df1da/ITpyramidSquare-1790702536024.jpg?format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    summary: "As AI code generation automates mid-tier software testing and legacy maintenance, India's $250 billion IT giants face a structural squeeze on mid-level managerial pyramids.",
    content: [
      "For three decades, the Indian IT services delivery model operated on a predictable pyramidal hierarchy: thousands of fresh campus recruits at the base, project leads and middle managers in the center, and client partners at the apex.",
      "Now, enterprise customers are demanding outcome-based billing rather than billable man-hours. Generative AI agents are completing in minutes tasks that previously required a team of four mid-level analysts.",
      "This structural shift is compelling Indian tech giants to retrain hundreds of thousands of staff into specialized solutions architects, prompting the steepest reshaping of white-collar IT careers in a generation."
    ]
  },
  {
    id: "captable-2",
    title: "If AI is writing your resume, then what?",
    categoryLabel: "The CapTable",
    category: "captable",
    readTime: "6 min read",
    publishedAt: "2 days ago",
    author: {
      name: "Aditi Shrivastava",
      title: "Work & Culture Desk",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.the-captable.com/cs/158/86d027d02d6b11e9aa979329348d4c3e/recruitAiSquare-1790610395355.jpg?format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80",
    summary: "When both applicants and hiring managers rely on automated LLM agents, recruitment devolves into a game of algorithmic cat-and-mouse. How companies are returning to real-world proof-of-work.",
    content: [
      "Candidate resumes have become uniformly flawless: keyword-optimized, grammatically immaculate, and crafted by generative AI. On the receiving end, corporate ATS algorithms parse and filter thousands of synthetic profiles per hour.",
      "The result is reciprocal exhaustion. Top tier startups and engineering teams are quietly discarding standard resumes in favor of live code walkthroughs, verifiable GitHub repositories, and paid trial projects.",
      "“We don't care how eloquently your CV is written,” says a seed fund founder. “Show us what you built under production pressure last month.”"
    ]
  },
  {
    id: "captable-3",
    title: "Under Ronnie Screwvala’s watch, upGrad is chasing PhysicsWallah, Eruditus",
    categoryLabel: "The CapTable",
    category: "captable",
    readTime: "9 min read",
    publishedAt: "3 days ago",
    author: {
      name: "The CapTable Bureau",
      title: "EdTech & Private Markets",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.the-captable.com/cs/158/d99b1110116911ed9e63f54395117598/UpgradSquare-1790570991900.jpg?format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    summary: "Navigating post-pandemic market consolidation, upGrad bets heavily on university-accredited higher degrees and hybrid offline coaching centers to challenge valuation peers.",
    content: [
      "The Indian education technology landscape has shifted dramatically from hyper-funded customer acquisition into ruthless unit economic discipline.",
      "Under Ronnie Screwvala's leadership, upGrad has pivoted away from short unaccredited micro-courses towards multi-year degrees in partnership with top global institutions.",
      "With offline exam prep centers and corporate enterprise training contracts stabilizing cash flows, the company is preparing for an eventual domestic public listing."
    ]
  }
];

export const CONVERSATIONS_SHOWS = [
  {
    id: "conv-1",
    title: "In conversation with Shradha Sharma",
    series: "Featured Conversations",
    categoryLabel: "Startups",
    host: "Shradha Sharma",
    guest: "Leading Tech Innovators",
    duration: "38:20",
    views: "290K",
    image: "https://images.yourstory.com/cs/series/1000068554-1755856651167.jpg?mode=crop&ar=1%3A1&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    summary: "Intimate, high-impact conversations with founders and pioneers shaping the destiny of the innovation ecosystem."
  },
  {
    id: "conv-2",
    title: "Beyond Borders",
    series: "Global Frontier",
    categoryLabel: "EnterpriseTech",
    host: "YourStory Global",
    guest: "Cross-Border Founders & VCs",
    duration: "45:15",
    views: "185K",
    image: "https://images.yourstory.com/cs/series/BeyondBorders-05-1757942123252.png?mode=crop&ar=1%3A1&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    summary: "Examining how Indian deep tech and SaaS companies are scaling into the US, Southeast Asia, and European enterprise markets."
  },
  {
    id: "conv-3",
    title: "The Mass Effect - a spark that ignites a flame, a catalyst for a chain reaction",
    series: "The Spark Series",
    categoryLabel: "Startups",
    host: "YS Studio",
    guest: "Hardware & Deeptech Builders",
    duration: "32:40",
    views: "210K",
    image: "https://images.yourstory.com/cs/series/Masseffect-01-1733232506337.png?mode=crop&ar=1%3A1&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    summary: "Chronicles of breakthrough physical engineering: rocketry, autonomous systems, and advanced precision hardware."
  },
  {
    id: "conv-4",
    title: "Mavericks - Season 3",
    series: "Mavericks",
    categoryLabel: "Startups",
    host: "Shradha Sharma",
    guest: "Visionary Business Builders",
    duration: "41:10",
    views: "340K",
    image: "https://images.yourstory.com/cs/series/Mavericks31-1-1724671697689.png?mode=crop&ar=1%3A1&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
    summary: "Deep dives into founders who took counter-consensus bets, endured brutal downturns, and built category leaders."
  },
  {
    id: "conv-5",
    title: "Disruptor Dialogues - Innovative Insights, Strategic Breakdowns",
    series: "Disruptor Dialogues",
    categoryLabel: "EnterpriseTech",
    host: "YourStory Editorial",
    guest: "C-Suite & Tech Architects",
    duration: "36:55",
    views: "175K",
    image: "https://images.yourstory.com/cs/series/YSDDdSH02-03-1720011975457.png?mode=crop&ar=1%3A1&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    summary: "Dissecting game-changing platform shifts across cloud infrastructure, sovereign AI, and financial architectures."
  },
  {
    id: "conv-6",
    title: "Money Matters with Ipsita Basu",
    series: "Money Matters",
    categoryLabel: "Fintech",
    host: "Ipsita Basu",
    guest: "Venture Partners & Angels",
    duration: "29:30",
    views: "120K",
    image: "https://images.yourstory.com/cs/series/MoneymatterstbnlIpsita800x800-1734507721720.jpg?mode=crop&ar=1%3A1&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    summary: "Actionable financial advice, valuation trends, cap table management, and the truth about startup liquidity."
  },
  {
    id: "conv-7",
    title: "Fabulous Workplaces",
    series: "Workplace Excellence",
    categoryLabel: "Workplaces",
    host: "Culture Bureau",
    guest: "People & Talent Leaders",
    duration: "27:15",
    views: "95K",
    image: "https://images.yourstory.com/cs/series/YSFW01-02-1713246900913.png?mode=crop&ar=1%3A1&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    summary: "Inside the most innovative, employee-centric workspaces fostering high performance and long-term retention."
  }
];

export const SPOTLIGHT_STORIES = [
  {
    id: "spotlight-1",
    title: "India’s top AI teams set to battle in Elastic and AWS's Forge the Future Hackathon finale",
    subtitle: "After weeks of registration, idea submission, and shortlisting, finalists compete in Bengaluru with the winners earning a place at Elastic{ON} Mumbai.",
    categoryLabel: "Spotlight",
    category: "deep-tech",
    readTime: "6 min read",
    publishedAt: "Today",
    author: {
      name: "Kaveri Chandrashekar",
      title: "Senior Enterprise Tech Editor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/2/21ccd920843c11ec88170b5512a0f9d5/2XElasticONHackathon800x400px-1789632852735.jpg?mode=fit&crop=faces&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    summary: "Top AI teams compete in Bengaluru for a grand prize and showcase at Elastic{ON} Mumbai.",
    content: [
      "The Grand Finale of the Elastic and AWS 'Forge the Future' Hackathon in Bengaluru brings together India's finest machine learning engineers.",
      "Finalist teams demonstrated production-grade agentic search workflows, multi-modal database retrieval, and enterprise compliance tools.",
      "The competition highlights India's swift transition from generic API wrappers into robust deep tech architectures."
    ]
  },
  {
    id: "spotlight-2",
    title: "EquityList launches AI-native cap table and compliance OS",
    subtitle: "The company, which manages more than $20 billion in securities across 650+ companies and 80,000+ stakeholders, introduces agentic AI capabilities.",
    categoryLabel: "Spotlight",
    category: "funding",
    readTime: "5 min read",
    publishedAt: "Yesterday",
    author: {
      name: "Siddharth Pai",
      title: "Fintech Contributor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/2/1c5b17d089c411ecbad7674cfc837f84/EquityListFeatureImage-1788158724953.jpg?mode=fit&crop=faces&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    summary: "EquityList introduces agentic AI to interpret legal term sheets and automate statutory filings.",
    content: [
      "EquityList has unveiled a major technology upgrade designed to eliminate human friction from ESOP administration and cap table compliance.",
      "The system automatically interprets term sheets, calculates dilution cascades, and generates statutory filings in seconds.",
      "With 80,000+ stakeholders on the platform, founders can now offer liquid secondary tender offers with zero administrative overhead."
    ]
  },
  {
    id: "spotlight-3",
    title: "How new broadcast technology is changing the way fans watch cricket",
    subtitle: "Immersive multi-angle cameras, AI-led graphics, and fan-powered sight screens redefine live sports entertainment.",
    categoryLabel: "Spotlight",
    category: "deep-tech",
    readTime: "5 min read",
    publishedAt: "2 days ago",
    author: {
      name: "Sports Tech Desk",
      title: "Broadcast & Media Innovation",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/2/81f42290b0f511edaa4d75d0d1d6c429/NEWSLETTERCREATIVEcopy-1788181051880.png?mode=fit&crop=faces&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80",
    summary: "Spatial cameras and neural networks deliver real-time predictive analytics to cricket streaming fans.",
    content: [
      "Modern cricket broadcasting has evolved into a high-bandwidth spatial computing experience.",
      "New computer vision algorithms analyze ball spin RPM, trajectory deviations, and fielding reaction times in milliseconds.",
      "Viewers can select personalized player cameras and interactive replay angles directly from their mobile apps."
    ]
  },
  {
    id: "spotlight-4",
    title: "Why Rubrik believes cyber resilience, not prevention, is the next frontier",
    subtitle: "As AI compresses cyberattacks from weeks to seconds, enterprises must prepare to recover from breaches, not just prevent them.",
    categoryLabel: "Spotlight",
    category: "deep-tech",
    readTime: "7 min read",
    publishedAt: "3 days ago",
    author: {
      name: "Cyber Desk",
      title: "Enterprise Security",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/2/21ccd920843c11ec88170b5512a0f9d5/RubrikVideointroframe1920x1080-22-1787031350752.png?mode=fit&crop=faces&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    summary: "Why perimeter security is obsolete, making immutable zero-trust backups the true benchmark.",
    content: [
      "In modern enterprise security, the premise of an impregnable network perimeter is obsolete.",
      "Rubrik's immutable data architecture ensures that even in the catastrophic event of a full active directory compromise, uncorrupted backup snapshots can restore critical operations.",
      "Boardrooms are recognizing that resilience—the ability to resume operations within hours rather than paying ransoms—is the true benchmark of security."
    ]
  }
];

export const FOUNDER_FIRST_STORIES = [
  {
    id: "founder-1",
    title: "Meet Nuvr, the bootstrapped startup managing Rs 1,200 Cr of ecommerce sales for brands",
    subtitle: "The Bengaluru-based startup runs online P&Ls for brands such as Medimix, Nilon’s, and Origami, using its own technology and a performance-linked revenue model.",
    categoryLabel: "Founder First",
    category: "founder-first",
    readTime: "8 min read",
    publishedAt: "Yesterday",
    author: {
      name: "Rashmi Khotlande",
      title: "Founders Desk",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/2/11718bd02d6d11e9aa979329348d4c3e/NuvrOption21600x900-1790081570149.jpg?mode=crop&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80",
    summary: "The bootstrapped startup scales digital P&Ls and ecommerce fulfillment across leading consumer brands.",
    content: [
      "Nuvr is proving that capital efficiency and operational rigor trump venture-fueled burn.",
      "The startup manages the complete digital P&L for FMCG leaders including Medimix, Nilon's, and Origami, ensuring profitability across Amazon, Flipkart, and quick-commerce channels.",
      "Their proprietary inventory forecasting software prevents costly stockouts and slashes marketplace deductions."
    ]
  },
  {
    id: "founder-2",
    title: "Silence Laboratories is building privacy-first cybersecurity technology",
    subtitle: "Operating out of Palo Alto and Bengaluru, the startup works with around 35 clients globally, including top US financial institutions.",
    categoryLabel: "Founder First",
    category: "founder-first",
    readTime: "7 min read",
    publishedAt: "2 days ago",
    author: {
      name: "Siddharth Pai",
      title: "Deep Tech Desk",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/2/94a03c40169611f0b4b0c5b62b4900c2/SilenceLaboratories1600x900-1790056478448.jpg?mode=crop&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    summary: "Decentralized multi-party computation secures institutional crypto and fintech assets globally.",
    content: [
      "Silence Laboratories eliminates single points of failure in private key custody.",
      "By mathematically splitting authorization across independent nodes, transactions are signed without any single server reconstructing the full secret.",
      "The team works with leading fintechs and global commercial banks across North America and Asia."
    ]
  },
  {
    id: "founder-3",
    title: "Quantum World Ventures looks to move the technology beyond the lab",
    subtitle: "The Bengaluru-based startup is developing quantum and AI applications for medical technology while exploring security applications.",
    categoryLabel: "Founder First",
    category: "founder-first",
    readTime: "6 min read",
    publishedAt: "3 days ago",
    author: {
      name: "Kaveri Chandrashekar",
      title: "Quantum & Deep Tech",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/2/d99b1110116911ed9e63f54395117598/QuantumWorldVentures-1790846247146.png?mode=fit&crop=faces&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
    summary: "Pioneering real-world quantum algorithms for early molecular simulation and healthcare diagnostics.",
    content: [
      "Quantum computing is transitioning from academic whiteboards into practical enterprise testbeds.",
      "Quantum World Ventures is building quantum algorithms for early molecular simulation and healthcare diagnostics.",
      "The founders are pioneering quantum education programs to train the next generation of Indian hardware and algorithmic physicists."
    ]
  }
];

export const JUST_IN_STORIES = [
  // Page 1 (Exact stories from user screenshot)
  {
    id: "just-in-1",
    title: "Freshworks Co-Founder Girish Mathrubootham turns film producer for Tamil sports drama 'Sarpatta Parambarai 2'",
    brand: "EnterpriseStory",
    hasVideo: true,
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "ENTERTAINMENT",
    topic: "Startups",
    formattedDate: "9/29/2026",
    publishedAt: "2 hours ago",
    readTime: "4 min read",
    author: {
      name: "Team YS",
      title: "Cinema & Culture",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    summary: "Freshworks co-founder and SaaS pioneer Girish Mathrubootham ventures into film financing as co-producer for Pa Ranjith's highly anticipated period boxing drama sequel.",
    content: [
      "In an unexpected crossover between technology entrepreneurship and Indian regional cinema, Freshworks co-founder Girish Mathrubootham has officially boarded 'Sarpatta Parambarai 2' as co-producer.",
      "The sequel to director Pa Ranjith's critically acclaimed 2021 boxing drama is slated to go on floors later this year, with actor Arya reprising his lead role as Kabilan.",
      "Mathrubootham remarked that supporting regional storytelling with authentic local grit has always been a passion outside of scaling global software enterprises from Chennai."
    ]
  },
  {
    id: "just-in-2",
    title: "Restrictions on social media for under-18? SC asks Centre to examine statutory safeguards for minors",
    brand: "YourStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "NEWS",
    topic: "Startups",
    formattedDate: "9/29/2026",
    publishedAt: "3 hours ago",
    readTime: "4 min read",
    author: {
      name: "Sujata Sangwan",
      title: "Supreme Court & Tech Policy",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    summary: "The Supreme Court directs Union ministries to formulate institutional guidelines preventing algorithmic addiction and behavioral harm among adolescents.",
    content: [
      "The Supreme Court of India has instructed the Union Ministry of Electronics and Information Technology (MeitY) to examine statutory age verifications and screen-time restrictions for users under 18.",
      "The bench underscored rising neurological and mental health concerns stemming from dark pattern algorithms and infinite scrolling feeds on major video-sharing platforms.",
      "Tech industry representatives have urged consultative frameworks that balance child protection with access to legitimate educational internet resources."
    ]
  },
  {
    id: "just-in-3",
    title: "CoinSwitch turns profitable in FY26 on adjusted EBITDA as revenue jumps 150%",
    brand: "DecryptingStory",
    hasVideo: true,
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "CRYPTOCURRENCY",
    topic: "Fintech",
    formattedDate: "9/29/2026",
    publishedAt: "4 hours ago",
    readTime: "5 min read",
    author: {
      name: "Sayan Sen",
      title: "Digital Assets",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80",
    summary: "Crypto exchange platform CoinSwitch posts positive operating cash flow and a 150% surge in annualized gross turnover following diversification into mutual funds and fixed deposits.",
    content: [
      "India's largest crypto asset aggregator CoinSwitch has reported operational profitability on an adjusted EBITDA basis for fiscal year 2026.",
      "Co-founders Ashish Singhal, Govind Soni, and Vimal Sagar Tiwari highlighted that disciplined overhead rationalization coupled with multi-asset expansion into equities and sovereign bonds drove the turnaround.",
      "The platform now boasts over 20 million registered users, with non-crypto retail wealth products accounting for nearly 30% of monthly platform activity."
    ]
  },

  {
    id: "just-in-4",
    title: "IIM Kozhikode partners with Walmart Global Tech to nurture Indian deeptech startups",
    brand: "Kannada",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "NEWS",
    topic: "DeepTech",
    formattedDate: "9/29/2026",
    publishedAt: "5 hours ago",
    readTime: "4 min read",
    author: {
      name: "Sayan Sen",
      title: "Higher Ed & Tech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    summary: "A premier academic incubator and global retail tech giant roll out equity-free innovation grants and executive mentorship for AI and supply chain pioneers.",
    content: [
      "The Indian Institute of Management Kozhikode (IIMK) through its Laboratory for Innovation, Venturing and Entrepreneurship (LIVE) has inked an alliance with Walmart Global Tech.",
      "The multi-year acceleration cohort will provide equity-free grant financing, compute credits, and direct enterprise pilots for early-stage B2B supply chain innovators.",
      "Selected startups will work alongside Walmart's Bengaluru engineering teams to stress-test automated inventory intelligence and edge predictive algorithms."
    ]
  },
  {
    id: "just-in-5",
    title: "Bharat Housing Network secures $5M from Symbiotics",
    brand: "SocialStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "FUNDING",
    topic: "Funding",
    formattedDate: "9/29/2026",
    publishedAt: "6 hours ago",
    readTime: "3 min read",
    author: {
      name: "Thimmaya Poojary",
      title: "Affordable Housing & Debt",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=80",
    summary: "Affordable housing infrastructure enabler Bharat Housing Network raises fresh external debt to disburse small-ticket loans across tier-3 and tier-4 regions.",
    content: [
      "Bharat Housing Network has secured $5 million in structured credit financing from Swiss impact asset manager Symbiotics Investments.",
      "The platform coordinates capital between mainstream institutional financiers and localized housing finance companies serving informal-income borrowers.",
      "The funds will bolster mortgage penetration for self-employed micro-entrepreneurs in semi-urban India constructing first-time residential dwellings."
    ]
  },
  {
    id: "just-in-6",
    title: "India faces 53-60% talent gap in GenAI, cloud skills: TeamLease",
    brand: "AI Story",
    hasVideo: true,
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "STARTUPS",
    topic: "Startups",
    formattedDate: "9/29/2026",
    publishedAt: "7 hours ago",
    readTime: "4 min read",
    author: {
      name: "Team YS",
      title: "Workforce Analytics",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    summary: "Industry staffing benchmark reports widening deficit between enterprise demand for LLM orchestration engineers and domestic engineering graduates.",
    content: [
      "A comprehensive talent survey by TeamLease Digital indicates that Indian IT services and enterprise GCCs are grappling with a 53% to 60% shortage of qualified GenAI engineers.",
      "While over 1.5 million engineering students graduate annually, fewer than 8% possess hands-on familiarity with transformer architectures, vector embeddings, and RAG pipelines.",
      "Corporate training academies are accelerating internal upskilling programs to prevent wage inflation and fill over 80,000 vacant specialist roles."
    ]
  },
  {
    id: "just-in-7",
    title: "Adani Family Office backs Nudge as startup pivots to rewards-led credit ecosystem",
    brand: "HerStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "FUNDING",
    topic: "Funding",
    formattedDate: "9/29/2026",
    publishedAt: "8 hours ago",
    readTime: "4 min read",
    author: {
      name: "Trisha Medhi",
      title: "Private Capital",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    summary: "Meet Shah's consumer fintech venture secures strategic capital to build a seamless lifestyle loyalty reward program for next-gen cardholders.",
    content: [
      "In a notable institutional vote of confidence, the Adani Family Office has invested in consumer rewards startup Nudge as part of its pre-Series A syndicate.",
      "Founder Meet Shah stated that the platform is revamping loyalty economics by allowing consumers to consolidate disparate merchant points into real-time portfolio credits.",
      "The capital injection will finance co-branded credit card rollouts with leading private sector banks across Mumbai, Delhi NCR, and Bengaluru."
    ]
  },
  {
    id: "just-in-8",
    title: "Startup news and updates: daily roundup (September 29, 2026)",
    brand: "YSWeekender",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "NEWS",
    topic: "Startups",
    formattedDate: "9/29/2026",
    publishedAt: "9 hours ago",
    readTime: "5 min read",
    author: {
      name: "Team YS",
      title: "Daily Wire",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
    summary: "Your daily recap of early-stage funding rounds, leadership reshuffles, policy updates, and executive appointments shaping India's venture landscape.",
    content: [
      "The Indian startup ecosystem recorded 11 funding deals totaling $42 million today, headlined by seed-stage deeptech and fintech debt rounds.",
      "Meanwhile, SEBI issued consultative clarifications regarding employee stock ownership plans (ESOPs) and secondary liquidity windows for pre-IPO unicorns.",
      "Leading venture partners expressed optimism regarding late-stage valuation stabilization as domestic institutional inflows hit quarterly highs."
    ]
  },

  // Page 2 (Stories 9 to 16)
  {
    id: "just-in-9",
    title: "Women entrepreneurs lead record 28% of early-stage venture rounds in tier-2 India",
    brand: "HerStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "STORIES",
    topic: "Startups",
    formattedDate: "9/29/2026",
    publishedAt: "10 hours ago",
    readTime: "5 min read",
    author: {
      name: "Trisha Medhi",
      title: "HerStory Bureau",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    summary: "Female-founded enterprises across Jaipur, Kochi, and Chandigarh command accelerated angel checks in D2C healthcare and climate tech.",
    content: [
      "Indian female founders are capturing an unprecedented share of early-stage institutional venture financing across tier-2 urban corridors.",
      "According to recent market data, over 28% of institutional seed syndicates closed this quarter featured solo women founders or female co-founders.",
      "Venture partners attribute the expansion to specialized mentorship cohorts and tailored angel networks fostering grassroots innovation."
    ]
  },
  {
    id: "just-in-10",
    title: "Ola Electric approves Rs 1,500 Cr rights issue to fund Gigafactory expansion",
    brand: "AutoStory",
    hasVideo: true,
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "EV & MOBILITY",
    topic: "EV & Mobility",
    formattedDate: "9/29/2026",
    publishedAt: "11 hours ago",
    readTime: "5 min read",
    author: {
      name: "Sujata Sangwan",
      title: "Public Markets & EV",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },

    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80",
    summary: "Bhavish Aggarwal backs Ola Electric's Rs 1,500 crore capital enhancement plan by committing personal equity pledges to anchor domestic expansion.",
    content: [
      "Ola Electric founder and chief executive Bhavish Aggarwal has led board approval for a Rs 1,500 crore rights issue to accelerate cell manufacturing at its Tamil Nadu Gigafactory.",
      "The expansion aims to scale domestic 4680 lithium-ion cell production and cut reliance on battery imports ahead of volume vehicle deliveries.",
      "Market analysts note the rights issue provides vital working capital cushion as electric two-wheeler market penetration crosses 8% nationally."
    ]
  },
  {
    id: "just-in-11",
    title: "Agnikul Cosmos prepares sub-orbital rocket mission following launchpad validation",
    brand: "AI Story",
    hasVideo: true,
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "DEEPTECH",
    topic: "DeepTech",
    formattedDate: "9/29/2026",
    publishedAt: "12 hours ago",
    readTime: "6 min read",
    author: {
      name: "Team YS",
      title: "Aerospace & Defence",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1517976487588-f32a76f2334f?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    summary: "The Chennai spacetech pioneer achieves 100% mission burn duration on its 3D-printed rocket propulsion stages.",
    content: [
      "Spacetech pioneer Agnikul Cosmos has cleared long-duration hot-fire testing for its semi-cryogenic rocket upper stage.",
      "Engineered through industrial additive manufacturing in a single print run, the engine performed within tight nominal pressure parameters across 180 seconds of full thrust.",
      "The milestone clears the path for the startup's planned orbital launch missions for commercial micro-satellites."
    ]
  },
  {
    id: "just-in-12",
    title: "Swiggy updates DRHP with fresh financials ahead of landmark public market debut",
    brand: "YourStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "STARTUPS",
    topic: "Startups",
    formattedDate: "9/29/2026",
    publishedAt: "13 hours ago",
    readTime: "5 min read",
    author: {
      name: "Sujata Sangwan",
      title: "IPO & Markets",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
    summary: "Updated financials reveal robust contribution margins in food delivery and accelerated dark store density for quick commerce Instamart.",
    content: [
      "Consumer internet leader Swiggy submitted an updated Draft Red Herring Prospectus to SEBI, indicating significant profitability improvements across its core food delivery division.",
      "Instamart recorded sharp quarterly volume growth, adding over 150 dark fulfillment stores in tier-1 metro clusters.",
      "Institutional investors are keenly evaluating secondary sale components and anchor allocations for the impending multi-billion dollar public offering."
    ]
  },
  {
    id: "just-in-13",
    title: "Zomato launches 'District' app for dining, movie tickets, and live event bookings",
    brand: "YS Life",
    hasVideo: true,
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "NEWS",
    topic: "Startups",
    formattedDate: "9/29/2026",
    publishedAt: "14 hours ago",
    readTime: "4 min read",
    author: {
      name: "Team YS",
      title: "Consumer Tech",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    summary: "Dedicated going-out super app combines restaurant table reservations, concert passes, and entertainment ticketing into a standalone consumer portal.",
    content: [
      "Food tech giant Zomato has officially debuted 'District', a specialized standalone application consolidating out-of-home leisure experiences.",
      "The app bridges dining out reservations with live music events, comedy shows, and multiplex movie ticketing, directly competing with incumbent entertainment portals.",
      "Founder Deepinder Goyal noted that out-of-home lifestyle experiences represent an underpenetrated multi-billion dollar opportunity across urban India."
    ]
  },
  {
    id: "just-in-14",
    title: "Pine Labs secures RBI approval to operate as payment aggregator in India",
    brand: "EnterpriseStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "FINTECH",
    topic: "Fintech",
    formattedDate: "9/29/2026",
    publishedAt: "15 hours ago",
    readTime: "4 min read",
    author: {
      name: "Thimmaya Poojary",
      title: "Regulatory Intelligence",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    summary: "The merchant commerce titan strengthens online omnichannel checkout solutions under formal Reserve Bank regulatory oversight.",
    content: [
      "Pine Labs has received coveted in-principle authorization from the Reserve Bank of India to operate as a full-stack online payment aggregator.",
      "The regulatory sanction validates the fintech veteran's compliance architecture, enabling direct merchant on-boarding for web and app payments.",
      "Leadership highlighted plans to integrate conversational commerce checkouts and instant digital settlements for small retailers."
    ]
  },
  {
    id: "just-in-15",
    title: "Peak XV Partners leads $25M Series A round in Fabless Semiconductor startup",
    brand: "AI Story",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "FUNDING",
    topic: "Funding",
    formattedDate: "9/29/2026",
    publishedAt: "16 hours ago",
    readTime: "5 min read",
    author: {
      name: "Sayan Sen",
      title: "Capital & Deals",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    summary: "Semiconductor innovators build ultra-low-power neural processing units designed to run large language models on edge devices.",
    content: [
      "In one of the largest early-stage semiconductor rounds of the quarter, deeptech innovator NeuroEdge has closed an $18 million Series A syndicate.",
      "The round was spearheaded by Peak XV Partners with participation from Lightspeed and prominent Silicon Valley angel syndicates.",
      "Proceeds will finance tape-out cycles for custom sub-4nm processor architectures targeting industrial IoT and smart automotive cameras."
    ]
  },
  {
    id: "just-in-16",
    title: "Zerodha Fund House surpasses Rs 5,000 Cr in AUM driven by passive index funds",
    brand: "YourStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "FINTECH",
    topic: "Fintech",
    formattedDate: "9/29/2026",
    publishedAt: "17 hours ago",
    readTime: "4 min read",
    author: {
      name: "Sayan Sen",
      title: "Wealth & Markets",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
    summary: "A joint venture between Zerodha and Smallcase achieves rapid retail asset growth purely through zero-commission, direct-to-consumer index products.",
    content: [
      "Zerodha Fund House has achieved Rs 5,000 crore in assets under management in just 14 months of launching operations.",
      "The asset management firm focuses exclusively on rule-based, passive index mutual funds and ETFs with industry-low expense ratios.",
      "Over 85% of investment inflows originated from tier-2 and tier-3 towns through mobile-first brokerage accounts."
    ]
  },

  // Page 3 (Stories 17 to 24)
  {
    id: "just-in-17",
    title: "Lenskart commissions mega manufacturing facility in Bhiwadi to expand output",
    brand: "SMBStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "STARTUPS",
    topic: "Startups",
    formattedDate: "9/28/2026",
    publishedAt: "Yesterday",
    readTime: "5 min read",
    author: {
      name: "Thimmaya Poojary",
      title: "Consumer Brands & D2C",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&auto=format&fit=crop&q=80",
    summary: "Robotic injection molding and precision German laser edging equipment double eyewear output to 50 million pairs annually.",
    content: [
      "Eyewear unicorn Lenskart has inaugurated its massive 500,000 sq ft smart manufacturing campus in Bhiwadi, Rajasthan.",
      "Equipped with automated guided vehicles and automated prescription lens cutters, the plant drastically cuts turnaround times for international deliveries.",
      "Founder Peyush Bansal stated that over 60% of output will serve exports across Southeast Asia and the Middle East."
    ]
  },
  {
    id: "just-in-18",
    title: "Groww surpasses 12 million active clients, cementing lead in mutual fund distribution",
    brand: "EnterpriseStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "FINTECH",
    topic: "Fintech",
    formattedDate: "9/28/2026",
    publishedAt: "Yesterday",
    readTime: "4 min read",
    author: {
      name: "Sujata Sangwan",
      title: "Fintech & Wealth",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    summary: "The discount brokerage hits 12 million active traders, commanding the highest market share on the National Stock Exchange.",
    content: [
      "Latest monthly data released by the National Stock Exchange shows fintech platform Groww consolidating its position as India's largest retail brokerage.",
      "With active client counts surmounting 12 million, the platform attributed its market share lead to frictionless paperless KYC and zero account maintenance charges.",
      "The company is currently preparing to expand into algorithmic trading tools and wealth management advisory services."
    ]
  },
  {
    id: "just-in-19",
    title: "Flipkart deploys 25,000 electric delivery vehicles ahead of festive sale season",
    brand: "AutoStory",
    hasVideo: true,
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "EV & MOBILITY",
    topic: "EV & Mobility",
    formattedDate: "9/28/2026",
    publishedAt: "Yesterday",
    readTime: "3 min read",
    author: {
      name: "Team YS",
      title: "E-Commerce & Supply Chain",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    summary: "Commercial EV fleet partnerships with Hero Electric and Euler Motors power zero-emission last-mile express deliveries across 200 cities.",
    content: [
      "In a major environmental sustainability push, Flipkart's hyperlocal fulfillment arm has deployed 25,000 commercial electric two-wheelers and three-wheelers.",
      "The fleet integration cuts last-mile delivery carbon emissions by thousands of tons during peak festive shopping spikes.",
      "Battery swapping stations installed across regional dark stores enable round-the-clock delivery availability without prolonged charging downtime."
    ]
  },
  {
    id: "just-in-20",
    title: "Sarvam AI launches open-source Indic LLMs tailored for Indian enterprise workflows",
    brand: "AI Story",
    hasVideo: true,
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "DEEPTECH",
    topic: "DeepTech",
    formattedDate: "9/28/2026",
    publishedAt: "Yesterday",
    readTime: "6 min read",
    author: {
      name: "Trisha Medhi",
      title: "Founder & Editor-in-Chief",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    summary: "Bespoke language models natively benchmarked across 10 official Indian languages achieve parity with leading global closed-source models.",
    content: [
      "Deeptech generative AI startup Sarvam AI has publicly released its open weights foundation model trained on high-fidelity multilingual corpora.",
      "Designed specifically for voice-first interactions and vernacular nuance, the model excels in legal summarization, banking bots, and public health advisories.",
      "Enterprise clients in banking and telecommunications are already deploying the model within private cloud VPC environments."
    ]
  },
  {
    id: "just-in-21",
    title: "KredX secures non-banking finance company licence from Reserve Bank of India",
    brand: "SMBStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "FINTECH",
    topic: "Fintech",
    formattedDate: "9/28/2026",
    publishedAt: "Yesterday",
    readTime: "4 min read",
    author: {
      name: "Thimmaya Poojary",
      title: "MSME Finance",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    summary: "Supply chain financier KredX gains direct balance-sheet lending capabilities to underwrite vendor invoices for tier-2 manufacturers.",
    content: [
      "Invoice discounting and enterprise working capital platform KredX has been granted a NBFC license from the Reserve Bank of India.",
      "The certification permits the company to co-lend and underwrite customized cash flow credit directly to MSME suppliers.",
      "CEO Manish Kumar emphasized that the regulatory milestone will unlock over Rs 2,500 crore in seasonal working capital for export vendors."
    ]
  },
  {
    id: "just-in-22",
    title: "Urban Company turns cash flow positive with strong home repair salon demand",
    brand: "HerStory",
    hasVideo: true,
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "STARTUPS",
    topic: "Startups",
    formattedDate: "9/28/2026",
    publishedAt: "Yesterday",
    readTime: "5 min read",
    author: {
      name: "Trisha Medhi",
      title: "Consumer Tech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
    summary: "Operational discipline, international salon expansion in UAE and Singapore, and Native water purifier sales push gig services leader into net cash generation.",
    content: [
      "On-demand home services major Urban Company has achieved sustained net cash flow positivity across consecutive financial quarters.",
      "The turnaround was fueled by higher repeat customer frequency in urban salon treatments and margin expansion from its proprietary Native water purifier range.",
      "The company continues to prepare for an eventual domestic public market listing with strong positive unit economics."
    ]
  },
  {
    id: "just-in-23",
    title: "Ather Energy files updated draft prospectus for Rs 4,500 Cr IPO",
    brand: "AutoStory",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "EV & MOBILITY",
    topic: "EV & Mobility",
    formattedDate: "9/28/2026",
    publishedAt: "Yesterday",
    readTime: "4 min read",
    author: {
      name: "Sujata Sangwan",
      title: "Automotive & Deals",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80",
    summary: "Electric scooter manufacturer Ather Energy plans primary share issuance to finance its new manufacturing hub in Maharashtra.",
    content: [
      "Bengaluru-based EV maker Ather Energy has filed updated documents with market regulator SEBI for its proposed initial public offering.",
      "The issue will comprise a fresh issue of shares worth Rs 3,100 crore alongside an offer for sale from existing early institutional backers.",
      "The fresh capital will back R&D for next-generation family electric scooters and expanding Ather Grid fast-charging locations."
    ]
  },
  {
    id: "just-in-24",
    title: "Daily tech & venture wrap: Indian startups raise $180M across 14 deals",
    brand: "YSWeekender",
    categoryLabel: "Just In",
    category: "just-in",
    categoryTag: "NEWS",
    topic: "Funding",
    formattedDate: "9/28/2026",
    publishedAt: "Yesterday",
    readTime: "4 min read",
    author: {
      name: "Team YS",
      title: "Daily Wire",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
    summary: "Growth capital rebounds as enterprise AI, clean mobility, and private credit platforms close robust institutional funding rounds.",
    content: [
      "Venture deployment across Indian startups gathered momentum today with $180 million invested in growth and early stage ventures.",
      "Venture debt and secondary deals also featured prominently as institutional allocators expressed confidence in domestic macroeconomic fundamentals.",
      "Founders highlighted disciplined runway management and clear profitability roadmaps as key factors driving term sheet execution."
    ]
  }
];


export const LEADERSHIP_LENS_STORIES = [
  {
    id: "lead-1",
    title: "Andhra, Chhattisgarh, Bihar are outsmarting richer states on investments (without outspending)",
    subtitle: "A licence, a statute and a purchase contract: how three challenger states are gaining ground without simply writing bigger subsidy cheques.",
    categoryLabel: "Leadership Lens",
    category: "leadership",
    readTime: "9 min read",
    publishedAt: "Yesterday",
    image: "https://images.yourstory.com/cs/2/1a70b4f0170611edbdd8b5d28d859895/HowAndhraChhattisgarhandBiharareoutsmartingIndiasricheststatesoninvestmentswithoutoutspending-1785988535145.jpg?mode=min&ar=2%3A1&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    summary: "How challenger states attract major industrial capital through regulatory speed and certainty.",
    content: [
      "For years, industrial capital in India flowed overwhelmingly towards established coastal hubs like Maharashtra, Gujarat, and Tamil Nadu.",
      "However, a structural shift is taking place. Andhra Pradesh, Chhattisgarh, and Bihar are securing massive renewable and manufacturing commitments through statutory single-window approvals and plug-and-play industrial infrastructure.",
      "“Capital seeks certainty and speed rather than temporary tax sops,” explains an infrastructure policy director."
    ]
  },
  {
    id: "lead-2",
    title: "Why India imports apples despite record production, and how to fix it",
    subtitle: "Cold chain fragmentation, high post-harvest transit losses, and the agronomy bottlenecks holding back Himalayan orchardists.",
    categoryLabel: "Leadership Lens",
    category: "leadership",
    readTime: "7 min read",
    publishedAt: "2 days ago",
    image: "https://images.yourstory.com/cs/2/1a70b4f0170611edbdd8b5d28d859895/4-1785305631251.jpg?mode=min&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
    summary: "Solving cold chain transit losses to help domestic Himalayan apple orchards compete.",
    content: [
      "India produces over 2.5 million metric tons of apples each season, yet imported produce from Washington, Turkey, and New Zealand commands premium supermarket shelf space.",
      "The culprit is inadequate controlled-atmosphere storage and road freight bruising during downhill transit.",
      "A new generation of agri-logistics startups is introducing farm-gate sorting, dynamic precooling chambers, and cold chain telemetry to reverse this trade imbalance."
    ]
  },
  {
    id: "lead-3",
    title: "India has cracked rocket science. Now comes the hard part: Rocket Economics",
    subtitle: "Agnikul CEO: “We Can’t Build Use-and-Throw Systems If We Want to Be a Business”",
    categoryLabel: "Leadership Lens",
    category: "leadership",
    readTime: "10 min read",
    publishedAt: "3 days ago",
    image: "https://images.yourstory.com/cs/2/1a70b4f0170611edbdd8b5d28d859895/WhatsAppImage2026-07-24at11-1784904047680.jpeg?mode=min&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1517976487588-f32a76f2334f?w=800&auto=format&fit=crop&q=80",
    summary: "Spacetech enters the commercial era where turnaround cadence and reusability dictate survival.",
    content: [
      "Proving that a single-piece 3D-printed rocket engine works in flight is a tremendous engineering milestone.",
      "Now, the ruthless laws of commercial aviation are taking over. To generate sustainable returns for institutional investors, launch providers must achieve rapid turnarounds.",
      "Agnikul's leadership discusses their semi-cryogenic propulsion economics, mobile pad architectures, and why reusability is existential for commercial spacetech."
    ]
  },
  {
    id: "lead-4",
    title: "The $2 Million Startup Building an Operating System for India's Apple Industry",
    subtitle: "Agritech pioneers deploy spectral imaging and AI grading to modernize fruit sorting across Kashmir and Himachal orchards.",
    categoryLabel: "Leadership Lens",
    category: "leadership",
    readTime: "6 min read",
    publishedAt: "4 days ago",
    image: "https://images.yourstory.com/cs/2/1a70b4f0170611edbdd8b5d28d859895/WhatsAppImage2026-07-31at13-1785484402772.jpeg?mode=min&ar=1%3A1&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&auto=format&fit=crop&q=80",
    summary: "Computer vision grading booths eliminate middlemen and boost orchard farm-gate margins.",
    content: [
      "Instead of subjective manual inspection where growers frequently suffer arbitrary grade discounts at wholesale mandis, new spectral imaging sensors measure sugar brix and internal firmness non-invasively.",
      "Growers receive instant algorithmic quality certification and digital payments on their phones, unlocking fair prices from organized retail buyers."
    ]
  },
  {
    id: "lead-5",
    title: "His software is inside your router. Now he wants it inside much smaller things",
    subtitle: "How Chennai deep tech firm embedUR Systems went from powering enterprise Wi-Fi to edge IoT and AI micro-controllers.",
    categoryLabel: "Leadership Lens",
    category: "leadership",
    readTime: "8 min read",
    publishedAt: "5 days ago",
    image: "https://images.yourstory.com/cs/2/11718bd02d6d11e9aa979329348d4c3e/EmbedURSystemsV21600x900-1789975019215.jpg?mode=fill&ar=16%3A9&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    summary: "Bootstrapped software pioneer scales from enterprise Wi-Fi routers into embedded edge AI chips.",
    content: [
      "Chances are high that the wireless router providing your internet connection runs firmware written by embedUR Systems.",
      "Founder Rajesh C. built a global embedded software powerhouse from Chennai with zero venture capital, serving Tier-1 telecom providers.",
      "Now, the company is compressing deep neural networks onto microscopic IoT silicon to enable smart home intelligence without round-trip cloud latency."
    ]
  }
];

export const AI_STORIES = [
  {
    id: "ai-1",
    title: "Trump calls for artificial intelligence to be renamed 'super intelligence' in the US",
    subtitle: "Speaking at an international tech forum, the former president advocated elevating generative AI benchmarks into federal strategic dominance policy.",
    brand: "AI Story",
    categoryLabel: "AI Story",
    category: "ai-story",
    categoryTag: "POLICY & TECH",
    subTopic: "Generative AI",
    formattedDate: "10/02/2026",
    publishedAt: "3 hours ago",
    readTime: "4 min read",
    author: {
      name: "Nucleus_AI Desk",
      title: "Global Intelligence",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.yourstory.com/cs/4/8e7cc4102d6c11e9aa979329348d4c3e/Screenshot2026-10-02at1-1790926676701.png?ar=16%3A9&mode=crop&crop=faces&format=auto&w=1200&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    summary: "During remarks addressing global semiconductor leadership and quantum compute, discussions centered around classifying foundational frontier models under sovereign defense frameworks.",
    content: [
      "In remarks delivered before tech industry executives, Donald Trump proposed rebranding standard artificial intelligence to 'super intelligence', arguing that contemporary multi-modal reasoning systems have surpassed historical machine learning definitions.",
      "The speech underscored ongoing geopolitical debates regarding algorithmic sovereignty, export controls on high-bandwidth memory chips, and federal funding allocations for national compute clusters.",
      "Venture analysts noted that while semantic branding may shift, enterprise focus remains laser-focused on model reliability, inference costs, and real-world deployment efficiency."
    ]
  },
  {
    id: "ai-2",
    title: "Sarvam AI launches open-source Indic LLMs tailored for Indian enterprise workflows",
    subtitle: "Bespoke 2B and 7B parameter models trained natively on 10 official Indian languages achieve breakthrough accuracy in legal summarization and voice bots.",
    brand: "AI Story",
    categoryLabel: "AI Story",
    category: "ai-story",
    categoryTag: "LLMS & MODELS",
    subTopic: "LLMs & Models",
    formattedDate: "10/01/2026",
    publishedAt: "6 hours ago",
    readTime: "5 min read",
    author: {
      name: "Team YS",
      title: "DeepTech Bureau",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    summary: "Deeptech pioneer Sarvam AI releases open weights models optimized for cost-effective local inference on enterprise CPU and consumer GPU clusters.",
    content: [
      "Bengaluru-based deep tech venture Sarvam AI has publicly released its flagship family of foundational models engineered specifically for Indian vernacular nuance and multi-modal audio pipelines.",
      "Trained on high-fidelity localized datasets spanning Hindi, Tamil, Telugu, Kannada, Bengali, and Marathi, the models outperform mainstream global architectures on regional dialect translation benchmarks.",
      "Co-founders Vivek Raghavan and Pratyush Kumar noted that democratizing open-source model weights is critical for Indian banks, healthcare providers, and regional governments to operate without data sovereignty risks."
    ]
  },
  {
    id: "ai-3",
    title: "India faces 53-60% talent gap in GenAI, cloud skills: TeamLease report",
    subtitle: "Widening deficit between soaring corporate demand for LLM orchestration engineers and domestic engineering graduate readiness threatens deployment timelines.",
    brand: "AI Story",
    categoryLabel: "AI Story",
    category: "ai-story",
    categoryTag: "TALENT & WORKFORCE",
    subTopic: "Enterprise AI",
    formattedDate: "9/30/2026",
    publishedAt: "1 day ago",
    readTime: "4 min read",
    author: {
      name: "Sujata Sangwan",
      title: "Workforce & Tech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    summary: "While Indian IT service firms sign multi-million dollar GenAI transformation contracts, acute shortages of senior prompt architects and RAG engineers challenge execution.",
    content: [
      "A comprehensive industry report released by TeamLease Digital indicates that domestic enterprise GCCs and system integrators face a 53% to 60% shortage of qualified GenAI engineers.",
      "Despite producing over 1.5 million annual engineering graduates, fewer than 8% demonstrate proficiency with vector databases, embedding tokenization, and multi-agent frameworks like LangGraph.",
      "Corporate training academies are pivoting to internal upskilling bootcamps and university partnerships to close the vacancy backlog of over 85,000 specialist positions."
    ]
  },
  {
    id: "ai-4",
    title: "Peak XV Partners leads $25M Series A round in Fabless Semiconductor startup NeuroEdge",
    subtitle: "Custom sub-4nm processor architectures bring trillion-parameter neural network inference directly to smart edge sensors and industrial robotics.",
    brand: "AI Story",
    categoryLabel: "AI Story",
    category: "ai-story",
    categoryTag: "CHIPS & HARDWARE",
    subTopic: "AI Chips & Compute",
    formattedDate: "9/29/2026",
    publishedAt: "2 days ago",
    readTime: "5 min read",
    author: {
      name: "Sayan Sen",
      title: "Semiconductors & DeepTech",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    summary: "Fabless silicon innovator NeuroEdge secures growth equity to finance test tape-outs and sample silicon deliveries for autonomous vehicle cameras.",
    content: [
      "Deeptech fabless designer NeuroEdge has closed a $25 million Series A round spearheaded by Peak XV Partners with participation from Lightspeed India and prominent Silicon Valley angels.",
      "The startup has engineered an ultra-low-power neural processing unit capable of running local transformer inference with 90% less thermal dissipation than standard x86 and GPU accelerators.",
      "Commercial pilots are underway with global Tier-1 automotive manufacturers and aerospace drone developers."
    ]
  },
  {
    id: "ai-5",
    title: "Cynlr raises $10M to give industrial robotic arms human-like vision and tactile intuition",
    subtitle: "Bengaluru deeptech company builds neuro-morphic visual intelligence that allows robotic manipulators to pick unoriented objects without CAD model pre-training.",
    brand: "AI Story",
    categoryLabel: "AI Story",
    category: "ai-story",
    categoryTag: "ROBOTICS",
    subTopic: "Robotics & Automation",
    formattedDate: "9/28/2026",
    publishedAt: "3 days ago",
    readTime: "5 min read",
    author: {
      name: "Team YS",
      title: "Robotics Bureau",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    summary: "Robotics pioneer eliminates expensive custom mechanical fixtures by equipping multi-axis arms with real-time visual-spatial reasoning.",
    content: [
      "Industrial automation firm Cynlr has raised $10 million in fresh capital from institutional tech syndicates to scale its visual-cognition stack.",
      "Traditional factory robots require rigid feeding lines where parts must arrive in mathematically predefined orientations. Cynlr's camera and neural perception engine mimic human stereoscopic hand-eye coordination.",
      "The technology is already deployed across high-precision electronic assembly lines and automotive manufacturing hubs in Germany and Japan."
    ]
  },
  {
    id: "ai-6",
    title: "How Krutrim is scaling sovereign AI clusters with customized 10,000 GPU data centers",
    subtitle: "Bhavish Aggarwal's AI venture rolls out cloud compute reservations for Indian startups, slashing API token costs by 40% compared to Western hyperscalers.",
    brand: "AI Story",
    categoryLabel: "AI Story",
    category: "ai-story",
    categoryTag: "SOVEREIGN AI",
    subTopic: "AI Chips & Compute",
    formattedDate: "9/27/2026",
    publishedAt: "4 days ago",
    readTime: "6 min read",
    author: {
      name: "Thimmaya Poojary",
      title: "Cloud Infrastructure",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    summary: "India's first AI unicorn unveils end-to-end cloud platform featuring silicon acceleration, native Indic fine-tuning, and green solar-powered data centers.",
    content: [
      "Krutrim AI has begun provisioning enterprise access to its newly inaugurated hyperscale compute facility in Tamil Nadu, powered by over 10,000 high-performance AI accelerator chips.",
      "The company positions its platform as a cost-efficient sovereign alternative to Amazon Web Services and Microsoft Azure for domestic generative AI startups.",
      "Over 250 enterprise clients in fintech, logistics, and healthcare have transitioned baseline workloads to the Krutrim cloud stack."
    ]
  },
  {
    id: "ai-7",
    title: "From demo to deployment: Indian CIOs shift focus to RAG pipelines and on-prem inference",
    subtitle: "Enterprise survey of 120 tech leaders reveals that 78% have moved past exploratory proof-of-concepts to productionize domain-specific AI workflows.",
    brand: "AI Story",
    categoryLabel: "AI Story",
    category: "ai-story",
    categoryTag: "ENTERPRISE TECH",
    subTopic: "Enterprise AI",
    formattedDate: "9/26/2026",
    publishedAt: "5 days ago",
    readTime: "5 min read",
    author: {
      name: "Trisha Medhi",
      title: "Enterprise AI",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    summary: "Chief Information Officers prioritize retrieval-augmented generation to safeguard intellectual property while automating customer operations.",
    content: [
      "The initial phase of uncurated public chatbot experimentation has given way to disciplined corporate deployment across India's largest banking and telecommunications enterprises.",
      "CIOs report that retrieval-augmented generation (RAG) connected to internal knowledge bases provides hallucination-free output with clear audit trails.",
      "Budgets are increasingly allocated toward local inference hardware and specialized vector storage rather than open-ended API credit pools."
    ]
  },
  {
    id: "ai-8",
    title: "Swiggy deploys GenAI search and conversational ordering across 500+ Indian cities",
    subtitle: "Natural language menu querying allows users to search by dietary mood, calorie constraints, and regional recipes with instant multi-store fulfillment.",
    brand: "AI Story",
    categoryLabel: "AI Story",
    category: "ai-story",
    categoryTag: "CONSUMER AI",
    subTopic: "Generative AI",
    formattedDate: "9/25/2026",
    publishedAt: "6 days ago",
    readTime: "4 min read",
    author: {
      name: "Sujata Sangwan",
      title: "Consumer Tech",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
    },
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&auto=format&fit=crop&q=80",
    fallbackImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80",
    summary: "Hyperlocal commerce titan leverages fine-tuned semantic embeddings to boost conversion rates and discoverability for independent cloud kitchens.",
    content: [
      "Food and grocery delivery giant Swiggy has rolled out a suite of generative AI search experiences across its consumer mobile application.",
      "Users can input colloquial queries such as 'healthy protein post-workout lunch without dairy under 400 calories' and receive optimized restaurant recommendations instantly.",
      "The machine learning infrastructure processes millions of real-time inventory signals and rider telemetry points to predict preparation and transit accuracy."
    ]
  }
];

// Combine all stories into master collection for search and category filtering
export const ALL_STORIES = [
  LEAD_STORY,
  ...TOP_PICKS,
  ...CAPTABLE_STORIES,
  ...SPOTLIGHT_STORIES,
  ...FOUNDER_FIRST_STORIES,
  ...JUST_IN_STORIES,
  ...LEADERSHIP_LENS_STORIES,
  ...AI_STORIES
];

