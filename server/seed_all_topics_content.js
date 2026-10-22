import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goreadpost';

// Realistic topic descriptions mapping
const TOPIC_DESCRIPTIONS = {
  'agri-supply-chain': 'Tracking tech-enabled farm logistics, cold storage infrastructure, and farm-to-fork value chains across Bharat.',
  'auto-engineering': 'Breakthroughs in automotive engineering, autonomous software stacks, precision tooling, and EV powertrains.',
  'action': 'High-impact investigative reporting, breaking news dispatches, and regulatory crackdowns across the tech ecosystem.',
  'beauty-d2c': 'Inside modern skincare, clean cosmetics, omnichannel retail distribution, and direct-to-consumer brand economics.',
  'big-tech': 'Comprehensive coverage of global tech giants, antitrust probes, cloud compute wars, and sovereign AI strategies.',
  'chips-hardware': 'Semiconductor design, packaging test facilities (ATMP), RISC-V open architectures, and fab hardware manufacturing.',
  'consumer-ai': 'Next-generation multimodal assistant apps, agentic workflows, creative generation tools, and consumer device intelligence.',
  'crafts-heritage': 'Empowering grassroots artisans, traditional textiles, geographical indication (GI) products, and digital craft marketplaces.',
  'cryptocurrency': 'Layer-1 scalability, decentralized finance rails, tokenomics governance, and cross-border crypto regulatory standards.',
  'csr': 'Corporate social responsibility initiatives, community development, sustainable impact metrics, and corporate giving.',
  'corporate': 'Executive board strategies, corporate governance, mergers & acquisitions, and enterprise digital transformations.',
  'd2c-retail': 'Omnichannel retail unit economics, dark store inventory logistics, brand storytelling, and customer retention mechanics.',
  'deeptech': 'Frontier scientific breakthroughs, computer vision robotics, space systems, and quantum engineering.',
  'education': 'Adaptive learning software, autonomous AI tutors, vocational credential verification, and workforce reskilling.',
  'enterprise-tech': 'Enterprise software architecture, microservices resilience, devops pipelines, and cloud migration blueprints.',
  'entertainment': 'Streaming content economics, generative media production, digital creator monetization, and gaming ecosystems.',
  'ev-mobility': 'Battery chemistry innovations, charging grid corridors, two-wheeler electrification, and urban transit fleets.',
  'exports-agri': 'Global agricultural trade flows, organic certification standards, export freight logistics, and cold chain shipping.',
  'editorial': 'In-depth investigative dispatches, editorial policy commentary, and executive perspectives from the GoReadPost newsroom.',
  'enterprise-ai': 'Enterprise generative AI orchestration, private vector databases, LLM guardrails, and automated enterprise agents.',
  'environment': 'Ecological biodiversity, urban conservation, water stewardship, and circular waste economy implementations.',
  'founder-journey': 'Unfiltered operational chronicles, near-death pivots, scaling pains, and leadership lessons from company builders.',
  'funding': 'Seed rounds, growth equity term sheets, valuation multiples, LP liquidity distributions, and late-stage capital rounds.',
  'fintech': 'Next-generation UPI rails, account aggregator networks, embedded cross-border credit, and algorithmic fraud detection.',
  'founder-first': 'First-principles operating playbooks, wartime CEO decisions, and operational philosophies from iconic founders.',
  'gcc': 'Global Capability Centers in India, engineering centers of excellence, R&D transformation, and multinational talent pools.',
  'grassroots': 'Innovations emerging from rural communities, tier-3 startups, agricultural innovators, and localized social champions.',
  'gender': 'Championing gender diversity, women in engineering leadership, equitable venture funding, and board representation.',
  'google': 'Gemini foundation model developments, Android ecosystem AI, sovereign data center expansions, and DeepMind research.',
  'herstory': 'Chronicles of trailblazing women entrepreneurs, corporate leaders, researchers, and social pioneers redefining industries.',
  'innovation': 'Breakthrough technological inventions, patent filings, academic spinouts, and novel business models.',
  'interview': 'One-on-one executive conversations with industry pioneers, founders, venture capitalists, and policymakers.',
  'llms-models': 'Frontier reasoning architectures, open-weights quantization, multi-token prediction, and foundational training runs.',
  'leadership-lens': 'Executive decision frameworks, crisis management, organizational culture, and high-performance engineering leadership.',
  'manufacturing': 'Industrial automation, smart factories, supply chain nearshoring, and high-precision domestic manufacturing.',
  'microsoft': 'Azure OpenAI enterprise deployments, sovereign cloud contracts, Copilot integration, and developer ecosystem tooling.',
  'news': 'Breaking headlines, market dispatches, and real-time updates from newsrooms across India and global tech hubs.',
  'openai': 'GPT foundation models, o-series reasoning architectures, API infrastructure, and enterprise deployment roadmaps.',
  'policy-tech': 'Digital Personal Data Protection Act compliance, AI regulation frameworks, antitrust investigations, and digital public goods.',
  'policy-voice': 'Public policy debates, industry submissions, regulatory reform perspectives, and technological governance.',
  'robotics': 'Autonomous mobile robots, humanoid manipulators, spatial computer vision, and warehouse logistics automation.',
  'rural-heroes': 'Local changemakers, village entrepreneurs, and grassroots innovators solving community challenges across Bharat.',
  'reports': 'Proprietary research whitepapers, market landscape analyses, venture capital benchmark surveys, and industry audits.',
  'social-impact': 'Mission-driven social ventures, non-profit scaling models, philanthropic capital, and measurable SDG outcomes.',
  'sovereign-ai': 'National AI compute missions, localized linguistic datasets, GPU cluster governance, and domestic foundation models.',
  'sports-adventure': 'Extreme sports innovations, outdoor adventure tech, high-altitude expeditions, and adventure tourism.',
  'sports-fitness': 'Wearable biometric telemetry, sports science academies, athletic training tech, and fitness startup models.',
  'stories': 'Compelling human narratives, operational founder chronicles, and transformative stories across the innovation economy.',
  'social-enterprise': 'Financially self-sustaining social impact ventures tackling clean drinking water, sanitation, and renewable power.',
  'sports-nation': 'Grassroots sports infrastructure, national athletic programs, Olympic preparation, and domestic sports leagues.',
  'spotlight': 'Featured deep-dives, investigative series, and editorial spotlights celebrating high-impact ventures.',
  'startups': 'From garage prototypes to unicorn valuations: funding rounds, product-market fit playbooks, and startup audits.',
  'sustainability': 'ESG compliance, industrial decarbonization, renewable microgrids, and circular economy supply chains.',
  'swiggy': 'Inside Swiggy Instamart quick-commerce density, dark store unit economics, delivery fleets, and public market debut.',
  'talent-workforce': 'Tech hiring dynamics, executive compensation benchmarks, remote engineering culture, and workforce reskilling.',
  'textiles-weaves': 'Revitalizing traditional handlooms, sustainable organic cotton fibers, natural dyes, and digital artisan marketplaces.',
  'the-captable': 'Deep-dive investigative reporting on term sheets, cap table restructuring, down rounds, and private equity deals.',
  'wellness-d2c': 'Ayurvedic wellness brands, preventative health diagnostics, organic nutrition, and consumer wellbeing products.',
  'women-in-tech': 'Highlighting women software architects, machine learning researchers, CTOs, and technical leaders shaping technology.',
  'workplace': 'Future of work, hybrid collaboration stacks, corporate wellness initiatives, and engineering team performance.',
  'youthspark': 'Student founders, collegiate incubators, teenage hackathon winners, and the next generation of builders.',
  'zomato': 'Blinkit quick-commerce logistics, Hyperpure restaurant supply chain, platform margins, and food-delivery profitability.',
  'ai': 'आर्टिफिशियल इंटेलिजेंस, मशीन लर्निंग, और जनरेटिव टेक में नवीनतम अनुसंधान और भारतीय स्टार्टअप्स।',
  '2024': 'TechSparks 2024: The definitive tech and startup summit coverage, panel debates, and pitch showcases.',
  'default': 'Comprehensive reporting, strategic perspectives, and deep-dive analyses across the innovation economy.'
};

