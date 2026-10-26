// Dataset for the EnterpriseStory Brand Page
// Faithfully matches the exact layout, headlines, and sections from EnterpriseStory on YourStory

export const ENTERPRISE_SUB_NAV = [
  { id: 'all', label: 'All' },
  { id: 'premium-post', label: 'Premium Post', hasDropdown: true },
  { id: 'leaders', label: 'Leaders', hasDropdown: true },
  { id: 'trends', label: 'Trends', hasDropdown: true },
  { id: 'ystv', label: 'YSTV', hasDropdown: true },
  { id: 'websparks', label: 'WebSparks', hasDropdown: false },
  { id: 'newsletters', label: 'Newsletters', hasDropdown: true },
  { id: 'reports', label: 'Reports', hasDropdown: true }
];

export const ENTERPRISE_LEAD_STORY = {
  id: 'pharma-ai-karan-dhaudia',
  tag: 'LEAD STORY',
  categoryTag: 'Enterprise AI',
  category: 'enterprise',
  brand: 'EnterpriseStory',
  title: "Pharma's real AI challenge is embedding it into day-to-day operations: Karan Dhaudia",
  subtitle: "Karan Dhaudia, Principal at Kearney, on how pharma companies are embedding AI into day-to-day operations, moving from pilots to building competitive moats, and the key challenges along the way.",
  summary: "Karan Dhaudia, Principal at Kearney, on how pharma companies are embedding AI into day-to-day operations, moving from pilots to building competitive moats, and the key challenges along the way.",
  author: {
    name: 'Karan Dhaudia',
    title: 'Principal at Kearney (via EnterpriseStory Desk)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
  },
  readTime: '4 min read',
  publishedAt: 'Feb 18, 2025',
  image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80',
  fallbackImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
  content: [
    "Artificial intelligence is no longer an experimental novelty in global biopharma. Over the past twenty-four months, nearly every top-50 life sciences multinational has launched exploratory generative AI and machine learning pilots spanning drug discovery, in-silico molecule docking, and automated medical regulatory writing.",
    "Yet according to Karan Dhaudia, Principal at global management consulting firm Kearney, the genuine inflection point for pharmaceutical enterprises lies not in launching more pilots, but in integrating AI workflows deeply into the messy, governed reality of day-to-day operations.",
    "“The primary bottleneck pharma companies face is organizational inertia compounded by strict GxP validation compliance,” Dhaudia explains. “When you operate in an industry where data lineage, clinical safety, and regulatory audits carry multi-million-dollar liabilities, you cannot simply deploy black-box foundation models. Embedding AI requires restructuring clinical trial recruitment pipelines, standardizing messy electronic lab notebooks, and upskilling scientific researchers.”",
    "Dhaudia points out that the pharma organizations building durable competitive moats are focusing on three core operational pillars: sovereign clinical data architectures, outcome-based vendor accountability, and continuous model observability. Rather than chasing generic chatbot interfaces, leading teams are deploying specialized agentic workflows that compress patent review cycles from months to days while preserving airtight audit trails."
  ]
};

