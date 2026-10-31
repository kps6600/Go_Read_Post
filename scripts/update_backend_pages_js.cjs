const fs = require('fs');

const pagesJsPath = 'backend/routes/pages.js';
let code = fs.readFileSync(pagesJsPath, 'utf8');

const oldSectionsRegex = /id:\s*"latest"[\s\S]*?sections:\s*\[[\s\S]*?\{[\s\S]*?id:\s*"latest_hero"[\s\S]*?category_startups[\s\S]*?\}\s*,\s*\{\s*id:\s*"newsletter"[\s\S]*?\}\s*\]/;

const newLatestConfig = `id: "latest",
    title: "Latest Articles",
    slug: "latest",
    brand: "GoReadPost",
    description: "Chronological reporting, breaking investigations, venture intelligence, and real-time newsroom dispatches.",
    heroHeadline: "Latest Articles & Dispatches",
    heroSubhead: "Unfiltered founder reporting, deep tech breakthroughs, and market movements updated continuously.",
    heroBanner: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&auto=format&fit=crop&q=80",
    status: "published",
    showInNav: true,
    order: 2,
    seo: {
      title: "Latest Articles & Newsroom Dispatches | GoReadPost",
      description: "Real-time dispatches, founder stories, deeptech, venture capital reporting, and latest scoops.",
      keywords: ["latest articles", "breaking news", "startups", "technology", "venture capital"]
    },
    sections: [
      {
        id: "latest_feed",
        type: "stories_feed",
        order: 1,
        enabled: true,
        data: {
          title: "Latest Articles",
          heading: "Latest Articles",
          subtitle: "Chronological reporting, breaking investigations, venture intelligence, and real-time newsroom dispatches.",
          category: "",
          limit: 16,
          viewAllText: "Load More Stories",
          viewAllUrl: "/latest"
        }
      },
      {
        id: "newsletter",
        type: "newsletter",
        order: 2,
        enabled: true,
        title: "Newsletter Subscription Banner",
        data: {
          title: "Newsletter Subscription Banner",
          heading: "Newsletter Subscription Banner",
          headline: "Get the Latest Blogs Delivered to Your Inbox",
          subtitle: "Unfiltered insights on venture capital, frontier tech, and high-growth leadership directly in your inbox.",
          placeholder: "Enter your email address",
          buttonText: "Subscribe"
        }
      }
    ]`;

if (code.match(oldSectionsRegex)) {
  code = code.replace(oldSectionsRegex, newLatestConfig);
  fs.writeFileSync(pagesJsPath, code, 'utf8');
  console.log('Successfully updated DEFAULT_PAGES in backend/routes/pages.js');
} else {
  console.log('Regex did not match backend/routes/pages.js');
}
