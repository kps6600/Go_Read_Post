// GoReadPost Studio & Video Stories Data Catalog
export const VIDEO_EPISODES = [
  {
    id: 'video-1',
    title: 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
    series: 'Founders Unfiltered',
    category: 'interviews',
    categoryLabel: 'Founder Interview',
    duration: '42:15',
    views: '245K',
    likes: '18.4K',
    publishedAt: '2 days ago',
    guest: 'Bhavish Aggarwal',
    guestRole: 'Founder & CEO',
    guestCompany: 'Ola & Krutrim',
    guestAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Pioneered mobility across India with Ola before committing $500M+ to domestic AI silicon chips, liquid-cooled datacenters, and multilingual foundation models.',
    host: 'Shradha Sharma',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/cKxRvEZd3Mw?autoplay=1&rel=0',
    description: 'Inside the high-stakes ambition to build India’s own supercomputing infrastructure, AI silicon accelerator chips, and domestic LLMs from scratch.',
    highlights: [
      'Why India must own its compute layer rather than renting foreign GPUs',
      'Architecture breakdown of the new 10,000-accelerator datacenter in Tamil Nadu',
      'The economics of pricing Indic AI tokens 40% below Silicon Valley hyperscalers'
    ],
    chapters: [
      { time: '00:00', label: 'The Sovereign AI Imperative', summary: 'Why relying on foreign cloud APIs is a multi-decade geopolitical vulnerability.' },
      { time: '06:15', label: 'Silicon Architecture & Custom ASICs', summary: 'Engineering tape-outs for Krutrim’s native AI matrix acceleration chip.' },
      { time: '16:40', label: 'Liquid-Cooled Datacenter Realities', summary: 'Megawatt power distribution and thermal heat management in Tamil Nadu.' },
      { time: '28:10', label: 'Indic Multilingual Tokenomics', summary: 'Training benchmarks across 22 scheduled Indian languages with synthetic data.' },
      { time: '38:50', label: '2027 Roadmap & Autonomous Systems', summary: 'The convergence of electric robotics, vehicles, and on-device neural reasoning.' }
    ],
    transcript: [
      { speaker: 'Shradha Sharma', time: '02:15', text: 'Bhavish, skeptics say manufacturing silicon and building hyperscale LLMs requires hundreds of billions that only 3 US tech giants have. How do you respond?' },
      { speaker: 'Bhavish Aggarwal', time: '03:40', text: 'Ten years ago, they said Indian startups could only clone US software apps. Today India leads global real-time digital payments. We must not be digital colonies paying GPU rent forever. Compute is the new electricity.' },
      { speaker: 'Bhavish Aggarwal', time: '18:10', text: 'Our datacenter is co-located near solar generation. By taking token costs down by 40%, every Indian SMB and hospital will be able to afford specialized agent intelligence.' }
    ]
  },
  {
    id: 'video-2',
    title: 'The Hard Truth About Startup Dilution: Nithin Kamath on Bootstrapping to ₹4,000 Cr Profit',
    series: 'Studio Masterclass',
    category: 'masterclass',
    categoryLabel: 'Masterclass',
    duration: '38:40',
    views: '410K',
    likes: '34.2K',
    publishedAt: '4 days ago',
    guest: 'Nithin Kamath',
    guestRole: 'Founder & CEO',
    guestCompany: 'Zerodha',
    guestAvatar: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Founded Zerodha in 2010 with zero outside venture capital, disrupting Indian retail capital markets and generating over ₹4,000 Cr in annual operating profit.',
    host: 'Shradha Sharma',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/CBYhVcO4WgI?autoplay=1&rel=0',
    description: '',
    highlights: [
      'The mathematical reality of compounding capital without dilution',
      'Building zero-cost customer acquisition loops via education (Varsity)',
      'How regulatory changes reshape retail broking unit economics'
    ],
    chapters: [
      { time: '00:00', label: 'Bootstrapping vs Venture Treadmill', summary: 'Why dilution is the most expensive check a founder will ever write.' },
      { time: '08:20', label: 'Zero Marketing Spend Flywheel', summary: 'How education via Zerodha Varsity became a massive organic moat.' },
      { time: '17:45', label: 'Financial Prudence & Risk Engines', summary: 'Surviving market crashes through real-time margining and zero leverage.' },
      { time: '29:30', label: 'Rainmatter & Giving Back', summary: 'Deploying profits into climate tech, organic farming, and health initiatives.' }
    ],
    transcript: [
      { speaker: 'Shradha Sharma', time: '04:10', text: 'Nithin, you never raised institutional capital. Was that deliberate conviction or serendipity?' },
      { speaker: 'Nithin Kamath', time: '05:35', text: 'In 2010 nobody wanted to fund a discount broking startup in Bangalore. That forced us to be profitable on Day 1. When you don’t have free cash, you solve product bottlenecks instead of spending on hoardings.' }
    ]
  },
  {
    id: 'video-3',
    title: 'Race to Give Machines Human-Like Intelligence: Can India Build Robots That Think & Adapt?',
    series: 'DeepTech Spotlight',
    category: 'deeptech',
    categoryLabel: 'DeepTech & AI',
    duration: '26:15',
    views: '180K',
    likes: '14.1K',
    publishedAt: '1 week ago',
    guest: 'Gokul N. A. & N. A. Kumar',
    guestRole: 'Co-Founders',
    guestCompany: 'Cynlr Robotics',
    guestAvatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Deep science roboticists based out of Bangalore building universal visual cognition systems that give industrial robotic arms human-grade hand-eye coordination.',
    host: 'TechSparks Studio',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/th3ZXsL90aY?autoplay=1&rel=0',
    description: "Inside Cynlr's breakthrough mission to equip industrial multi-axis robotic arms with real-time stereoscopic depth perception and intuitive dexterity.",
    highlights: [
      'Eliminating custom mechanical part-feeders using spatial neural vision',
      'Deploying in high-precision automotive factories in Germany and Japan',
      'The difference between software LLMs and physical robotics reasoning'
    ],
    chapters: [
      { time: '00:00', label: 'The Holy Grail of Robotics', summary: 'Why grasping random unstructured objects remains hardest in AI.' },
      { time: '05:50', label: 'Stereoscopic Convergence Hardware', summary: 'Building biological-inspired dual camera vision modules.' },
      { time: '14:15', label: 'Factory Economics in Germany & Japan', summary: 'Saving millions in tooling for automotive component assembly lines.' },
      { time: '21:30', label: 'Physical World AI vs Large Language Models', summary: 'Why real-time Newtonian physics demands spatial neuro-reasoning.' }
    ],
    transcript: [
      { speaker: 'Host', time: '01:20', text: 'Why can AI write Shakespearean poetry but an industrial robot cannot pick up a screw dropped in a bucket?' },
      { speaker: 'Gokul N. A.', time: '02:45', text: 'Because vision in biology is not pixels—it is an active motor reflex. Cynlr moves the camera like an eyeball to understand depth, reflection, and friction instantly.' }
    ]
  },
  {
    id: 'video-4',
    title: 'From College Dorm to $5B SaaS Empire: Abhinav Asthana on How Postman Conquered Developers',
    series: 'TechSparks Archives',
    category: 'keynotes',
    categoryLabel: 'Founder Keynote',
    duration: '31:50',
    views: '195K',
    likes: '16.8K',
    publishedAt: '1 week ago',
    guest: 'Abhinav Asthana',
    guestRole: 'Co-Founder & CEO',
    guestCompany: 'Postman',
    guestAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Built Postman as an open-source Chrome extension to solve personal API testing friction; scaled it into the global API ecosystem standard used by 30M+ engineers.',
    host: 'Frontier Tech Bureau',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/1hHMwLxN6EM?autoplay=1&rel=0',
    description: 'The organic developer growth flywheel that transformed an open-source Chrome app into the global standard for 30 million API developers.',
    highlights: [
      'Turning developer pain points into a bottom-up adoption tsunami',
      'Scaling remote engineering culture across Bengaluru and San Francisco',
      'The future of autonomous agent-to-agent API integrations'
    ],
    chapters: [
      { time: '00:00', label: 'The Chrome Extension Spark', summary: 'Scratching an itch when testing REST APIs late at night.' },
      { time: '07:30', label: 'Product-Led Growth Before It Had a Name', summary: 'Why developers become the ultimate enterprise sales champions.' },
      { time: '18:10', label: 'Global Remote Architecture', summary: 'Bridging engineering rigor across time zones and cultures.' },
      { time: '26:00', label: 'APIs in the Age of Generative AI Agents', summary: 'How machines calling machines reshapes software architecture.' }
    ],
    transcript: [
      { speaker: 'Abhinav Asthana', time: '08:20', text: 'Developers have zero patience for marketing fluff. If your tool solves their problem in 30 seconds, they will champion it to their CTO without you ever hiring an enterprise salesperson.' }
    ]
  },
  {
    id: 'video-5',
    title: 'Agnikul’s Big Bet to Make Rockets Reusable and Turn Them Into Orbital Space Platforms',
    series: 'DeepTech Spotlight',
    category: 'deeptech',
    categoryLabel: 'DeepTech & Space',
    duration: '34:10',
    views: '265K',
    likes: '22.3K',
    publishedAt: '2 weeks ago',
    guest: 'Srinath Ravichandran',
    guestRole: 'Co-Founder & CEO',
    guestCompany: 'Agnikul Cosmos',
    guestAvatar: 'https://images.unsplash.com/photo-1517976487504-59a1a08420e7?w=200&auto=format&fit=crop&q=80',
    guestBio: 'IIT Madras incubated deeptech founder who engineered and launched Agnibaan SOrTeD, powered by the world’s first 3D-printed single-piece semi-cryogenic engine.',
    host: 'Spacetech Desk',
    image: 'https://images.unsplash.com/photo-1517976487504-59a1a08420e7?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/cdZZpaB2kDM?autoplay=1&rel=0',
    description: 'How a Chennai team 3D-printed a single-piece semi-cryogenic rocket engine, tested it in flight, and is solving the ruthless economics of space reusability.',
    highlights: [
      'Printing an entire rocket engine in 72 hours using additive metal sintering',
      'Mobile launch platforms that eliminate multi-month spaceport backlogs',
      'Why commercial rocket economics mirror aviation turnaround times'
    ],
    chapters: [
      { time: '00:00', label: 'The 3D-Printed Engine Breakthrough', summary: 'Eliminating hundreds of welds in cryogenic combustion chambers.' },
      { time: '09:40', label: 'Launch on Demand: Mobile Infrastructure', summary: 'Setting up orbital launches from anywhere with road access.' },
      { time: '21:15', label: 'Sub-Orbital SOrTeD Mission Retrospective', summary: 'Flight telemetry data from Sriharikota test pads.' }
    ],
    transcript: [
      { speaker: 'Srinath Ravichandran', time: '03:10', text: 'A traditional rocket engine has over 1,000 components welded together. Any weld can leak under cryogenic liquid oxygen. By 3D-printing the engine in a single monolithic piece, we eliminate assembly defects entirely.' }
    ]
  },
  {
    id: 'video-6',
    title: 'The Omnichannel Moat: Peyush Bansal on Turning Eyeglasses into High Margin Fashion',
    series: 'Founders Unfiltered',
    category: 'interviews',
    categoryLabel: 'Founder Interview',
    duration: '48:10',
    views: '490K',
    likes: '41.5K',
    publishedAt: '2 weeks ago',
    guest: 'Peyush Bansal',
    guestRole: 'Founder & CEO',
    guestCompany: 'Lenskart',
    guestAvatar: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Scaled Lenskart into a global eyewear powerhouse operating 2,000+ stores across India, Japan, and Southeast Asia, backed by massive automated robotic manufacturing facilities.',
    host: 'Shradha Sharma',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/DOtCl5PU8F0?autoplay=1&rel=0',
    description: 'Peyush shares early operational setbacks, building automated lens manufacturing robotics in Bhiwadi, and expanding across Southeast Asia and Japan.',
    highlights: [
      'Why pure D2C ecommerce brands struggle without offline physical touchpoints',
      'Robotic optical labs cutting lens finishing costs by 80%',
      'The playbook for international M&A with Japanese eyewear chains'
    ],
    chapters: [
      { time: '00:00', label: 'The Early Days & Near Bankruptcy', summary: 'Pivoting from online contact lenses to custom manufacturing.' },
      { time: '12:30', label: 'The Bhiwadi Mega-Factory', summary: 'Inside the robotics automated facility producing 100K glasses daily.' },
      { time: '28:15', label: 'Buying Owndays in Japan', summary: 'Cultural integration and capturing high-end Asian eyewear markets.' }
    ],
    transcript: [
      { speaker: 'Peyush Bansal', time: '14:20', text: 'Customers don’t want to buy eyewear online based on a screen render. They need accurate prescription checkups and real touch. The store is your trust anchor; the cloud is your supply chain engine.' }
    ]
  },
  {
    id: 'video-7',
    title: 'Can India Build Hardware? Tarun Mehta on the 10-Year Journey to Electric Mobility',
    series: 'Founders Unfiltered',
    category: 'interviews',
    categoryLabel: 'Founder Interview',
    duration: '35:25',
    views: '160K',
    likes: '12.8K',
    publishedAt: '3 weeks ago',
    guest: 'Tarun Mehta',
    guestRole: 'Co-Founder & CEO',
    guestCompany: 'Ather Energy',
    guestAvatar: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Co-founded Ather Energy from IIT Madras, engineering India’s first premium connected electric scooter platform from battery packs to dashboard software.',
    host: 'Mobility Desk',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/UF8uR6Z6KLc?autoplay=1&rel=0',
    description: 'Why designing an electric scooter is 10x harder than writing software, managing supply chain bottlenecks, and scaling domestic EV manufacturing.',
    highlights: [
      'Thermal runaway prevention and localized battery pack engineering',
      'The economics of fast charging infrastructure in tier-2 cities',
      'Navigating subsidy changes and preparing for institutional public listing'
    ],
    chapters: [
      { time: '00:00', label: 'Why Hardware Kills Startups', summary: 'Tooling lead times, automotive homologation, and cashflow burns.' },
      { time: '11:20', label: 'Thermal Engineering in Indian Climates', summary: 'Preventing battery degradation at 48°C ambient conditions.' },
      { time: '24:00', label: 'The Public Listing Horizon', summary: 'Moving from venture subsidization to positive manufacturing gross margins.' }
    ],
    transcript: [
      { speaker: 'Tarun Mehta', time: '08:45', text: 'Software engineers can push hotfixes at 2 AM. In hardware, if you make a mistake in a chassis die-cast, you throw away three months and two crores. Respect the physics.' }
    ]
  },
  {
    id: 'video-8',
    title: 'AI Agents Will Change Everything: Pramod Varma on Reimagining Value Exchange',
    series: 'Studio Masterclass',
    category: 'masterclass',
    categoryLabel: 'Masterclass',
    duration: '37:15',
    views: '320K',
    likes: '29.7K',
    publishedAt: '3 weeks ago',
    guest: 'Pramod Varma',
    guestRole: 'Chief Architect',
    guestCompany: 'Beckn Protocol & Aadhaar',
    guestAvatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Lead architect behind Aadhaar, India Stack, and Beckn Protocol; globally advising on decentralized open digital commerce rails.',
    host: 'Disruptor Dialogues',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/rP3L814mC8Q?autoplay=1&rel=0',
    description: 'Beckn and Aadhaar chief architect breaks down how autonomous agent networks will reshape digital commerce, healthcare, and open public protocols.',
    highlights: [
      'The shift from centralized platforms to interoperable open network protocols',
      'How AI agents will discover, negotiate, and execute commerce autonomously',
      'Sovereign digital identity safeguards in the post-generative AI era'
    ],
    chapters: [
      { time: '00:00', label: 'Protocols vs Monopolies', summary: 'Why email and HTTP won, and how commerce will decentralize.' },
      { time: '14:30', label: 'Autonomous Agent Commerce', summary: 'When AI assistants buy groceries and insurance on Beckn rails.' },
      { time: '29:00', label: 'Privacy & Consent Architecture', summary: 'Zero-knowledge proofs and tokenized consent frameworks.' }
    ],
    transcript: [
      { speaker: 'Pramod Varma', time: '12:10', text: 'We don’t need another super app. We need an open protocol like TCP/IP where any buyer agent can discover any seller agent without a 30% intermediary commission tax.' }
    ]
  },
  {
    id: 'video-9',
    title: 'Venture Capital in 2026: What Top Investors Look for in Pre-Seed and Series A Decks',
    series: 'Capital Roundtable',
    category: 'market',
    categoryLabel: 'Market & Capital',
    duration: '45:00',
    views: '175K',
    likes: '15.6K',
    publishedAt: '1 month ago',
    guest: 'Top Tier VC Partners Panel',
    guestRole: 'Managing Partners',
    guestCompany: 'Sequoia, Accel & Elevation',
    guestAvatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&auto=format&fit=crop&q=80',
    guestBio: 'A private boardroom gathering of leading institutional venture capital partners managing over $4B in Indian tech ecosystems.',
    host: 'Venture Bureau',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/jwXlo9gy_m4?autoplay=1&rel=0',
    description: 'Leading institutional venture investors debate startup valuations, gross margin quality in AI startups, and founder diligence benchmarks.',
    highlights: [
      'The death of vanity GMV metrics: why contribution margins dictate Series A',
      'Defensibility moats in generative AI applications vs foundation model providers',
      'What separates the top 1% of pitch decks during partner meetings'
    ],
    chapters: [
      { time: '00:00', label: 'The Reset in Valuations', summary: 'Reflecting on 2021 excess and returning to fundamental cash metrics.' },
      { time: '16:00', label: 'Software Gross Margins Under AI Compute Costs', summary: 'Why 80% gross margin SaaS is becoming 55% without optimization.' },
      { time: '34:20', label: 'Founder Conviction Signals', summary: 'Diligence frameworks used to evaluate early technical founders.' }
    ],
    transcript: [
      { speaker: 'VC Panelist', time: '18:30', text: 'If your AI application is just a thin API wrapper over OpenAI or Anthropic, your moat is zero. We look for proprietary data loops and deep domain workflow integration.' }
    ]
  },
  {
    id: 'video-10',
    title: 'The 10-Minute Commerce Machine: Deepinder Goyal on Dark Stores, Blinkit & Unit Economics',
    series: 'Founders Unfiltered',
    category: 'interviews',
    categoryLabel: 'Founder Interview',
    duration: '44:20',
    views: '520K',
    likes: '48.9K',
    publishedAt: '1 month ago',
    guest: 'Deepinder Goyal',
    guestRole: 'Founder & CEO',
    guestCompany: 'Zomato & Blinkit',
    guestAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Scaled Zomato from a restaurant menu scanning site in 2008 into India’s leading food and quick commerce conglomerate listed on NSE.',
    host: 'Shradha Sharma',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/z0N1qA0eA1E?autoplay=1&rel=0',
    description: 'Inside the logistics revolution of quick commerce: how Blinkit reached operating profitability, managing 1,000+ dark store networks, and future retail disruption.',
    highlights: [
      'Inventory throughput algorithms driving sub-8-minute dispatch cycles',
      'Why density of orders within 2km dictates dark store EBITDA positive margins',
      'Expanding into electronics, beauty, and festive seasonal retail fulfillment'
    ],
    chapters: [
      { time: '00:00', label: 'The Blinkit Acquisition Thesis', summary: 'Overcoming market skepticism during the 2022 deal closing.' },
      { time: '14:20', label: 'Dark Store Density Math', summary: 'Turning fixed lease and picker costs into high-velocity throughput.' },
      { time: '31:40', label: 'Disrupting Modern Trade & E-Commerce', summary: 'Why 10-minute delivery beats next-day shipping in metro India.' }
    ],
    transcript: [
      { speaker: 'Deepinder Goyal', time: '11:15', text: 'When you deliver in 10 minutes, consumer behavior undergoes a permanent shift. People stop planning weekly grocery shopping. The refrigerator moves to the neighborhood dark store.' }
    ]
  },
  {
    id: 'video-11',
    title: 'The Delta 4 Framework & High-Trust Ecosystems: Kunal Shah on Consumer Behavior Mechanics',
    series: 'Studio Masterclass',
    category: 'masterclass',
    categoryLabel: 'Masterclass',
    duration: '52:10',
    views: '680K',
    likes: '62.4K',
    publishedAt: '1 month ago',
    guest: 'Kunal Shah',
    guestRole: 'Founder & CEO',
    guestCompany: 'CRED',
    guestAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Serial entrepreneur who built FreeCharge and CRED, renowned for deep sociological insights into Indian consumer psychology and product moats.',
    host: 'Disruptor Dialogues',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/Gfr50f6Zp3g?autoplay=1&rel=0',
    description: 'A deep dive into product moats, irreversible consumer habits (Delta 4), and building high-trust financial services for India’s top creditworthy cohort.',
    highlights: [
      'The Delta 4 test: what creates irreversible human behavior in technology products',
      'Overcoming zero-trust barriers in digital payments and premium commerce',
      'Monetization engines across peer-to-peer lending and vehicular financial tech'
    ],
    chapters: [
      { time: '00:00', label: 'Understanding Delta 4 Efficiency', summary: 'Why products with score delta > 4 never face user churn.' },
      { time: '18:40', label: 'Status & Aspiration in Emerging Markets', summary: 'The hidden psychological drivers of Indian affluent spending.' },
      { time: '37:10', label: 'Curating High-Trust Ecosystems', summary: 'Risk modeling on high-credit cohorts for lending and commerce.' }
    ],
    transcript: [
      { speaker: 'Kunal Shah', time: '05:40', text: 'Once you book an Uber or pay with UPI, going back to hailing an auto with cash feels unbearable. That delta of efficiency > 4 creates an irreversible behavioral switch. If your product is only Delta 2, you will burn money forever.' }
    ]
  },
  {
    id: 'video-12',
    title: 'The Architecture of Public Digital Infrastructure: Nandan Nilekani on India Stack & AI Future',
    series: 'TechSparks Archives',
    category: 'keynotes',
    categoryLabel: 'Summit Keynote',
    duration: '46:30',
    views: '390K',
    likes: '35.8K',
    publishedAt: '2 months ago',
    guest: 'Nandan Nilekani',
    guestRole: 'Co-Founder & Chairman',
    guestCompany: 'Infosys & UIDAI',
    guestAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Infosys co-founder who architected Aadhaar, powering 1.4B digital identities, and spearheads open public digital rails transforming financial inclusion.',
    host: 'TechSparks Bureau',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/rP3L814mC8Q?autoplay=1&rel=0',
    description: 'From Aadhaar and UPI to ONDC and Account Aggregator: how open architectural protocols create massive entrepreneurial canvas for trillion-dollar GDP scale.',
    highlights: [
      'How interoperable public rails prevent monopolistic private platform lock-in',
      'Democratizing credit for 60 million MSMEs through flow-based financial records',
      'The imperative for Indic multi-lingual generative AI at societal scale'
    ],
    chapters: [
      { time: '00:00', label: 'The DPI Philosophy', summary: 'Unbundling identity, payments, and data exchange into public rails.' },
      { time: '15:20', label: 'From Asset-Heavy to Flow-Based Lending', summary: 'Financing small merchants using cashflow verification.' },
      { time: '32:00', label: 'Bhashini & Indic Generative AI', summary: 'Empowering 800M citizens through voice-driven digital services.' }
    ],
    transcript: [
      { speaker: 'Nandan Nilekani', time: '14:50', text: 'Instead of building digital walled gardens that capture users, India built public digital highways where thousands of startups can drive their own Ferraris. That is why innovation exploded.' }
    ]
  },
  {
    id: 'video-13',
    title: 'From Kitchen Experiments to IPO: Ghazal Alagh on Building a ₹1,500 Cr Beauty Conglomerate',
    series: 'Founders Unfiltered',
    category: 'interviews',
    categoryLabel: 'Founder Interview',
    duration: '39:45',
    views: '310K',
    likes: '26.4K',
    publishedAt: '2 months ago',
    guest: 'Ghazal Alagh',
    guestRole: 'Co-Founder & Chief Innovation Officer',
    guestCompany: 'Honasa Consumer (Mamaearth)',
    guestAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    guestBio: 'Co-founded Honasa Consumer, pioneering toxin-free personal care and steering Mamaearth, The Derma Co, and Aqualogica to a successful public listing on Indian bourses.',
    host: 'HerStory Studio',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1200&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/k2P_amIMF3o?autoplay=1&rel=0',
    description: 'The journey from addressing toxin-free baby care needs to acquiring legacy personal care brands, navigating offline distribution, and executing a public listing.',
    highlights: [
      'Rapid iterative product innovation driven by direct consumer feedback loops',
      'Scaling from digital native channels to 150,000+ modern retail pharmacy shelves',
      'Building a multi-brand house that compounds operating cashflows'
    ],
    chapters: [
      { time: '00:00', label: 'The Motherhood Catalyst', summary: 'Formulating clean baby products when safe alternatives didn’t exist.' },
      { time: '13:10', label: 'The House of Brands Playbook', summary: 'Launching The Derma Co & Aqualogica with separate target demographics.' },
      { time: '28:40', label: 'Offline General Trade Expansion', summary: 'Cracking distribution across tier-2/3 kirana and cosmetic networks.' }
    ],
    transcript: [
      { speaker: 'Ghazal Alagh', time: '16:30', text: 'When you are a D2C brand, internet consumers give you instantaneous feedback. We launch, listen, and iterate in 45 days what FMCG conglomerates take two years to test.' }
    ]
  }
];

export const VIDEO_CATEGORIES = [
  { id: 'all', label: 'All Episodes' },
  { id: 'interviews', label: 'Founders Unfiltered' },
  { id: 'masterclass', label: 'Studio Masterclasses' },
  { id: 'deeptech', label: 'DeepTech & AI' },
  { id: 'keynotes', label: 'TechSparks Keynotes' },
  { id: 'market', label: 'Market & Capital' }
];

export const STORAGE_KEY = 'goreadpost_admin_videos_v1';

export function getStoredVideos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return VIDEO_EPISODES;
}

export function saveStoredVideos(videosList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videosList));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
}
