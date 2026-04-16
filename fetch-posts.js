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
    apiVersion: '2024-03-01',
    token: process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder.default ? imageUrlBuilder.default(client) : imageUrlBuilder(client);
function urlFor(source) {
    return builder.image(source).auto('format');
}

function processChildren(block) {
    if (!block.children) return '';
    return block.children.map(child => {
        let text = child.text;
        if (child.marks && child.marks.length > 0) {
            const linkMark = block.markDefs.find(def => def._key === child.marks[0] && def._type === 'link');
            if (linkMark) return `[${text}](${linkMark.href})`;
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
            if (block.style === 'h1') return `\n# ${text}\n`;
            if (block.style === 'h2') return `\n## ${text}\n`;
            return text;
        }

        // QUOTE LOGIC: Editorial vs Pull Quotes
        if (block._type === 'inlineQuote') {
            const style = block.style || 'editorial';
            const authorMarkup = block.author ? `<cite class="quote-author">— ${block.author}</cite>` : '';

            if (style.startsWith('pull-')) {
                const side = style.split('-')[1]; // 'left' or 'right'
                return `<aside class="pull-quote ${side} reveal-on-scroll">"${block.text}"${authorMarkup}</aside>`;
            }
            return `\n<blockquote class="editorial-quote reveal-on-scroll"><p class="quote-text">"${block.text}"</p>${authorMarkup}</blockquote>\n`;
        }

        // IMAGE LOGIC: Lightbox and Alt-Text
        if (block._type === 'image') {
            const imageUrl = urlFor(block.asset).width(1200).fit('max').auto('format').url();
            const altText = block.alt || "Photography by Kartikeyan Sundaresan";
            const captionMarkup = block.caption ? `<figcaption class="img-caption">${block.caption}</figcaption>` : '';

            // Adding extra newlines (\n\n) helps the Markdown parser recognize this as a separate block
            return `\n\n<figure class="editorial-figure reveal-on-scroll">\n    <img src="${imageUrl}" alt="${altText}" class="lightbox-trigger cursor-zoom-in" loading="lazy" />\n    ${captionMarkup}\n</figure>\n\n`;
        }
        return '';
    }).join('\n\n');
}

async function fetchPosts() {
    const query = `*[_type == "post"] {
        title,
        "slug": slug.current,
        publishedAt,
        "heroImage": heroImage.asset->url,
        summary,
        "categories": categories[]->{ "title": title },
        body
    }`;

    try {
        const posts = await client.fetch(query);
        const postsDir = path.join(__dirname, 'content', 'posts');
        if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

        posts.forEach(post => {
            const filePath = path.join(postsDir, `${post.slug}.md`);
            const frontmatter = `---\n${yaml.dump({
                title: post.title,
                date: post.publishedAt || new Date().toISOString(),
                heroImage: post.heroImage || '',
                summary: post.summary || '',
                categories: post.categories ? post.categories.map(c => c.title) : [],
                slug: post.slug
            })}---\n`;

            fs.writeFileSync(filePath, frontmatter + '\n' + blocksToMarkdown(post.body));
        });
        console.log('✅ Success: Images resized with aspect-ratio preservation.');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}
fetchPosts();