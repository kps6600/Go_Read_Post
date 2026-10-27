import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Page from '../models/Page.js';
import Tag from '../models/Tag.js';
import Article from '../models/Article.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goreadpost';

async function seedPages() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Tag: chatgpt
  let chatgptTag = await Tag.findOne({ slug: 'chatgpt' });
  if (!chatgptTag) {
    chatgptTag = await Tag.create({
      name: 'ChatGPT',
      slug: 'chatgpt',
      description: 'Generative AI models, conversational AI architectures, LLMs, and OpenAI ChatGPT ecosystem coverage.',
      count: 0
    });
    console.log('Created tag: chatgpt');
  } else {
    console.log('Tag chatgpt already exists');
  }

  // Attach chatgpt tag to relevant AI articles if not already attached
  const aiArticles = await Article.find({ 
    $or: [
      { categoryName: /ai/i },
      { title: /ai|chatgpt|openai|intelligence|gpt/i },
      { content: /ai|chatgpt|openai|language model/i }
    ]
  }).limit(8);

  for (const art of aiArticles) {
    if (!art.tags) art.tags = [];
    if (!art.tags.includes('ChatGPT')) {
      art.tags.push('ChatGPT');
    }
    if (!art.tagIds) art.tagIds = [];
    if (!art.tagIds.some(t => t.toString() === chatgptTag._id.toString())) {
      art.tagIds.push(chatgptTag._id);
    }
    await art.save();
  }
  const chatgptCount = await Article.countDocuments({ tagIds: chatgptTag._id });
  chatgptTag.count = chatgptCount;
  await chatgptTag.save();
  console.log(`Updated chatgpt tag with ${chatgptCount} articles`);

  // 2. Page: contact
  const existingContact = await Page.findOne({ slug: 'contact' });
  if (!existingContact) {
    await Page.create({
      id: 'page_contact',
      title: 'Contact Us',
      slug: 'contact',
      brand: 'GoReadPost',
      description: 'Get in touch with the GoReadPost editorial bureau, partnerships desk, and media inquiries.',
      heroHeadline: 'Connect with GoReadPost',
      heroSubhead: 'Have a story pitch, partnership inquiry, or editorial feedback? Reach out to our team.',
      status: 'published',
      showInNav: true,
      order: 10,
      seo: {
        title: 'Contact Us | GoReadPost Editorial & Bureau',
        description: 'Get in touch with GoReadPost editors, business leads, and customer support.'
      },
      sections: [
        {
          id: 'sec_contact_hero',
          type: 'hero',
          order: 1,
          enabled: true,
          data: {
            badge: 'CONTACT & SUPPORT',
            headline: 'Let’s Connect With GoReadPost',
            subheadline: 'Our editorial, research, and enterprise partnership teams are available 24/7 across Bengaluru, Mumbai, and Delhi.',
            ctaPrimaryText: 'Send a Message',
            ctaPrimaryLink: '#contact'
          }
        },
        {
          id: 'sec_contact_form',
          type: 'contact',
          order: 2,
          enabled: true,
          data: {
            title: 'Editorial Bureau & Direct Inquiries',
            subtitle: 'Fill out the form below or reach our central desk directly.',
            email: 'contact@goreadpost.com',
            phone: '+91 (080) 4123-5678',
            address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038, India'
          }
        }
      ],
      publishedAt: new Date()
    });
    console.log('Created page: /contact');
  } else {
    console.log('Page /contact already exists');
  }

  // 3. Page: advertise
  const existingAdvertise = await Page.findOne({ slug: 'advertise' });
  if (!existingAdvertise) {
    await Page.create({
      id: 'page_advertise',
      title: 'Advertise With Us',
      slug: 'advertise',
      brand: 'GoReadPost',
      description: 'Partner with India’s leading technology, founders, and capital intelligence publication.',
      heroHeadline: 'Amplify Your Brand to 5M+ Founders, Decision Makers & Investors',
      heroSubhead: 'High-impact sponsored stories, native brand integration, newsletter takeovers, and executive events.',
      status: 'published',
      showInNav: true,
      order: 11,
      seo: {
        title: 'Advertise & Partner with GoReadPost | Media Kit 2026',
        description: 'Reach high-net-worth founders, venture capitalists, and technology leaders through GoReadPost native advertising.'
      },
      sections: [
        {
          id: 'sec_adv_hero',
          type: 'hero',
          order: 1,
          enabled: true,
          data: {
            badge: 'BRAND PARTNERSHIPS & MEDIA KIT',
            headline: 'Reach Founders, VCs, and High-Intent Leaders',
            subheadline: 'GoReadPost delivers premium native content, high-open newsletter sponsorships, and executive events tailored to high-growth tech brands.',
            ctaPrimaryText: 'Request Media Kit',
            ctaPrimaryLink: '#contact'
          }
        },
        {
          id: 'sec_adv_services',
          type: 'services',
          order: 2,
          enabled: true,
          data: {
            title: 'Advertising Formats & Programs',
            subtitle: 'Choose from multi-channel editorial packages designed for maximum market impact.',
            services: [
              {
                title: 'Sponsored Editorial Stories',
                description: 'Deep-dive founder feature stories produced by award-winning business journalists.',
                icon: 'FileText'
              },
              {
                title: 'Daily Newsletter Takeovers',
                description: 'Direct placement in morning executive briefing with 42% average open rate.',
                icon: 'Mail'
              },
              {
                title: 'Video & YSTV Features',
                description: 'Broadcast-quality founder interviews distributed across YouTube and social channels.',
                icon: 'Tv'
              },
              {
                title: 'Custom Research Reports',
                description: 'White-labeled industry sector benchmarks and data reports co-branded with GoReadPost.',
                icon: 'BarChart'
              }
            ]
          }
        },
        {
          id: 'sec_adv_contact',
          type: 'contact',
          order: 3,
          enabled: true,
          data: {
            title: 'Contact Advertising & Sponsorships Desk',
            subtitle: 'Request our 2026 Rate Card, Audience Demographics, and Case Studies.',
            email: 'advertise@goreadpost.com',
            phone: '+91 (080) 4123-5680',
            address: 'Ad Sales Bureau, Indiranagar, Bengaluru 560038'
          }
        }
      ],
      publishedAt: new Date()
    });
    console.log('Created page: /advertise');
  } else {
    console.log('Page /advertise already exists');
  }

  // 4. Page: editorial-policy
  const existingEdPolicy = await Page.findOne({ slug: 'editorial-policy' });
  if (!existingEdPolicy) {
    await Page.create({
      id: 'page_editorial_policy',
      title: 'Editorial Policy & Standards',
      slug: 'editorial-policy',
      brand: 'GoReadPost',
      description: 'Our commitment to truthful, rigorous, independent, and transparent business journalism.',
      heroHeadline: 'Editorial Independence, Accuracy & Ethical Standards',
      heroSubhead: 'GoReadPost adheres to the highest standards of journalistic integrity and accountability.',
      status: 'published',
      showInNav: false,
      order: 12,
      seo: {
        title: 'Editorial Policy & Verification Standards | GoReadPost',
        description: 'Learn about our rigorous fact-checking, conflict of interest, corrections, and editorial independence guidelines.'
      },
      sections: [
        {
          id: 'sec_ep_hero',
          type: 'hero',
          order: 1,
          enabled: true,
          data: {
            badge: 'JOURNALISTIC CODE OF ETHICS',
            headline: 'Editorial Policy & Verification Standards',
            subheadline: 'How we report, verify facts, handle conflicts of interest, and protect our readers’ trust.'
          }
        },
        {
          id: 'sec_ep_text',
          type: 'text',
          order: 2,
          enabled: true,
          data: {
            title: 'Our Principles of Reporting',
            content: `<h3>1. Truth and Accuracy</h3><p>GoReadPost is committed to fact-based reporting. Every data point, funding valuation, and revenue metric is cross-checked against regulatory filings (MCA, SEC) or dual independent on-the-record sources before publication.</p><h3>2. Independence and Impartiality</h3><p>Our editorial coverage is strictly insulated from advertising, venture investments, or commercial sponsorships. Sponsored native content is always prominently labeled with a badge and disclaimer.</p><h3>3. Conflicts of Interest</h3><p>Reporters and editors must disclose any personal financial investments, advisory roles, or close family ties to companies they cover. Writers are barred from trading stocks or tokens of companies covered within 30 days of reportage.</p><h3>4. Corrections & Transparency</h3><p>If an error of fact occurs, we correct it promptly with an editor’s note at the top of the story explaining what was amended and why.</p>`
          }
        }
      ],
      publishedAt: new Date()
    });
    console.log('Created page: /editorial-policy');
  } else {
    console.log('Page /editorial-policy already exists');
  }

  // 5. Page: privacy-policy
  const existingPrivacyPolicy = await Page.findOne({ slug: 'privacy-policy' });
  if (!existingPrivacyPolicy) {
    const existingPrivacy = await Page.findOne({ slug: 'privacy' });
    if (existingPrivacy) {
      await Page.create({
        id: 'page_privacy_policy',
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        brand: 'GoReadPost',
        description: existingPrivacy.description || 'Our commitment to protecting your personal data and privacy.',
        heroHeadline: 'Privacy Policy',
        heroSubhead: 'How GoReadPost collects, uses, and safeguards your personal information.',
        status: 'published',
        showInNav: false,
        order: 13,
        seo: {
          title: 'Privacy Policy | GoReadPost',
          description: 'Official privacy policy for GoReadPost readers, subscribers, and community members.'
        },
        sections: existingPrivacy.sections || [],
        publishedAt: new Date()
      });
      console.log('Created page: /privacy-policy (cloned from /privacy)');
    } else {
      await Page.create({
        id: 'page_privacy_policy',
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        brand: 'GoReadPost',
        description: 'Our commitment to protecting your personal data and privacy.',
        heroHeadline: 'Privacy Policy',
        heroSubhead: 'How GoReadPost collects, uses, and safeguards your personal information.',
        status: 'published',
        showInNav: false,
        order: 13,
        seo: {
          title: 'Privacy Policy | GoReadPost',
          description: 'Official privacy policy for GoReadPost readers, subscribers, and community members.'
        },
        sections: [
          {
            id: 'sec_pp_text',
            type: 'text',
            order: 1,
            enabled: true,
            data: {
              title: 'Data Collection & User Rights',
              content: '<p>GoReadPost respects your privacy. We collect minimal account data needed to provide newsletter delivery and saved story sync. We do not sell or broker your personal information to third parties.</p>'
            }
          }
        ],
        publishedAt: new Date()
      });
      console.log('Created page: /privacy-policy');
    }
  } else {
    console.log('Page /privacy-policy already exists');
  }

  await mongoose.disconnect();
  console.log('Seeding finished successfully');
}

seedPages().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
