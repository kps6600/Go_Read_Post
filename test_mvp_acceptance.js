// test_mvp_acceptance.js
// Automated verification for Section 47 MVP Acceptance Tests

const BASE_API = 'http://localhost:5000/api';

async function runTests() {
  console.log('==========================================================');
  console.log('RUNNING SECTION 47 MVP ACCEPTANCE TESTS (LIVE BACKEND & DB)');
  console.log('==========================================================\n');

  // STEP 0: Admin Authentication
  console.log('Step 0: Authenticating Super Admin...');
  const loginRes = await fetch(`${BASE_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@goreadpost.com', password: 'Admin@12345' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.token || loginJson.data?.token;
  if (!token) {
    throw new Error('Login failed: ' + JSON.stringify(loginJson));
  }
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log('✓ Admin authenticated successfully!\n');

  // TEST 1 — NAVBAR MANAGEMENT
  console.log('--- TEST 1: NAVBAR MANAGEMENT ---');
  // 1. Create Parent "Technology"
  console.log('1. Creating top-level menu item "Technology"...');
  const techMenuRes = await fetch(`${BASE_API}/admin/navigation`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Technology',
      slug: 'technology',
      url: '/technology',
      type: 'dropdown',
      order: 8,
      isActive: true,
      openInNewTab: false
    })
  });
  const techMenuJson = await techMenuRes.json();
  const techId = techMenuJson.data._id;
  console.log(`✓ "Technology" menu created with ID: ${techId}`);

  // 2. Add children: AI, SaaS, Cybersecurity
  console.log('2. Adding child items: AI, SaaS, Cybersecurity...');
  const aiRes = await fetch(`${BASE_API}/admin/navigation`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'AI',
      slug: 'ai',
      url: '/search?q=ai',
      type: 'link',
      parentId: techId,
      order: 1,
      isActive: true
    })
  });
  const saasRes = await fetch(`${BASE_API}/admin/navigation`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'SaaS',
      slug: 'saas',
      url: '/search?q=saas',
      type: 'link',
      parentId: techId,
      order: 2,
      isActive: true
    })
  });
  const cyberRes = await fetch(`${BASE_API}/admin/navigation`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Cybersecurity',
      slug: 'cybersecurity',
      url: '/search?q=cybersecurity',
      type: 'link',
      parentId: techId,
      order: 3,
      isActive: true
    })
  });
  console.log('✓ All 3 child menus created under "Technology"');

  // 3. Verify Public GET /api/navigation returns Technology with children
  const publicNavRes = await fetch(`${BASE_API}/navigation`);
  const publicNavJson = await publicNavRes.json();
  const foundTech = publicNavJson.data.find(item => item.title === 'Technology' || item.slug === 'technology');
  if (!foundTech) throw new Error('FAIL: "Technology" not found in public navigation tree');
  if (!foundTech.children || foundTech.children.length !== 3) {
    throw new Error(`FAIL: "Technology" children count is ${foundTech.children?.length}, expected 3`);
  }
  console.log('✓ TEST 1 PASSED: "Technology" appears in public navbar tree with children:', 
    foundTech.children.map(c => c.title).join(', '));
  console.log('---------------------------------\n');

  // TEST 2 — ARTICLE MANAGEMENT
  console.log('--- TEST 2: ARTICLE / POST MANAGEMENT ---');
  const testSlug = 'how-ai-is-transforming-indias-startup-ecosystem';
  try {
    const staleRes = await fetch(`${BASE_API}/articles/${testSlug}`);
    const staleJson = await staleRes.json();
    if (staleJson.data?._id) {
      await fetch(`${BASE_API}/admin/articles/${staleJson.data._id}`, { method: 'DELETE', headers: authHeaders });
    }
  } catch (e) {}
  console.log(`1. Publishing new article with slug "${testSlug}"...`);
  const articlePayload = {
    title: "How AI is transforming India's startup ecosystem",
    slug: testSlug,
    subtitle: 'Founders are using AI to build faster and smarter businesses.',
    excerpt: 'Indian tech founders share how AI models are driving unit economics.',
    content: '<p>Artificial intelligence is fundamentally revolutionizing venture building across India. Builders from Bengaluru to Gurgaon are deploying autonomous agentic pipelines.</p><h2>The Multiplier Effect</h2><p>Rather than hiring bloated headcounts, founders are leveraging foundational models to write code, conduct due diligence, and orchestrate customer support.</p>',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
      alt: 'AI in India Startups',
      caption: 'AI founders scale across Bangalore',
      credit: 'GoReadPost Tech Desk'
    },
    authorName: 'Kamlesh Sharma',
    authorTitle: 'Senior Technology Correspondent',
    categoryName: 'Technology',
    topics: ['AI', 'Startups', 'FinTech'],
    tags: ['AI', 'Startup', 'India', 'Technology', 'GenAI'],
    contentType: 'Article',
    readingTime: '5 min read',
    isFeatured: true,
    isTrending: true,
    isBreaking: false,
    status: 'published',
    publishedAt: new Date().toISOString(),
    seo: {
      title: "How AI is transforming India's startup ecosystem — GoReadPost",
      description: "Indian tech founders share how AI models are driving unit economics.",
      keywords: "AI startups, India, Technology, GenAI"
    }
  };

  const createArticleRes = await fetch(`${BASE_API}/admin/articles`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(articlePayload)
  });
  const createArticleJson = await createArticleRes.json();
  if (!createArticleJson.success) throw new Error('Failed to create article: ' + JSON.stringify(createArticleJson));
  const createdArticleId = createArticleJson.data._id;
  console.log(`✓ Article created successfully with ID: ${createdArticleId}`);

  // Fetch Public Article by Slug
  console.log(`2. Fetching public article from GET /api/articles/${testSlug}...`);
  const publicArticleRes = await fetch(`${BASE_API}/articles/${testSlug}`);
  const publicArticleJson = await publicArticleRes.json();
  if (!publicArticleJson.success || !publicArticleJson.data) {
    throw new Error(`FAIL: Public article not returned for slug ${testSlug}`);
  }
  console.log('✓ TEST 2 PASSED: Public article retrieved successfully:', {
    title: publicArticleJson.data.title,
    author: publicArticleJson.data.authorName,
    views: publicArticleJson.data.views,
    category: publicArticleJson.data.categoryName
  });
  console.log('---------------------------------\n');

  // TEST 3 — HOMEPAGE INTEGRATION
  console.log('--- TEST 3: HOMEPAGE INTEGRATION ---');
  const featuredArticlesRes = await fetch(`${BASE_API}/articles?featured=true`);
  const featuredArticlesJson = await featuredArticlesRes.json();
  const isFoundInFeatured = featuredArticlesJson.data.some(a => a.slug === testSlug);
  if (!isFoundInFeatured) {
    throw new Error('FAIL: Published featured article not found in GET /api/articles?featured=true');
  }
  console.log('✓ TEST 3 PASSED: Article is present in featured articles pipeline for homepage display!');
  console.log('---------------------------------\n');

  // TEST 4 — EDIT / UPDATE ARTICLE
  console.log('--- TEST 4: EDIT ARTICLE ---');
  console.log('1. Updating article title and content in Admin CMS...');
  const updatedTitle = "How AI is transforming India's startup ecosystem (Updated Edition)";
  const updateRes = await fetch(`${BASE_API}/admin/articles/${createdArticleId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      title: updatedTitle,
      content: '<p>Updated live content from Admin CMS workbench.</p>'
    })
  });
  const updateJson = await updateRes.json();
  if (!updateJson.success) throw new Error('Update failed: ' + JSON.stringify(updateJson));

  const checkUpdatedPublicRes = await fetch(`${BASE_API}/articles/${testSlug}`);
  const checkUpdatedPublicJson = await checkUpdatedPublicRes.json();
  if (checkUpdatedPublicJson.data.title !== updatedTitle) {
    throw new Error(`FAIL: Expected updated title "${updatedTitle}", got "${checkUpdatedPublicJson.data.title}"`);
  }
  console.log('✓ TEST 4 PASSED: Updated article title immediately reflected in public endpoint!');
  console.log('---------------------------------\n');

  // TEST 5 — DELETE ARTICLE
  console.log('--- TEST 5: DELETE ARTICLE ---');
  console.log(`1. Deleting article ID ${createdArticleId}...`);
  const deleteRes = await fetch(`${BASE_API}/admin/articles/${createdArticleId}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const deleteJson = await deleteRes.json();
  if (!deleteJson.success) throw new Error('Delete failed: ' + JSON.stringify(deleteJson));
  console.log('✓ Article deleted via Admin API.');

  console.log(`2. Verifying public article URL /api/articles/${testSlug} returns 404...`);
  const verify404Res = await fetch(`${BASE_API}/articles/${testSlug}`);
  if (verify404Res.status === 404) {
    console.log(`✓ Status code: 404 (Not Found) as expected!`);
  } else {
    throw new Error(`FAIL: Expected 404 status code, got ${verify404Res.status}`);
  }
  console.log('✓ TEST 5 PASSED: Deleted article correctly returns 404 / Article Not Found.');
  console.log('---------------------------------\n');

  console.log('==========================================================');
  console.log('ALL 5 MVP ACCEPTANCE TESTS COMPLETED SUCCESSFULLY!');
  console.log('==========================================================');
}

runTests().catch(err => {
  console.error('\n❌ ACCEPTANCE TEST ERROR:', err.message);
  process.exit(1);
});
