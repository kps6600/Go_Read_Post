// Dataset for the SocialStory Brand Page
// Accurately sourced from the SocialStory portal on YourStory

export const SOCIAL_SUB_NAV = [
  { id: 'all', label: 'All Stories' },
  { id: 'founder-first', label: 'Founder First', hasDropdown: true },
  { id: 'action', label: 'Action', hasDropdown: true },
  { id: 'gender', label: 'Gender', hasDropdown: true },
  { id: 'environment', label: 'Environment', hasDropdown: true },
  { id: 'csr', label: 'CSR', hasDropdown: true },
  { id: 'youthspark', label: 'YouthSpark', hasDropdown: true },
  { id: 'social-enterprise', label: 'Social Enterprise', hasDropdown: true },
  { id: 'reports', label: 'Reports', hasDropdown: true }
];

export const SOCIAL_HERO_STORY = {
  id: 'social-khadi-1',
  tag: 'ENVIRONMENT',
  categoryTag: 'ENVIRONMENT',
  category: 'social-story',
  subTopic: 'Environment',
  title: 'Four Indian brands putting a new spin on khadi',
  excerpt: "From contemporary cuts and silhouettes to reimagining the loom itself, these brands are proving that India's handspun heritage fabric is more relevant than ever.",
  summary: "From contemporary cuts and silhouettes to reimagining the loom itself, these brands are proving that India's handspun heritage fabric is more relevant than ever.",
  author: {
    name: 'Tanvi Dubey',
    title: 'Senior Editor, SocialStory',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  readTime: '4 min read',
  publishedAt: 'Oct 3, 2026',
  image: 'https://images.yourstory.com/cs/4/8e7cc4102d6c11e9aa979329348d4c3e/ModernKhadi1600x900-1790843426768.jpg?ar=16%3A9&mode=crop&crop=faces&format=auto&w=1200&q=80',
  fallbackImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
  content: [
    "Khadi is no longer confined to traditional national occasions. A rising wave of contemporary homegrown brands is fusing handspun, zero-carbon cotton and silk with modern cuts, neutral tones, and durable tailoring.",
    "By collaborating directly with weaver clusters across West Bengal, Karnataka, and Andhra Pradesh, these labels ensure living wages for rural artisans while introducing khadi to Gen Z and millennial wardrobes.",
    "“We want people to touch the fabric and realise that it is the ultimate natural luxury: breathable in heat, insulated in cool evenings, and entirely biodegradable,” says one of the featured designers."
  ]
};

export const SOCIAL_HERO_SIDEBAR_STORIES = [
  {
    id: 'social-side-1',
    title: 'This IITian is helping children from the Kota coaching hub cope with burnout',
    shortTitle: 'This IITian is helping children from the Kota...',
    tag: 'EDUCATION & YOUTH',
    categoryTag: 'YouthSpark',
    subTopic: 'YouthSpark',
    author: {
      name: 'Tanvi Dubey',
      title: 'Editor, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '3 min read',
    publishedAt: 'Yesterday',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80',
    summary: 'How an IIT alumnus established a grassroots counseling and mentorship initiative for teenagers under severe competitive exam stress.'
  },
  {
    id: 'social-side-2',
    title: 'This cancer survivor is giving access to healthcare for underprivileged oncology patients',
    shortTitle: 'This cancer survivor is giving access to healthcare...',
    tag: 'HEALTHCARE',
    categoryTag: 'Action',
    subTopic: 'Action',
    author: {
      name: 'Rekha Balakrishnan',
      title: 'Features Lead, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '4 min read',
    publishedAt: '2 days ago',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=80',
    summary: 'A courageous survivor builds a patient-assistance network bridging expensive targeted therapies and hospital accommodation for low-income families.'
  },
  {
    id: 'social-side-3',
    title: 'This banker-turned-cactus conservationist is protecting endangered arid biodiversity',
    shortTitle: 'This banker-turned-cactus conservationist is...',
    tag: 'CONSERVATION',
    categoryTag: 'Environment',
    subTopic: 'Environment',
    author: {
      name: 'Tanvi Dubey',
      title: 'Senior Editor, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '4 min read',
    publishedAt: '3 days ago',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&auto=format&fit=crop&q=80',
    summary: 'Trading high finance for desert botony, this botanist is safeguarding over 800 indigenous xerophyte and succulent varieties in Rajasthan.'
  },
  {
    id: 'social-side-4',
    title: 'This solar innovator is powering over 5,000 primary health centres across off-grid villages',
    shortTitle: 'This solar innovator is powering over 5,000 primary health centres...',
    tag: 'CLEAN ENERGY',
    categoryTag: 'Sustainability',
    subTopic: 'Sustainability',
    author: {
      name: 'Prachi Rastogi',
      title: 'Correspondent, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '3 min read',
    publishedAt: '4 days ago',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=400&auto=format&fit=crop&q=80',
    summary: 'How decentralized solar installations are preventing vaccine spoilage and saving lives in remote healthcare centres.'
  }
];

export const SOCIAL_GRID_STORIES = [
  {
    id: 'social-grid-1',
    tag: 'SOCIAL IMPACT',
    tagColor: '#dc2626',
    categoryTag: 'Social Enterprise',
    subTopic: 'Social Enterprise',
    title: "D&G Foundation's Kaneo Ngail on its work in India for differently-abled artisans",
    shortTitle: "D&G Foundation's Kaneo Ngail on its work in India for different...",
    author: {
      name: 'Prachi Rastogi',
      title: 'Correspondent, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '4 min read',
    publishedAt: 'Oct 2, 2026',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80',
    summary: 'An exclusive conversation on empowering neurodivergent and differently-abled craftspersons through dignity-first design and structured enterprise grants.'
  },
  {
    id: 'social-grid-2',
    tag: 'WOMEN IMPACT',
    tagColor: '#db2777',
    categoryTag: 'Gender',
    subTopic: 'Gender',
    title: 'How this innovative learning programme is helping girls across rural communities stay in school',
    shortTitle: 'How this innovative learning programme is helping girls across...',
    author: {
      name: 'Rekha Balakrishnan',
      title: 'Lead Features, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '4 min read',
    publishedAt: 'Oct 1, 2026',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    summary: 'Combining solar-powered digital tablets and localized peer mentoring to eliminate dropouts after standard eight in tribal districts.'
  },
  {
    id: 'social-grid-3',
    tag: 'INTERNATIONAL LITERACY DAY',
    tagColor: '#16a34a',
    categoryTag: 'Action',
    subTopic: 'Action',
    title: 'From street schools to roadside libraries, five initiatives making reading universal',
    shortTitle: 'From street schools to roadside libraries, five initiatives making...',
    author: {
      name: 'Prachi Rastogi',
      title: 'Correspondent, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '5 min read',
    publishedAt: 'Sep 30, 2026',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
    summary: 'Citizen-led library movements setting up open bookshelves in bus shelters, railway platforms, and slums to ignite a love for literature.'
  },
  {
    id: 'social-grid-4',
    tag: 'RURAL IMPACT',
    tagColor: '#dc2626',
    categoryTag: 'CSR',
    subTopic: 'CSR',
    title: '6 organisations taking healthcare to rural India with mobile clinical units',
    shortTitle: '6 organisations taking healthcare to rural India',
    author: {
      name: 'Rekha Balakrishnan',
      title: 'Lead Features, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '5 min read',
    publishedAt: 'Sep 29, 2026',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    summary: 'Deploying telemedicine-equipped vans, portable diagnostic ultrasounds, and community health workers to villages beyond primary care clinics.'
  },
  {
    id: 'social-grid-5',
    tag: 'RURAL LIVELIHOODS',
    tagColor: '#dc2626',
    categoryTag: 'Founder First',
    subTopic: 'Founder First',
    title: 'How Magic Bus India Foundation is helping rural women become financial decision-makers',
    shortTitle: 'How Magic Bus India Foundation is helping rural women become...',
    author: {
      name: 'Deena Dsouza',
      title: 'Special Features, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '4 min read',
    publishedAt: 'Sep 28, 2026',
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    summary: 'Life-skills and livelihood programs equipping rural homemakers with formal micro-finance training and self-help cooperative leadership.'
  },
  {
    id: 'social-grid-6',
    tag: 'NEURODIVERGENT MENTAL HEALTH',
    tagColor: '#059669',
    categoryTag: 'Action',
    subTopic: 'Action',
    title: "Why Mom's Belief wants every parent to champion neurodivergence without stigma",
    shortTitle: "Why Mom's Belief wants every parent to champion neurodivergence",
    author: {
      name: 'Rekha Balakrishnan',
      title: 'Lead Features, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '4 min read',
    publishedAt: 'Sep 27, 2026',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80',
    summary: 'A holistic neuro-developmental therapy ecosystem training families to build supportive home environments for children on the autism spectrum.'
  }
];

export const SOCIAL_LATEST_STORIES = [
  {
    id: 'social-latest-1',
    tag: 'SOCIAL MEDIA FOR CHILDREN',
    tagColor: '#dc2626',
    categoryTag: 'YouthSpark',
    subTopic: 'YouthSpark',
    title: 'Why keeping children off social media may not be enough to prevent cyber bullying',
    shortTitle: 'Why keeping children off social media may not be enough to...',
    author: {
      name: 'Rekha Balakrishnan',
      title: 'Lead Features, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '4 min read',
    publishedAt: '4 hours ago',
    image: 'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    summary: 'Psychologists and child rights advocates emphasize proactive digital literacy and open emotional channels over blanket device bans.'
  },
  {
    id: 'social-latest-2',
    tag: 'ENVIRONMENT',
    tagColor: '#059669',
    categoryTag: 'Environment',
    subTopic: 'Environment',
    title: 'The Swedish way to stop wasting waste: circular economy lessons for Indian cities',
    shortTitle: 'The Swedish way to stop wasting waste',
    author: {
      name: 'Gurveen KVR',
      title: 'Sustainability Desk',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '5 min read',
    publishedAt: 'Yesterday',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    summary: 'How Sweden recycles nearly 99% of its municipal solid waste into district heating and biofuel, offering a blueprint for developing metropolises.'
  },
  {
    id: 'social-latest-3',
    tag: 'SUSTAINABLE FASHION',
    tagColor: '#16a34a',
    categoryTag: 'Environment',
    subTopic: 'Environment',
    title: 'Five Indian ventures making fashion with sustainable plant fibers and upcycled plastics',
    shortTitle: 'Five Indian ventures making fashion with sustainable...',
    author: {
      name: 'Rekha Balakrishnan',
      title: 'Lead Features, SocialStory',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '4 min read',
    publishedAt: '2 days ago',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80',
    summary: 'From banana stem yarn to discarded fishing net outerwear, how ethical apparel founders are cleaning landfills while creating rural crafts jobs.'
  }
];

export const SOCIAL_EXPERT_OPINION_STORIES = [
  {
    id: 'social-expert-1',
    tag: 'ENVIRONMENT',
    tagColor: '#059669',
    categoryTag: 'Environment',
    subTopic: 'Environment',
    title: 'The Swedish way to stop wasting waste: circular economy lessons for Indian cities',
    shortTitle: 'The Swedish way to stop wasting waste',
    author: {
      name: 'Gurveen KVR',
      title: 'Sustainability Contributor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '5 min read',
    publishedAt: '3 days ago',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    summary: 'Why source segregation at apartment complexes is the single missing link that unlocks municipal circularity and composting economics.'
  },
  {
    id: 'social-expert-2',
    tag: 'SILVER ECONOMY',
    tagColor: '#dc2626',
    categoryTag: 'Reports',
    subTopic: 'Reports',
    title: "The missing infrastructure in India's silver economy boom and senior eldercare",
    shortTitle: "The missing infrastructure in India's silver economy boom...",
    author: {
      name: 'Deena Dsouza',
      title: 'Social Research Fellow',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '5 min read',
    publishedAt: '4 days ago',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    summary: 'With India aging faster than anticipated, our assisted living guidelines, geriatric insurance, and community care centers require emergency policy impetus.'
  },
  {
    id: 'social-expert-3',
    tag: 'EDUCATION',
    tagColor: '#059669',
    categoryTag: 'Action',
    subTopic: 'Action',
    title: "Why collaboration isn't optional anymore in Indian education reform and pedagogy",
    shortTitle: "Why collaboration isn't optional anymore in Indian education...",
    author: {
      name: 'Chetan Kapoor',
      title: 'CEO, Tech Mahindra Foundation',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    readTime: '4 min read',
    publishedAt: '5 days ago',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
    summary: 'Public-private convergence between district school administrations, CSR foundations, and edtech builders is the only vehicle capable of transforming foundational numeracy.'
  }
];
