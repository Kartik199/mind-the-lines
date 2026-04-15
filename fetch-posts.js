const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
require('dotenv').config();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-03-01',
  token: process.env.SANITY_API_TOKEN,
});

async function fetchPosts() {
  const query = `*[_type == "post"] {
    title,
    "slug": slug.current,
    publishedAt,
    "categories": categories[]->{
      "title": title,
      "slug": slug.current
    },
    "tags": tags[]->title,
    body,
    heroImageUrl,
    oneLineTake
  }`;

  try {
    const posts = await client.fetch(query);
    console.log(`📦 Found ${posts.length} posts in Sanity.`);

    // 1. Save rich data for the templates
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    fs.writeFileSync(path.join(dataDir, 'posts.json'), JSON.stringify(posts, null, 2));

    // 2. Generate Markdown for Hugo's routing engine
    const postsDir = path.join(__dirname, 'content', 'posts');
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

    posts.forEach(post => {
      const fileName = `${post.slug}.md`;
      const filePath = path.join(postsDir, fileName);

      const frontmatterObj = {
        title: post.title,
        date: post.publishedAt || new Date().toISOString(),
        // CRITICAL: Hugo needs a flat list of strings to generate category pages
        categories: post.categories ? post.categories.map(c => c.title) : [],
        tags: post.tags || [],
        slug: post.slug
      };

      const frontmatter = `---\n${yaml.dump(frontmatterObj)}---\n`;
      fs.writeFileSync(filePath, frontmatter);
    });

    console.log('✅ Data synced. Category pages should now generate.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fetchPosts();