// Rich curated images for generated content
const UNSPASH_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517976487502-53b98c39fa42?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80'
];

const AUTHORS = [
  { name: 'Dr. Arvind Ramesh', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { name: 'Neha Singhania', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80' },
  { name: 'Kunal Mehra', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { name: 'Pratiksha Bannerjee', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' },
  { name: 'Varun Shenoy', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
  { name: 'Aditya Roy', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80' },
  { name: 'Meera Subramanian', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80' }
];

async function seedAllTopicsContent() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB Connected.');

  const Topic = mongoose.models.Topic || mongoose.model('Topic', new mongoose.Schema({
    name: String,
    slug: String,
    description: String,
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    isActive: Boolean
  }, { strict: false }));

  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
    name: String,
    slug: String
  }, { strict: false }));

  const Article = mongoose.models.Article || mongoose.model('Article', new mongoose.Schema({
    title: String,
    slug: String,
    summary: String,
    content: String,
    category: mongoose.Schema.Types.Mixed,
    topics: [String],
    topicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    tags: [String],
    featuredImage: mongoose.Schema.Types.Mixed,
    author: mongoose.Schema.Types.Mixed,
    status: String,
    publishedAt: Date,
    views: Number,
    readTime: String
  }, { strict: false }));

  // 1. Load Categories
  const categories = await Category.find({});
  const catMap = new Map();
  categories.forEach(c => catMap.set(c.slug, c._id));
  const defaultCatId = categories[0]?._id;

  // 2. Load Topics
  const topics = await Topic.find({});
  console.log(`Found ${topics.length} topics in database.`);

  // Update descriptions and categoryIds for all topics
  let updatedTopicsCount = 0;
  for (const topic of topics) {
    const slug = topic.slug || topic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const desc = TOPIC_DESCRIPTIONS[slug] || `In-depth reporting, tactical playbooks, and strategic analysis on #${topic.name}.`;
    
    // Assign best matching categoryId
    let catId = defaultCatId;
    if (slug.includes('ai') || slug.includes('deeptech') || slug.includes('robotics') || slug.includes('chips')) {
      catId = catMap.get('ai-deeptech') || defaultCatId;
    } else if (slug.includes('fintech') || slug.includes('crypto')) {
      catId = catMap.get('fintech') || defaultCatId;
    } else if (slug.includes('d2c') || slug.includes('retail') || slug.includes('beauty')) {
      catId = catMap.get('smbstory') || defaultCatId;
    } else if (slug.includes('herstory') || slug.includes('women') || slug.includes('gender')) {
      catId = catMap.get('her-story') || defaultCatId;
    } else if (slug.includes('social') || slug.includes('impact') || slug.includes('sustainability') || slug.includes('environment')) {
      catId = catMap.get('social-story') || defaultCatId;
    } else if (slug.includes('enterprise') || slug.includes('saas') || slug.includes('gcc')) {
      catId = catMap.get('enterprise') || defaultCatId;
    } else {
      catId = catMap.get('startups') || defaultCatId;
    }

    topic.description = desc;
    if (!topic.categoryIds || topic.categoryIds.length === 0) {
      topic.categoryIds = [catId];
    }
    topic.isActive = true;
    await topic.save();
    updatedTopicsCount++;
  }
  console.log(`Updated descriptions & categories for ${updatedTopicsCount} topics.`);

  // 3. For each topic, verify articles and add content if fewer than 4
  let totalNewArticlesCreated = 0;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const topicName = topic.name;
    const topicSlug = topic.slug;

    // Check existing articles
    const existingCount = await Article.countDocuments({
      status: 'published',
      $or: [
        { topicIds: topic._id },
        { topics: new RegExp(`^${topicName}$`, 'i') },
        { topics: new RegExp(`^${topicSlug}$`, 'i') },
        { title: new RegExp(topicName, 'i') }
      ]
    });

    const needed = Math.max(0, 4 - existingCount);
    if (needed > 0) {
      console.log(`Topic #${topicName} has ${existingCount} articles. Generating ${needed} rich articles...`);

      const articleTemplates = [
        {
          titleSuffix: 'The Definitive State of the Ecosystem in 2026',
          summaryPrefix: 'A rigorous editorial investigation into how leaders and emerging startups in'
        },
        {
          titleSuffix: 'How Emerging Builders Are Overcoming Operational Bottlenecks',
          summaryPrefix: 'Behind-the-scenes engineering audits, unit economics modeling, and turnaround journeys in'
        },
        {
          titleSuffix: 'Market Shifts, Regulatory Audits, and Capital Movements',
          summaryPrefix: 'Analyzing private equity term sheets, policy changes, and commercial tailwinds reshaping'
        },
        {
          titleSuffix: '5 Tactical Lessons from Top Operators in the Trenches',
          summaryPrefix: 'Unfiltered executive interviews revealing scaling benchmarks and customer retention rules in'
        }
      ];

      for (let j = 0; j < needed; j++) {
        const tmpl = articleTemplates[j % articleTemplates.length];
        const artTitle = `${topicName}: ${tmpl.titleSuffix}`;
        const artSlug = `${topicSlug}-${j + 1}-${Date.now().toString(36)}`;
        const author = AUTHORS[(i + j) % AUTHORS.length];
        const image = UNSPASH_IMAGES[(i * 3 + j) % UNSPASH_IMAGES.length];
        const publishedDate = new Date(Date.now() - (j * 86400000 * 2) - (i * 3600000));

        const newArt = new Article({
          title: artTitle,
          slug: artSlug,
          summary: `${tmpl.summaryPrefix} ${topicName}. Featuring exclusive founder interviews, unit economics breakdowns, and strategic forecasts for the year ahead.`,
          content: `
            <p class="lead-para">The rapid acceleration of innovation across <strong>${topicName}</strong> has rewritten operational playbooks, capital structures, and consumer expectations.</p>
            <h3>1. The Core Infrastructure Shift</h3>
            <p>Industry leaders are moving away from legacy architectures toward modern, resilient systems. First-principles technical rigor and sustainable unit economics now dominate strategic planning sessions.</p>
            <h3>2. Key Operational Lessons</h3>
            <p>Interviews with frontline founders demonstrate that customer retention, telemetry observability, and capital efficiency are the three definitive pillars separating market champions from casualties.</p>
            <blockquote>"Success in this vertical requires an uncompromising commitment to customer value and technical depth."</blockquote>
            <p>As the sector matures, cross-disciplinary collaborations and sovereign technology stacks will continue to define the next frontier of growth.</p>
          `,
          category: topic.categoryIds[0] || defaultCatId,
          topics: [topicName, 'Innovation', 'Spotlight'],
          topicIds: [topic._id],
          tags: [topicSlug, 'featured', 'analysis'],
          featuredImage: {
            url: image,
            alt: artTitle
          },
          author: {
            name: author.name,
            avatar: author.avatar,
            role: 'Senior Bureau Editor'
          },
          status: 'published',
          publishedAt: publishedDate,
          views: 3500 + (j * 1250) + (i * 120),
          readTime: `${5 + (j % 4)} min read`
        });

        await newArt.save();
        totalNewArticlesCreated++;
      }
    }
  }

  console.log(`\nAll done! Created ${totalNewArticlesCreated} new high-quality articles.`);
  console.log(`Every single topic in the database now has at least 4-6 published articles!`);
  process.exit(0);
}

seedAllTopicsContent().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
