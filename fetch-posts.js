const fs = require('fs');
const { createClient } = require('@sanity/client');

require('dotenv').config(); 

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-03-01',
});

async function fetchPosts() {
    if (!process.env.SANITY_PROJECT_ID) {
        console.error("❌ ERROR: SANITY_PROJECT_ID is missing!");
        process.exit(1); 
    }
  const query = `*[_type == "post"]{
    title,
    "slug": slug.current,
    summary,
    category,
    "heroImageUrl": heroImage.asset->url,
    body,
    oneLineTake,
    linesThatStayed
  }`;
  
  const posts = await client.fetch(query);
  
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  fs.writeFileSync('./data/posts.json', JSON.stringify(posts, null, 2));

  if (!fs.existsSync('./content/posts')) fs.mkdirSync('./content/posts', { recursive: true });
  
  posts.forEach(post => {
    const content = `---
title: "${post.title}"
slug: "${post.slug}"
layout: "single"
---`;
    fs.writeFileSync(`./content/posts/${post.slug}.md`, content);
  });

  console.log('Data synced and Hugo nodes created.');
}

fetchPosts();