export const ENTERPRISE_CONVERSATIONS = {
  sectionTitle: 'Conversations',
  sectionSubtitle: 'Exclusive interviews with CXOs and industry leaders shaping global business',
  featuredVideo: {
    id: 'c-suite-sulajja-firodia',
    series: 'C-SUITE',
    title: 'C-Suite | Sulajja Firodia Motwani, CEO - Kinetic Green',
    shortTitle: 'Sulajja Firodia Motwani, CEO - Kinetic Green',
    summary: 'In this episode of C-Suite, Sulajja Firodia Motwani, CEO of Kinetic Green Energy and Power Solutions, talks about her journey from engineering and a passion for sports to steering an electric vehicle revolution in India.',
    description: 'In this episode of C-Suite, Sulajja Firodia Motwani, CEO of Kinetic Green Energy and Power Solutions, talks about her journey from engineering and a passion for sports to steering an electric vehicle revolution in India.',
    speaker1: 'SULAJJA FIRODIA MOTWANI',
    title1: 'FOUNDER & CEO, KINETIC GREEN',
    speaker2: 'SHRADHA SHARMA',
    title2: 'FOUNDER & CEO, YOURSTORY',
    duration: '24:18',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    publishedAt: 'Recent'
  },
  playlist: [
    {
      id: 'c-suite-sulajja-firodia',
      series: 'C-SUITE',
      title: 'Sulajja Firodia Motwani, CEO - Kinetic Green',
      duration: '24m',
      speaker: 'Sulajja Firodia Motwani',
      role: 'CEO, Kinetic Green',
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      active: true
    },
    {
      id: 'c-suite-sunil-mittal',
      series: 'C-SUITE',
      title: 'A conversation with Sunil Bharti Mittal, Chairman Bharti Airtel',
      duration: '31m',
      speaker: 'Sunil Bharti Mittal',
      role: 'Chairman, Bharti Enterprises',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      active: false
    },
    {
      id: 'c-suite-girish-freshworks',
      series: 'CXO TRANSFORMATION',
      title: 'Girish Mathrubootham on Freshworks AI transformation and Nasdaq journey',
      duration: '28m',
      speaker: 'Girish Mathrubootham',
      role: 'Founder & Executive Chairman, Freshworks',
      thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      active: false
    },
    {
      id: 'c-suite-tata-motors-ev',
      series: 'LEADERSHIP SERIES',
      title: 'How Tata Motors EV division became Indias electric car powerhouse: Shailesh Chandra',
      duration: '22m',
      speaker: 'Shailesh Chandra',
      role: 'MD, Tata Motors Passenger Vehicles',
      thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      active: false
    }
  ]
};

