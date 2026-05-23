const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const imageUrlBuilder = require('@sanity/image-url');
require('dotenv').config();

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    useCdn: false,
    apiVersion: '2026-04-04',
    token: process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder.default ? imageUrlBuilder.default(client) : imageUrlBuilder(client);
function urlFor(source) {
    return builder.image(source).auto('format');
}

const headingStyles = { h1: '#', h2: '##', h3: '###', h4: '####', h5: '#####', h6: '######' };

function processChildren(block) {
    if (!block.children) return '';
    return block.children.map(child => {
        let text = child.text;
        if (!child.marks || child.marks.length === 0) return text;

        for (const mark of child.marks) {
            const markDef = (block.markDefs || []).find(def => def._key === mark);
            if (markDef) {
                if (markDef._type === 'link') text = `[${text}](${markDef.href})`;
            } else {
                if (mark === 'strong') text = `**${text}**`;
                else if (mark === 'em') text = `*${text}*`;
                else if (mark === 'code') text = "`" + text + "`";
                else if (mark === 'underline') text = `<u>${text}</u>`;
                else if (mark === 'strike-through') text = `~~${text}~~`;
            }
        }
        return text;
    }).join('');
}

function blocksToMarkdown(blocks) {
    if (!blocks) return '';
    return blocks.map(block => {
        if (block._type === 'block') {
            const text = processChildren(block);
            if (text.includes('{{< youtube')) return `\n\n${text}\n\n`;
            const prefix = headingStyles[block.style];
            if (prefix) return `\n${prefix} ${text}\n`;
            return text;
        }

        if (block._type === 'inlineQuote') {
            const style = block.style || 'editorial';
            const authorMarkup = block.author ? `<cite class="quote-author">— ${block.author}</cite>` : '';
            if (style.startsWith('pull-')) {
                const side = style.split('-')[1];
                return `<aside class="pull-quote ${side} reveal-on-scroll">"${block.text}"${authorMarkup}</aside>`;
            }
            return `\n<blockquote class="editorial-quote reveal-on-scroll"><p class="quote-text">"${block.text}"</p>${authorMarkup}</blockquote>\n`;
        }

        if (block._type === 'youtube') {
            const url = block.url || '';
            let videoId = '';
            if (url.includes('v=')) {
                videoId = url.split('v=')[1]?.split('&')[0] || '';
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
            }
            if (!videoId) return '';
            return `\n\n{{< youtube ${videoId} >}}\n\n`;
        }

        if (block._type === 'image') {
            const imageUrl = urlFor(block.asset).width(1200).fit('max').auto('format').url();
            const altText = block.alt || '';
            const captionMarkup = block.caption ? `<figcaption class="img-caption">${block.caption}</figcaption>` : '';
            return `\n\n<figure class="editorial-figure reveal-on-scroll">\n    <img src="${imageUrl}" alt="${altText}" class="lightbox-trigger cursor-zoom-in" loading="lazy" />\n    ${captionMarkup}\n</figure>\n\n`;
        }
        return '';
    }).join('\n\n');
}

async function fetchPosts() {
    const query = `*[_type == "post"] | order(publishedAt desc) {
        title,
        "slug": slug.current,
        "publishedAt": coalesce(publishedAt, _createdAt),
        "heroImage": heroImage.asset->url,
        summary,
        "categories": categories[]->{ "title": title },
        body
    }`;

    const posts = await client.fetch(query);
    const postsDir = path.resolve(__dirname, 'content', 'posts');

    if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
    }

    const writtenSlugs = new Set();
    let writeErrors = 0;

    for (const post of posts) {
        try {
            if (!post.slug) throw new Error('Missing slug');
            const filePath = path.join(postsDir, `${post.slug}.md`);
            const frontmatter = `---\n${yaml.dump({
                title: post.title,
                date: post.publishedAt,
                heroImage: post.heroImage || '',
                summary: post.summary || '',
                categories: post.categories ? post.categories.map(c => c.title) : [],
                slug: post.slug
            })}---\n`;
            fs.writeFileSync(filePath, frontmatter + '\n' + blocksToMarkdown(post.body));
            writtenSlugs.add(`${post.slug}.md`);
        } catch (err) {
            console.error(`Skipped post "${post.title || post.slug}": ${err.message}`);
            writeErrors++;
        }
    }

    fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.md') && !writtenSlugs.has(file))
        .forEach(file => {
            fs.unlinkSync(path.join(postsDir, file));
            console.log(`Removed stale post: ${file}`);
        });

    console.log(`Synced ${writtenSlugs.size} posts.${writeErrors ? ` ${writeErrors} skipped due to errors.` : ''}`);
}

fetchPosts().catch(err => {
    console.error('Fatal fetch error:', err);
    process.exit(1);
});
