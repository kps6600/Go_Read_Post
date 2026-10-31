const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'backend', 'routes', 'pages.js');
let content = fs.readFileSync(filePath, 'utf8');

const latestPageSnippet = `  {
    id: "latest",
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
        id: "latest_hero",
        type: "hero",
        order: 1,
        enabled: true,
        data: {
          badge: "REAL-TIME DISPATCHES",
          heading: "Latest Articles & Dispatches",
          title: "Latest Articles & Dispatches",
          headline: "Latest Articles & Dispatches",
          subheadline: "Real-time reporting, founder interviews, and high-velocity stories across India and the global startup ecosystem.",
          subtitle: "Real-time reporting, founder interviews, and high-velocity stories across India and the global startup ecosystem.",
          popularTitle: "Top Trending Dispatches",
          primaryBtnText: "Explore Latest Feed",
          primaryBtnUrl: "#feed",
          heroSource: "auto"
        }
      },
      {
        id: "latest_feed",
        type: "stories_feed",
        order: 2,
        enabled: true,
        data: {
          title: "Latest from the Newsroom",
          heading: "Latest from the Newsroom",
          subtitle: "Chronological feed of all published dispatches, scoops, and startup breakdowns.",
          category: "",
          limit: 16,
          viewAllText: "Load More Stories",
          viewAllUrl: "/latest"
        }
      },
      {
        id: "category_startups",
        type: "category_startups",
        order: 3,
        enabled: true,
        data: {
          title: "Category Desk: Startups & Capital",
          heading: "Category Desk: Startups & Capital",
          subtitle: "Early-stage fundraising, venture deals, term sheets, and founder dispatches.",
          category: "Startups",
          limit: 8,
          viewAllText: "Explore Startups",
          viewAllUrl: "/category/startups"
        }
      },
      {
        id: "newsletter",
        type: "newsletter",
        order: 4,
        enabled: true,
        data: {
          title: "Newsletter Subscription Banner",
          heading: "Newsletter Subscription Banner",
          headline: "Get the Latest Blogs Delivered to Your Inbox",
          subtitle: "Unfiltered insights on venture capital, frontier tech, and high-growth leadership directly in your inbox.",
          placeholder: "Enter your email address",
          buttonText: "Subscribe"
        }
      }
    ]
  },
  {
    id: "category"`;

if (!content.includes('id: "latest"')) {
  content = content.replace(/\{\s*id:\s*"category"/, latestPageSnippet);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully added latest page to backend/routes/pages.js');
} else {
  console.log('backend/routes/pages.js already has latest page');
}