export const ENTERPRISE_INNOVATION_SECTION = {
  sectionTitle: 'Innovation',
  sectionSubtitle: 'Key developments at the intersection of enterprise tech & AI',
  featuredStory: {
    id: 'gcc-tech-spends-deloitte',
    title: 'GCC tech spends set to grow faster next year: Deloitte-TechX report',
    tag: 'LATEST',
    categoryTag: 'Innovation',
    category: 'enterprise',
    brand: 'EnterpriseStory',
    summary: 'Global Capability Centers in India are accelerating budgets for generative AI, cloud migration, and proprietary LLM fine-tuning as multinational boards prioritize strategic tech capability over basic back-office arbitrage.',
    author: {
      name: 'ENTERPRISESTORY DESK',
      title: 'Technology & GCC Intelligence'
    },
    readTime: '4 MIN READ',
    publishedAt: 'Today',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    content: [
      "Technology expenditure across Global Capability Centers (GCCs) in India is projected to surge by 28% year-on-year, outstripping conventional enterprise IT spending, according to a benchmark research study released by Deloitte and TechX.",
      "The report highlights that multinational parent organizations are increasingly designating their Indian GCCs as the core global owners of emerging AI architectures. Rather than functioning as downstream support units, over 65% of surveyed GCCs now lead global enterprise software modernization, autonomous agent orchestration, and specialized semiconductor software design.",
      "“India's GCC footprint is witnessing a decisive structural migration toward higher-value IP generation,” noted lead industry analysts. “Budgets are shifting decisively away from legacy maintenance toward high-performance GPU cluster deployments, custom data lakes, and automated cybersecurity resilience.”"
    ]
  },
  listStories: [
    {
      id: 'health-startup-clinic-growth',
      title: 'This tech startup is empowering healthcare professionals to boost clinic growth in India',
      tag: 'LATEST',
      categoryTag: 'Innovation',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '3 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: 'Yesterday',
      summary: 'A digital clinical orchestration platform is helping over 14,000 independent outpatient doctors automate diagnostic scheduling, patient billing, and longitudinal care records.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80',
      content: [
        "A Bengaluru-based digital health infrastructure platform has raised fresh growth capital to expand its clinical SaaS tools to Tier II and Tier III healthcare networks across India.",
        "The software platform digitizes the entire lifecycle of an outpatient clinic, integrating WhatsApp-based patient communications, electronic prescription generation, and automated insurance claims processing, cutting administrative overhead by more than 40%."
      ]
    },
    {
      id: 'healthcare-ai-mental-health',
      title: 'Healthcare startups look to AI to solve capacity crisis in mental health',
      tag: 'LATEST',
      categoryTag: 'Innovation',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '3 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: 'Yesterday',
      summary: 'Pioneering healthtech founders are deploying vetted clinical AI agents to triage patient assessments and alleviate severe therapist shortages across tier-1 cities.',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80',
      content: [
        "With India facing an acute shortage of licensed psychiatrists and clinical psychologists, digital health ventures are turning to specialized, privacy-preserving conversational AI copilots to assist practitioners.",
        "The systems act as clinical scribes and triage copilots during initial intake evaluations, analyzing patient mood indicators and generating longitudinal summaries that allow therapists to double their effective patient consultation capacity."
      ]
    },
    {
      id: 'tech-mahindra-digital-transformation',
      title: 'Tech & AI to remain crucial for digital transformation journey: Tech Mahindra leadership',
      tag: 'LATEST',
      categoryTag: 'Innovation',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '4 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: '2 days ago',
      summary: 'Senior leadership at Tech Mahindra outline their multi-year enterprise transformation roadmap focusing on telecom 5G cloud networks and agentic enterprise AI.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
      content: [
        "During an exclusive executive briefing, Tech Mahindra top leadership underscored that enterprise demand for outcome-linked AI solutions is accelerating despite global macroeconomic headwinds.",
        "The IT services giant has deployed dedicated enterprise AI studios and trained over 50,000 engineers in agentic workflows, enabling corporate clients to automate complex customer care, enterprise supply chains, and network traffic orchestration."
      ]
    },
    {
      id: 'immunity-graying-energy-deficiency',
      title: 'Immunity is graying; how our energy deficiency affects daily output',
      tag: 'LATEST',
      categoryTag: 'Innovation',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '3 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: '3 days ago',
      summary: 'An investigative corporate wellness dispatch exploring chronic fatigue, micronutrient deficits, and productivity drain among white-collar enterprise workforces.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80',
      content: [
        "A growing body of corporate occupational health studies indicates that prolonged screen fatigue, irregular nutrition, and chronic stress are causing measurable cellular energy deficits across modern knowledge workers.",
        "Forward-thinking enterprise HR leaders are revamping wellness benefits, shifting from token gym memberships to proactive metabolic health screenings and ergonomic schedule management."
      ]
    }
  ]
};

