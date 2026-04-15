const fs = require('fs');
const { createClient } = require('@sanity/client');

require('dotenv').config(); 

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-03-01',
});

async function fetchPosts() {
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
  
  // 1. Save the Master JSON
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  fs.writeFileSync('./data/posts.json', JSON.stringify(posts, null, 2));

  // 2. Auto-Generate Content Nodes (The Bridge)
  if (!fs.existsSync('./content/posts')) fs.mkdirSync('./content/posts', { recursive: true });
  
  posts.forEach(post => {
    const content = `---
title: "${post.title}"
slug: "${post.slug}"
layout: "single"
---`;
    fs.writeFileSync(`./content/posts/${post.slug}.md`, content);
  });

  console.log('✅ Data synced and Hugo nodes created.');
}

fetchPosts();