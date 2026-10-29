import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Comment from '../models/Comment.js';
import Article from '../models/Article.js';
import Video from '../models/Video.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackCommentsPath = path.join(__dirname, '..', 'comments_data_store.json');

export async function ensureCommentsSeeded(force = false) {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      console.log('MongoDB not connected, skipping comments seeding.');
      return { count: 0, metrics: null };
    }

    const currentCount = await Comment.countDocuments();
    if (!force && currentCount >= 20) {
      console.log(`💬 Comments collection already has ${currentCount} comments in MongoDB.`);
      const allDbComments = await Comment.find({}).sort({ isPinned: -1, createdAt: -1 }).lean();
      return { count: currentCount, data: allDbComments };
    }

    console.log(`💬 Seeding / Synchronizing all discussions into MongoDB Comment collection...`);

    const articles = await Article.find({}).select('_id slug title category').lean();
    const videos = await Video.find({}).select('_id slug title').lean();

    const articleMap = new Map();
    articles.forEach(a => {
      if (a.slug) articleMap.set(a.slug.toLowerCase(), a);
    });

    const videoMap = new Map();
    videos.forEach(v => {
      if (v.slug) videoMap.set(v.slug.toLowerCase(), v);
    });

    const realArticlesForMapping = [
      articleMap.get('lead-hockey'),
      articleMap.get('pick-1'),
      articleMap.get('social-khadi-1'),
      articleMap.get('pick-3'),
      articleMap.get('pick-4'),
      articleMap.get('how-ai-is-transforming-indias-startup-ecosystem-muzawh39'),
      articleMap.get('techsparks-2024-bengaluru'),
      articleMap.get('sim-8'),
      articleMap.get('sim-7'),
      articleMap.get('sim-6'),
      articleMap.get('sim-5'),
      articleMap.get('sim-4'),
      articleMap.get('social-side-3'),
      articleMap.get('spotlight-1'),
      articleMap.get('spotlight-2')
    ].filter(Boolean);

    let fileComments = [];
    if (fs.existsSync(fallbackCommentsPath)) {
      try {
        fileComments = JSON.parse(fs.readFileSync(fallbackCommentsPath, 'utf8'));
      } catch (e) {
        console.warn('Error reading fallback file:', e.message);
      }
    }

    const curatedComments = [
      {
        storySlug: 'building-indias-sovereign-ai-stack-bhavish-aggarwal',
        contentType: 'video',
        contentTitle: 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
        author: 'Aditya Mathur',
        role: 'Principal, Stellaris Venture Partners',
        text: 'The breakdown on domestic AI token economics vs Silicon Valley cloud margin models is by far the most lucid explanation in Indian tech media right now.',
        likes: 42,
        isPinned: true,
        status: 'approved',
        adminReply: {
          text: 'Appreciate the feedback, Aditya. We spent 3 weeks verifying the compute amortisation figures with chip architects.',
          author: 'Editorial Desk',
          repliedAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        createdAt: new Date(Date.now() - 3600000 * 48)
      },
      {
        storySlug: 'building-indias-sovereign-ai-stack-bhavish-aggarwal',
        contentType: 'video',
        contentTitle: 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
        author: 'Rohit Shenoy',
        role: 'VP Engineering, Sarvam AI',
        text: 'Crucial point about megawatt power distribution and co-locating datacenters directly next to solar farms in southern India. Thermal management is where software meets hard reality.',
        likes: 29,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 36)
      },
      {
        storySlug: 'building-indias-sovereign-ai-stack-bhavish-aggarwal',
        contentType: 'video',
        contentTitle: 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
        author: 'Priya Sundaram',
        role: 'Founder, IndicFlow',
        text: 'Krutrim’s approach to synthetic vernacular token generation solves the massive context drop typical of western foundation models on regional scripts.',
        likes: 18,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 28)
      },
      {
        storySlug: 'building-indias-sovereign-ai-stack-bhavish-aggarwal',
        contentType: 'video',
        contentTitle: 'Building India’s Sovereign AI Stack: Bhavish Aggarwal on Krutrim, Chips & Gigafactories',
        author: 'CryptoMiner99',
        role: 'Web3 Trader',
        text: 'Crypto pump incoming! Invest in new AI coin on our Telegram link: t.me/free_crypto_ai_signals',
        likes: 0,
        isPinned: false,
        status: 'rejected',
        rejection_reason: 'Spam, cryptocurrency solicitation, and unauthorized Telegram invite',
        createdAt: new Date(Date.now() - 3600000 * 6)
      },
      {
        storySlug: 'startup-dilution-nithin-kamath-bootstrapping-profit',
        contentType: 'video',
        contentTitle: 'The Hard Truth About Startup Dilution: Nithin Kamath on Bootstrapping to ₹4,000 Cr Profit',
        author: 'Siddharth Rao',
        role: 'General Partner, Nexus Venture Partners',
        text: 'Nithin Kamath’s point on customer acquisition cost compounding as revenue grows is something founders discover far too late. Bootstrapping forces unit economics discipline from day zero.',
        likes: 54,
        isPinned: true,
        status: 'approved',
        adminReply: {
          text: 'Thanks Siddharth. Nithin also elaborated on why secondary share sales during bull cycles can inadvertently misalign executive priorities.',
          author: 'Editorial Desk',
          repliedAt: new Date(Date.now() - 3600000 * 18).toISOString()
        },
        createdAt: new Date(Date.now() - 3600000 * 40)
      },
      {
        storySlug: 'startup-dilution-nithin-kamath-bootstrapping-profit',
        contentType: 'video',
        contentTitle: 'The Hard Truth About Startup Dilution: Nithin Kamath on Bootstrapping to ₹4,000 Cr Profit',
        author: 'Meera Krishnan',
        role: 'CFO, Finscale Labs',
        text: 'The mathematical breakdown of retaining 90% equity at ₹1,000 Cr valuation versus 12% equity at ₹10,000 Cr after 5 rounds of preference overhang needs to be taught in business schools.',
        likes: 38,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 20)
      },
      {
        storySlug: 'startup-dilution-nithin-kamath-bootstrapping-profit',
        contentType: 'video',
        contentTitle: 'The Hard Truth About Startup Dilution: Nithin Kamath on Bootstrapping to ₹4,000 Cr Profit',
        author: 'Rahul Aggarwal',
        role: 'Co-founder, GrowthEngine',
        text: 'Has anyone modeled the tax impact of Zerodha’s dividend distribution model versus buyback under the latest finance bill amendments?',
        likes: 7,
        isPinned: false,
        status: 'pending_review',
        createdAt: new Date(Date.now() - 3600000 * 4)
      },
      {
        storySlug: 'ghazal-alagh-mamaearth-honasa-fmcg-moat',
        contentType: 'video',
        contentTitle: 'From Garage to Public Listing: Ghazal Alagh on Scaling Honasa & The FMCG Moat',
        author: 'Kavita Menon',
        role: 'D2C Brand Strategist',
        text: 'The transition from D2C pure-play to general trade and modern trade distribution is the graveyard of most consumer brands. Ghazal’s strategy on distributor credit cycles is gold dust.',
        likes: 33,
        isPinned: true,
        status: 'approved',
        adminReply: {
          text: 'Spot on Kavita. Their Kirana penetration in tier-2 and tier-3 towns accounted for nearly 41% of offline volume expansion.',
          author: 'Editorial Desk',
          repliedAt: new Date(Date.now() - 3600000 * 12).toISOString()
        },
        createdAt: new Date(Date.now() - 3600000 * 30)
      },
      {
        storySlug: 'ghazal-alagh-mamaearth-honasa-fmcg-moat',
        contentType: 'video',
        contentTitle: 'From Garage to Public Listing: Ghazal Alagh on Scaling Honasa & The FMCG Moat',
        author: 'Devendra Joshi',
        role: 'Equity Research Analyst',
        text: 'Mamaearth’s marketing spend efficiency has improved dramatically post-IPO. The multi-brand house strategy with The Derma Co and Aqualogica seems to be derisking concentration.',
        likes: 21,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 15)
      },
      {
        storySlug: 'ghazal-alagh-mamaearth-honasa-fmcg-moat',
        contentType: 'video',
        contentTitle: 'From Garage to Public Listing: Ghazal Alagh on Scaling Honasa & The FMCG Moat',
        author: 'BrandBooster Pro',
        role: 'Growth Marketing Agency',
        text: 'Check out our agency website for 10x guaranteed D2C organic reach within 30 days! Visit bit.ly/spam-marketing-d2c',
        likes: 0,
        isPinned: false,
        status: 'rejected',
        rejection_reason: 'Spam or promotional content with unauthorized external link',
        createdAt: new Date(Date.now() - 3600000 * 8)
      },
      {
        storySlug: 'lead-hockey',
        contentType: 'article',
        contentTitle: "Lalremsiami's strike, Bichu Devi's wall of resistance power India to hockey gold, LA Olympics berth",
        author: 'Harpreet Singh Sandhu',
        role: 'Former National Hockey Player',
        text: 'Bichu Devi’s stick save in the final 90 seconds under intense Japanese penalty corner pressure was world-class. Defending short corners with that composure earns Olympic medals.',
        likes: 47,
        isPinned: true,
        status: 'approved',
        adminReply: {
          text: 'Incredible tournament performance, Harpreet. The speed on counter-attack transitions proved decisive throughout the third quarter.',
          author: 'Editorial Desk',
          repliedAt: new Date(Date.now() - 3600000 * 14).toISOString()
        },
        createdAt: new Date(Date.now() - 3600000 * 42)
      },
      {
        storySlug: 'lead-hockey',
        contentType: 'article',
        contentTitle: "Lalremsiami's strike, Bichu Devi's wall of resistance power India to hockey gold, LA Olympics berth",
        author: 'Tanvi Saxena',
        role: 'Sports Journalist & Columnist',
        text: 'Lalremsiami’s agility in the circle created the space needed to overcome Japan’s low block defence. Remarkable discipline from coach Harendra Singh’s squad.',
        likes: 24,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 22)
      },
      {
        storySlug: 'lead-hockey',
        contentType: 'article',
        contentTitle: "Lalremsiami's strike, Bichu Devi's wall of resistance power India to hockey gold, LA Olympics berth",
        author: 'Amitabh Sen',
        role: 'Sports Fan',
        text: 'Will the government sanction the full European training tour budget before the LA Olympic qualifiers next spring?',
        likes: 5,
        isPinned: false,
        status: 'pending_review',
        createdAt: new Date(Date.now() - 3600000 * 2)
      },
      {
        storySlug: 'pick-3',
        contentType: 'article',
        contentTitle: 'Telangana, Maharashtra, UP lead state rankings in data centre policy attractiveness: S&P Global',
        author: 'Anand Mahindra Iyer',
        role: 'Cloud Infrastructure Director, Hyperscale India',
        text: 'Renewable power wheeling tariffs and land clearance timelines are the twin factors driving Navi Mumbai and Hyderabad data center corridors. UP is closing the gap fast with Noida.',
        likes: 31,
        isPinned: true,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 35)
      },
      {
        storySlug: 'pick-3',
        contentType: 'article',
        contentTitle: 'Telangana, Maharashtra, UP lead state rankings in data centre policy attractiveness: S&P Global',
        author: 'Vikram Joshi',
        role: 'Power Systems Architect',
        text: 'The grid stability requirements for high-density 100kW AI racks require dedicated substations. S&P report highlights this as the single biggest bottleneck for 2027.',
        likes: 19,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 16)
      },
      {
        storySlug: 'pick-3',
        contentType: 'article',
        contentTitle: 'Telangana, Maharashtra, UP lead state rankings in data centre policy attractiveness: S&P Global',
        author: 'Anonymous Investor',
        role: 'Real Estate Speculator',
        text: 'Buy land near Jewar airport immediately! 500% returns guaranteed within 18 months call 9876543210',
        likes: 0,
        isPinned: false,
        status: 'rejected',
        rejection_reason: 'Spam, speculative promotional solicitation, and private contact details',
        createdAt: new Date(Date.now() - 3600000 * 5)
      },
      {
        storySlug: 'social-khadi-1',
        contentType: 'article',
        contentTitle: 'Four Indian brands putting a new spin on khadi',
        author: 'Shalini Narang',
        role: 'Sustainable Fashion Curator',
        text: 'Merging hand-spun organic khadi with contemporary unisex silhouettes is how heritage crafts survive commercial commoditization. Beautiful profile of the weavers.',
        likes: 27,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 25)
      },
      {
        storySlug: 'pick-4',
        contentType: 'article',
        contentTitle: 'White-collar hiring grows 2% led by AI/ML sector in Sep: Report',
        author: 'Rajesh Nair',
        role: 'Head of Talent Acquisition, TechGlobal',
        text: 'Specialized LLM fine-tuning and agentic workflow orchestration roles are seeing 40% salary premiums, while junior generalist QA roles are contracting significantly.',
        likes: 22,
        isPinned: false,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 19)
      },
      {
        storySlug: 'pick-4',
        contentType: 'article',
        contentTitle: 'White-collar hiring grows 2% led by AI/ML sector in Sep: Report',
        author: 'Kunal Shahani',
        role: 'Software Engineer',
        text: 'Are there any verified salary benchmarks published for ML platform engineers in Pune and Hyderabad?',
        likes: 3,
        isPinned: false,
        status: 'pending_review',
        createdAt: new Date(Date.now() - 3600000 * 1)
      }
    ];

    const preparedDocs = [];
    const processedKeys = new Set();

    function addDoc(c, fallbackIdx = 0) {
      let slug = (c.storySlug || '').trim().toLowerCase();
      
      if (slug === 'from-kitchen-experiments-to-ipo-ghazal-alagh-on-building-a-1-500-cr-beauty-congl') {
        slug = 'ghazal-alagh-mamaearth-honasa-fmcg-moat';
        c.contentType = 'video';
      }

      let isVideo = c.contentType === 'video' || videoMap.has(slug);
      let articleDoc = articleMap.get(slug);
      let videoDoc = videoMap.get(slug);

      if (!articleDoc && !videoDoc && realArticlesForMapping.length > 0) {
        articleDoc = realArticlesForMapping[fallbackIdx % realArticlesForMapping.length];
        slug = articleDoc.slug.toLowerCase();
        isVideo = false;
      }

      const title = c.contentTitle || (videoDoc ? videoDoc.title : (articleDoc ? articleDoc.title : 'Discussion'));
      const docKey = `${slug}:::${(c.author || '').toLowerCase()}:::${(c.text || '').slice(0, 30).toLowerCase()}`;
      if (processedKeys.has(docKey)) return;
      processedKeys.add(docKey);

      let validId = null;
      if (c._id && mongoose.isValidObjectId(c._id)) {
        validId = new mongoose.Types.ObjectId(c._id);
      } else {
        validId = new mongoose.Types.ObjectId();
      }

      let status = (c.status || 'approved').toLowerCase();
      if (status === 'pending') status = 'pending_review';

      if (status === 'approved') {
        if (fallbackIdx % 11 === 4) status = 'pending_review';
        else if (fallbackIdx % 19 === 7) {
          status = 'rejected';
          if (!c.rejection_reason) c.rejection_reason = 'Off-topic or promotional commentary';
        }
        else if (fallbackIdx % 23 === 13) status = 'hidden';
      }

      preparedDocs.push({
        _id: validId,
        storySlug: slug,
        contentType: isVideo ? 'video' : 'article',
        contentTitle: title,
        videoId: videoDoc ? String(videoDoc._id) : null,
        articleId: articleDoc ? articleDoc._id : null,
        userId: null,
        userEmail: c.userEmail || '',
        isEdited: Boolean(c.isEdited),
        isPinned: Boolean(c.isPinned),
        adminReply: c.adminReply && c.adminReply.text ? {
          text: c.adminReply.text,
          author: c.adminReply.author || 'Editorial Desk',
          repliedAt: c.adminReply.repliedAt ? new Date(c.adminReply.repliedAt) : new Date()
        } : { text: '', author: '', repliedAt: null },
        rejection_reason: c.rejection_reason || '',
        author: c.author || 'Community Reader',
        role: c.role || 'Reader Contributor',
        text: c.text || 'Insightful perspective on this piece.',
        likes: typeof c.likes === 'number' ? c.likes : 0,
        likedBy: Array.isArray(c.likedBy) ? c.likedBy : [],
        status: status,
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(Date.now() - fallbackIdx * 3600000),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date()
      });
    }

    curatedComments.forEach((c, idx) => addDoc(c, idx));
    fileComments.forEach((c, idx) => addDoc(c, idx + 10));

    console.log(`Total prepared comments to insert: ${preparedDocs.length}`);

    const bulkOps = preparedDocs.map(doc => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true
      }
    }));

    const res = await Comment.bulkWrite(bulkOps);
    console.log(`MongoDB Comment bulkWrite result: matched=${res.matchedCount}, upserted=${res.upsertedCount}, modified=${res.modifiedCount}`);

    const allDbComments = await Comment.find({}).sort({ isPinned: -1, createdAt: -1 }).lean();
    console.log(`Total comments now in MongoDB: ${allDbComments.length}`);

    const countsByStatus = {};
    const countsByType = {};
    allDbComments.forEach(c => {
      countsByStatus[c.status] = (countsByStatus[c.status] || 0) + 1;
      countsByType[c.contentType] = (countsByType[c.contentType] || 0) + 1;
    });
    console.log('Comments by status in MongoDB:', countsByStatus);
    console.log('Comments by type in MongoDB:', countsByType);

    // Save synchronized comments to comments_data_store.json
    const fileOutput = allDbComments.map(c => ({
      _id: String(c._id),
      id: String(c._id),
      storySlug: c.storySlug,
      contentType: c.contentType,
      contentTitle: c.contentTitle,
      videoId: c.videoId || null,
      articleId: c.articleId ? String(c.articleId) : null,
      userId: c.userId ? String(c.userId) : null,
      userEmail: c.userEmail || '',
      author: c.author,
      role: c.role,
      text: c.text,
      likes: c.likes || 0,
      likedBy: c.likedBy || [],
      isEdited: Boolean(c.isEdited),
      isPinned: Boolean(c.isPinned),
      adminReply: c.adminReply && c.adminReply.text ? {
        text: c.adminReply.text,
        author: c.adminReply.author || 'Editorial Desk',
        repliedAt: c.adminReply.repliedAt ? new Date(c.adminReply.repliedAt).toISOString() : null
      } : null,
      status: c.status,
      rejection_reason: c.rejection_reason || '',
      createdAt: new Date(c.createdAt).toISOString()
    }));

    fs.writeFileSync(fallbackCommentsPath, JSON.stringify(fileOutput, null, 2), 'utf8');
    console.log(`Saved ${fileOutput.length} comments to backend/comments_data_store.json.`);

    return {
      count: allDbComments.length,
      metrics: {
        totalComments: allDbComments.length,
        countsByStatus,
        countsByType
      },
      data: allDbComments
    };
  } catch (err) {
    console.error('Error during comments seeding:', err);
    throw err;
  }
}

if (process.argv[1] && process.argv[1].endsWith('seedComments.js')) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goreadpost';
  mongoose.connect(MONGODB_URI).then(async () => {
    await ensureCommentsSeeded(true);
    await mongoose.disconnect();
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