export const ENTERPRISE_CORPORATE_SECTION = {
  sectionTitle: 'Corporate',
  sectionSubtitle: 'Earnings, M&A, enterprise contracts, and institutional finance',
  featuredStory: {
    id: 'cognizant-european-contracts',
    title: 'Cognizant secures multi-million dollar deals with European clients',
    tag: 'CORPORATE',
    categoryTag: 'Corporate',
    category: 'enterprise',
    brand: 'EnterpriseStory',
    summary: 'Cognizant has inked multiple long-term technology contracts across the UK, Germany, and the Nordics to deliver core cloud transformation, modern data architecture, and managed enterprise AI workflows.',
    author: {
      name: 'ENTERPRISESTORY DESK',
      title: 'Corporate News Desk'
    },
    readTime: '4 MIN READ',
    publishedAt: 'Today',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    content: [
      "Nasdaq-listed IT and digital solutions leader Cognizant has announced a string of major enterprise customer wins across Western Europe, cementing its strategic push into financial services, automotive manufacturing, and clean energy utilities.",
      "The multi-year contracts encompass core infrastructure modernization, migrating legacy on-premise mainframe environments to hybrid cloud architectures, and deploying custom AI copilots to automate complex multi-lingual customer service inquiries.",
      "Cognizant's European leadership noted that corporate boards are demanding verifiable efficiency gains within six months of deployment, favoring partners capable of delivering turnkey agentic architectures."
    ]
  },
  listStories: [
    {
      id: 'stripe-cross-border-india',
      title: 'Fintech giant Stripe launches in India with focus on cross-border payments',
      tag: 'LATEST',
      categoryTag: 'Corporate',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '4 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: 'Yesterday',
      summary: 'Global payments titan Stripe expands localized processing support for Indian SaaS exporters, enabling effortless billing across 135+ currencies.',
      image: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=400&auto=format&fit=crop&q=80',
      content: [
        "Financial infrastructure giant Stripe has initiated its next phase of expansion in the Indian subcontinent, specifically targeting fast-scaling B2B SaaS startups, freelance exporters, and direct-to-consumer cross-border brands.",
        "The roll-out offers streamlined foreign inward remittance compliance (FIRC) automation and support for international recurring subscription billing, removing traditional friction points for Indian founders selling software globally."
      ]
    },
    {
      id: 'pine-labs-revenue-jump-losses',
      title: 'Pine Labs revenue jumps 37% to Rs 1,737 Cr; losses widen to Rs 322 Cr',
      tag: 'LATEST',
      categoryTag: 'Corporate',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '3 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: 'Yesterday',
      summary: 'Merchant commerce unicorn Pine Labs recorded strong top-line momentum propelled by POS terminal fleet expansion and regional Southeast Asian acquisitions.',
      image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&auto=format&fit=crop&q=80',
      content: [
        "Leading merchant commerce omnichannel platform Pine Labs reported a 37% surge in consolidated operational revenue for the fiscal year, touching ₹1,737 Crore.",
        "The company expanded its smart Android POS terminal footprint across retail chains, pharmacies, and hospitality brands while accelerating investments in its Qfix issuing software and international operations."
      ]
    },
    {
      id: 'wipro-us-digital-transformation-deal',
      title: 'Wipro bags multi-year digital transformation deal from US client',
      tag: 'LATEST',
      categoryTag: 'Corporate',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '4 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: '2 days ago',
      summary: 'Wipro has secured an expansive multi-year digital engineering mandate to overhaul legacy core systems for a leading North American retail and logistics network.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80',
      content: [
        "Indian IT major Wipro has sealed a high-value multi-year contract with a premier US corporate enterprise to re-architect its nationwide supply chain management systems.",
        "Wipro will deploy its FullStride Cloud suite and proprietary agentic automation frameworks to optimize inventory forecasting, reduce shipping latency, and bolster enterprise data security."
      ]
    },
    {
      id: 'tata-motors-q4-profit-surge',
      title: 'Tata Motors Q4 net profit surges 218% to Rs 3,145 Cr',
      tag: 'FINANCIAL RESULTS',
      categoryTag: 'Corporate',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '3 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: '3 days ago',
      summary: 'Robust Jaguar Land Rover profitability, lower input costs, and electric vehicle market leadership power bumper quarterly earnings for Tata Motors.',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80',
      content: [
        "Tata Motors posted a stellar 218% increase in consolidated net profit to ₹3,145 Crore for the fourth quarter, comprehensively outperforming consensus financial projections.",
        "The turnaround was fueled by historic order backlog deliveries at Jaguar Land Rover, strong demand for premium SUVs, and surging commercial fleet deliveries across India."
      ]
    }
  ]
};

