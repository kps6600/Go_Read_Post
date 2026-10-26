import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goreadpost';

const NAV_TOPICS = [
  {
    name: 'Digital Public Infrastructure (DPI)',
    slug: 'dpi',
    description: '',
    categorySlug: 'technology',
    badge: 'Sovereign'
  },
  {
    name: 'Artificial Intelligence & LLMs',
    slug: 'artificial-intelligence',
    description: 'Frontier foundation models, sovereign GPU compute clusters, reasoning architectures, and enterprise AI orchestration.',
    categorySlug: 'ai-deeptech',
    badge: 'Frontier'
  },
  {
    name: 'Venture Capital & Deals',
    slug: 'venture-capital',
    description: 'Seed-to-IPO cap table movements, term sheet covenants, LP distribution cycles, and private market valuation resets.',
    categorySlug: 'startups',
    badge: 'Hot'
  },
  {
    name: 'Early-Stage Seed & Pre-A',
    slug: 'seed-funding',
    description: 'First institutional capital, angel syndicates, minimum viable product audits, and pre-seed founder playbooks.',
    categorySlug: 'startups',
    badge: 'Seed'
  },
  {
    name: 'Climate Tech & Clean Energy',
    slug: 'climate-tech',
    description: 'Solid-state battery chemistries, distributed solar microgrids, green hydrogen economics, and carbon credit provenance.',
    categorySlug: 'social-story',
    badge: 'Green'
  },
  {
    name: 'Web3 & Decentralized',
    slug: 'web3',
    description: 'Zero-knowledge proofs, real-world asset (RWA) tokenization, decentralized compute networks, and regulatory compliance.',
    categorySlug: 'fintech',
    badge: 'Crypto'
  },
  {
    name: 'B2B SaaS & Cloud',
    slug: 'saas',
    description: 'Net dollar retention benchmarks, developer tooling, Kubernetes-native devops, and cloud optimization architectures.',
    categorySlug: 'enterprise',
    badge: 'B2B'
  },
  {
    name: 'Unicorns & Late Stage',
    slug: 'unicorns',
    description: 'Billion-dollar valuations, private equity secondary liquidity, governance audits, and pre-IPO organizational design.',
    categorySlug: 'startups',
    badge: 'Scale'
  },
  {
    name: 'IPO & Public Markets',
    slug: 'ipo',
    description: 'Draft Red Herring Prospectus (DRHP) analyses, anchor investor allocations, post-listing earnings audits, and retail subscriptions.',
    categorySlug: 'startups',
    badge: 'Public'
  },
  {
    name: 'Sovereign Compute & Chips',
    slug: 'compute',
    description: 'Sovereign wafer fabrication facilities, RISC-V open architecture silicon, packaging testing units, and design talent.',
    categorySlug: 'ai-deeptech',
    badge: 'Hardware'
  },
  {
    name: 'Cybersecurity & Defense Tech',
    slug: 'cyber',
    description: 'Zero-trust network architectures, LLM jailbreak defense, sovereign cloud cryptography, and critical infrastructure resilience.',
    categorySlug: 'enterprise',
    badge: 'Defense'
  },
  {
    name: 'Robotics & Automation',
    slug: 'robotics',
    description: 'Autonomous warehouse fleets, spatial computer vision, sovereign wafer design, and industrial manipulators.',
    categorySlug: 'ai-deeptech',
    badge: 'Robotics'
  }
];

const UNSPASH_IMAGES = [
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
];

const AUTHORS = [
  { name: 'Dr. Arvind Ramesh', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { name: 'Neha Singhania', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80' },
  { name: 'Kunal Mehra', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { name: 'Pratiksha Bannerjee', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' }
];

async function seedNavTopics() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

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

  const categories = await Category.find({});
  const catMap = new Map();
  categories.forEach(c => catMap.set(c.slug, c._id));
  const defaultCatId = categories[0]?._id;

  for (let i = 0; i < NAV_TOPICS.length; i++) {
    const navT = NAV_TOPICS[i];
    let topic = await Topic.findOne({ slug: navT.slug });
    const catId = catMap.get(navT.categorySlug) || defaultCatId;

    if (!topic) {
      console.log(`Creating missing topic: ${navT.name} (${navT.slug})`);
      topic = new Topic({
        name: navT.name,
        slug: navT.slug,
        description: navT.description,
        categoryIds: [catId],
        isActive: true
      });
      await topic.save();
    } else {
      topic.name = navT.name;
      topic.description = navT.description;
      topic.categoryIds = [catId];
      topic.isActive = true;
      await topic.save();
    }

    // Check articles count for this topic
    const count = await Article.countDocuments({
      status: 'published',
      $or: [
        { topicIds: topic._id },
        { topics: new RegExp(`^${navT.slug}$`, 'i') },
        { topics: new RegExp(`^${navT.name}$`, 'i') }
      ]
    });

    if (count < 4) {
      const needed = 4 - count;
      console.log(`Topic #${navT.name} needs ${needed} more articles. Creating...`);

      const headlines = [
        `How ${navT.name} Is Driving the Next $100B Wave Across India`,
        `The Sovereign Architecture of ${navT.name}: Security, Scale & Speed`,
        `Unfiltered Executive Audit: Behind the Scenes of ${navT.name} Deployment`,
        `Why Global Institutional Capital Is Pouring Into ${navT.name}`
      ];

      for (let j = 0; j < needed; j++) {
        const title = headlines[j % headlines.length];
        const artSlug = `${navT.slug}-story-${j + 1}-${Date.now().toString(36)}`;
        const author = AUTHORS[(i + j) % AUTHORS.length];
        const image = UNSPASH_IMAGES[(i * 2 + j) % UNSPASH_IMAGES.length];

        const art = new Article({
          title,
          slug: artSlug,
          summary: `Exclusive reporting on ${navT.name}. Inspecting architectural benchmarks, transaction throughput, regulatory guardrails, and commercial scale.`,
          content: `
            <p class="lead-para">The rapid expansion of <strong>${navT.name}</strong> represents one of the most significant structural transformations across the modern digital economy.</p>
            <h3>1. The Foundation Layer</h3>
            <p>From architectural resilience to zero-trust compliance, engineering teams are proving that open standards and sovereign technology stacks outperform closed legacy silos.</p>
            <h3>2. Real-World Economic Impact</h3>
            <p>Transaction velocity, friction reduction, and cost compression are delivering massive tailwinds to businesses and end-consumers alike.</p>
            <blockquote>"The velocity of innovation in ${navT.name} is setting a benchmark for the rest of the world."</blockquote>
            <p>GoReadPost will continue to chronicle the builders, policymakers, and engineers leading this charge.</p>
          `,
          category: catId,
          topics: [navT.name, 'Innovation', 'Spotlight'],
          topicIds: [topic._id],
          tags: [navT.slug, 'featured', 'dpi', 'analysis'],
          featuredImage: {
            url: image,
            alt: title
          },
          author: {
            name: author.name,
            avatar: author.avatar,
            role: 'Senior Bureau Editor'
          },
          status: 'published',
          publishedAt: new Date(Date.now() - (j * 86400000 * 2)),
          views: 6500 + (j * 1500),
          readTime: `${6 + (j % 3)} min read`
        });

        await art.save();
      }
    }
  }

  console.log('All navigation topics verified and seeded successfully!');
  process.exit(0);
}

seedNavTopics().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