export const ENTERPRISE_GCC_SECTION = {
  sectionTitle: 'GCC',
  sectionSubtitle: 'The evolution of Global Capability Centers into strategic innovation engines',
  featuredStory: {
    id: 'how-gccs-drive-strategic-value',
    title: 'How GCCs can drive strategic value for Indian tech',
    tag: 'GCC',
    categoryTag: 'GCC',
    category: 'enterprise',
    brand: 'EnterpriseStory',
    summary: 'Global Capability Centers in India have evolved from transactional cost-arbitrage back offices to world-class innovation epicenters driving high-impact product engineering, AI deployment, and global leadership.',
    author: {
      name: 'ENTERPRISESTORY DESK',
      title: 'GCC & Leadership Analysis'
    },
    readTime: '4 MIN READ',
    publishedAt: 'Today',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    content: [
      "India's GCC sector is in the midst of a historic paradigm shift. Once perceived as back-office facilities created to capitalize on labor cost differentials, the country's 1,600+ GCCs have morphed into high-autonomy technical epicenters governing global core roadmaps.",
      "Global Fortune 500 enterprises are now looking to their Bengaluru, Hyderabad, and Pune tech centers to pioneer enterprise LLMs, cybersecurity defense layers, and cloud infrastructure.",
      "“The narrative has shifted from 'How many FTEs can we hire at lower cost?' to 'Where can we build the engineering center that invents our next-generation product line?'” explains a leading industry strategist. This evolution has fostered a vibrant ecosystem of senior executive leaders based in India who report directly to global group CEOs."
    ]
  },
  listStories: [
    {
      id: 'gcc-india-hiring-report',
      title: 'More than half of GCCs in India increased hiring in 2023: Report',
      tag: 'LATEST',
      categoryTag: 'GCC',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '3 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: 'Yesterday',
      summary: 'A comprehensive Nasscom-Zinnov industry report reveals that over 58% of Global Capability Centers expanded tech headcounts in cloud architecture, cybersecurity, and data science.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&auto=format&fit=crop&q=80',
      content: [
        "A benchmark staffing survey by Nasscom and Zinnov shows that more than 58% of GCCs in India increased their core technical headcount during the past fiscal year, defying broader global corporate hiring freezes.",
        "The demand was concentrated heavily in high-specialization disciplines including enterprise data engineering, sovereign AI research, and automated semiconductor firmware design."
      ]
    },
    {
      id: 'global-enterprise-leadership-gccs',
      title: 'Global enterprise leadership is increasingly shifting towards GCCs in India: Report',
      tag: 'LATEST',
      categoryTag: 'GCC',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '4 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: 'Yesterday',
      summary: 'Multinational corporations are actively appointing global CXOs, SVPs, and Chief Technology Officers based out of GCC centers in Bengaluru, Hyderabad, and Pune.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      content: [
        "In a marked departure from past organizational hierarchies, global conglomerates in banking, retail, and pharmaceutical sectors are stationing global product heads and enterprise CXOs inside Indian GCC hubs.",
        "Today, over 2,500 global leadership roles with worldwide budget sign-off and multi-country operational authority reside in India-based GCC centers."
      ]
    },
    {
      id: 'inside-ey-gccs-talent',
      title: 'Inside EYs GCCs in India and growing consulting talent',
      tag: 'LATEST',
      categoryTag: 'GCC',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '3 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: '2 days ago',
      summary: 'How EY Global Delivery Services scaled over 70,000 specialists across Indian centers, engineering mission-critical audit tools, tax automation, and consulting frameworks.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      content: [
        "EY Global Delivery Services (GDS) has grown into one of the largest corporate innovation networks in India, combining cutting-edge technology development with high-end strategic management consulting.",
        "The firm's Indian teams are building proprietary generative AI engines that automate audit compliance verification across thousands of corporate filings globally."
      ]
    },
    {
      id: 'karnataka-state-gcc-policy',
      title: 'Karnataka government unveil first-ever state GCC policy draft',
      tag: 'LATEST',
      categoryTag: 'GCC',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '3 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: '3 days ago',
      summary: 'Karnataka rolls out a dedicated policy framework offering anchor incentives, talent co-investment funds, and dedicated innovation corridors to attract next-gen GCC establishments.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80',
      content: [
        "In a pioneering move, the Karnataka Department of Electronics, IT, and Bt has published India's first state-level policy exclusively tailored for Global Capability Centers.",
        "The policy targets establishing 500 new GCCs by 2029, generating over 3.5 lakh high-value technical jobs through streamlined land allocation, research subsidies, and industry-academia talent pipelines."
      ]
    }
  ]
};

export const ENTERPRISE_INTERVIEW_SECTION = {
  sectionTitle: 'Interview',
  sectionSubtitle: 'In-depth dialogues with architects of corporate and technological change',
  featuredStory: {
    id: 'indian-tech-experts-uae-cloud',
    title: 'Indian tech experts help digitise UAE cloud infrastructure',
    tag: 'INTERVIEW',
    categoryTag: 'Interview',
    category: 'enterprise',
    brand: 'EnterpriseStory',
    summary: 'How Indian cloud architects and system engineers are partnering with UAE sovereign entities and private conglomerates to build state-of-the-art AI data centers and digital public infrastructure.',
    author: {
      name: 'ENTERPRISESTORY DESK',
      title: 'Global Enterprise Editor'
    },
    readTime: '5 MIN READ',
    publishedAt: 'Today',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    content: [
      "In an exclusive sit-down interview with leading enterprise architects spearheading digital transformation across the Gulf region, EnterpriseStory explored how Indian engineering acumen is powering the United Arab Emirates' rapid transformation into an AI superpower.",
      "From sovereign hyperscale data centers in Abu Dhabi to AI-automated logistics hubs at Jebel Ali Port, Indian system integrators and deep-tech startups are co-developing the foundational digital architecture.",
      "“The collaboration between Indian engineering talent and Middle Eastern strategic investment is creating a new blueprint for sovereign digital ecosystems,” remarked the executive, noting that regional public sector entities are prioritizing high-security, localized LLMs designed for Arabic and English enterprise workflows."
    ]
  },
  listStories: [
    {
      id: 'unicorns-startups-digital-transformation',
      title: 'Partnering with unicorns & startups to enable digital transformation',
      tag: 'CXO TALK',
      categoryTag: 'Interview',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '4 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: 'Yesterday',
      summary: 'Enterprise technology leaders share proven playbooks on collaborating with agile B2B startups to accelerate generative AI proofs-of-concept into production.',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop&q=80',
      content: [
        "In this CXO Roundtable discussion, corporate Chief Information Officers from top banking, telecom, and FMCG conglomerates reveal how they are breaking institutional silos by establishing structured pilot frameworks with early-stage enterprise SaaS startups."
      ]
    },
    {
      id: 'enterprise-ctos-measuring-ai-roi',
      title: 'How enterprise CTOs are measuring ROI on generative AI pilots in 2025',
      tag: 'INTERVIEW',
      categoryTag: 'Interview',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '4 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: '2 days ago',
      summary: 'A candid panel interview on replacing subjective vanity metrics with concrete unit-economics, token optimization, and employee productivity baselines.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
      content: [
        "Enterprise technology executives are moving past the initial hype cycle of generative AI to enforce rigorous return-on-investment benchmarks across corporate engineering, customer service, and legal document review workflows."
      ]
    },
    {
      id: 'scaling-cyber-defense-bengaluru',
      title: 'Scaling an enterprise cyber-defense platform from Bengaluru to global Fortune 500s',
      tag: 'FOUNDER STORY',
      categoryTag: 'Interview',
      category: 'enterprise',
      brand: 'EnterpriseStory',
      readTime: '5 MIN READ',
      author: { name: 'ENTERPRISESTORY DESK' },
      publishedAt: '3 days ago',
      summary: 'The founder of a zero-trust telemetry platform discusses going from seed funding in Koramangala to protecting mission-critical financial infrastructures worldwide.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80',
      content: [
        "From early customer proofs-of-concept in Bengaluru's startup corridor to signing multi-million dollar annual recurring contracts with tier-1 global investment banks, this founder shares lessons on enterprise sales engineering and SOC2 compliance."
      ]
    }
  ]
};

// All Enterprise Stories unified for searching, bookmarks, and reader modals
export const ALL_ENTERPRISE_STORIES = [
  ENTERPRISE_LEAD_STORY,
  ENTERPRISE_INNOVATION_SECTION.featuredStory,
  ...ENTERPRISE_INNOVATION_SECTION.listStories,
  ENTERPRISE_CORPORATE_SECTION.featuredStory,
  ...ENTERPRISE_CORPORATE_SECTION.listStories,
  ENTERPRISE_GCC_SECTION.featuredStory,
  ...ENTERPRISE_GCC_SECTION.listStories,
  ENTERPRISE_INTERVIEW_SECTION.featuredStory,
  ...ENTERPRISE_INTERVIEW_SECTION.listStories
];
