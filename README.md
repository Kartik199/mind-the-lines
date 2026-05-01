# Mind the Lines

A high-performance, minimalist editorial platform. Architected as a Jamstack solution prioritizing static delivery, semantic search, and editorial flexibility.

[![v1.0.0](https://img.shields.io/badge/Release-v1.0.0-blue)](https://github.com/Kartik199/mind-the-lines/releases/tag/v1.0.0)

## 1. Technical Philosophy
The architecture follows a **Static-First, Minimal-JS** philosophy. The goal is to provide a "paper-like" reading experience with sub-second latency and zero unnecessary client-side overhead. Designed for performance-first principles: decoupling content from presentation, leveraging CDNs for global distribution, and minimizing runtime dependencies.

## 🛠 Technologies
- **Static Site Generator**: Hugo for build-time rendering and content processing.
- **Headless CMS**: Sanity.io with GROQ queries for structured content retrieval.
- **Styling**: TailwindCSS for utility-first CSS, processed via PostCSS with custom theme variables (e.g., paper/ink color scheme, Lora serif font).
- **Search**: Pagefind for lightweight, client-side indexing with weighted ranking.
- **Build Tools**: Node.js for data fetching; PostCSS for CSS optimization.
- **Deployment**: Netlify for automated builds and CDN distribution.

## 🏗 System Architecture: The Jamstack Pipeline

This platform utilizes a decoupled architecture to balance editorial flexibility with production performance.

```mermaid
graph LR
    subgraph CMS [Content Layer]
        A[Editor Inputs] --> B(Sanity.io CMS)
    end

    subgraph Build [Build Pipeline]
        B -- "GROQ Queries" --> C{Hugo Build}
        C --> D[Pagefind Indexing]
    end

    subgraph Distribution [Edge Network]
        D -- "Static Assets" --> E[Netlify CDN]
        E --> F((End User))
    end

    style B fill:#f96,stroke:#333,stroke-width:1px
    style C fill:#69f,stroke:#333,stroke-width:1px
    style E fill:#5f5,stroke:#333,stroke-width:1px
```  

### 1. Headless Content Management (Sanity.io)
- **Structured Content:** Utilizing Sanity's GROQ (Graph-Relational Object Queries) to fetch deeply nested editorial data.
- **Schemas**: Posts include title, slug, published date, summary, categories (referencing category documents), hero image, and rich body content (portable text blocks, images, YouTube embeds, inline quotes with styles).
- **Image Optimization:** Leveraging Sanity's Asset Pipeline to serve transformed, CDN-cached images with auto-formatting and width constraints.
- **Roadmap:** Implement dynamic resizing and `srcset` generation to optimize the LCP (currently 2.1s) to sub-1s.

### 2. Static Site Generation (Hugo)
- **Build-time Integration:** Sanity data is consumed during the build process via a custom Node.js script that converts GROQ results to Hugo-compatible Markdown with frontmatter.
- **Zero-Client-Side Fetching:** By baking CMS data into the static build, we eliminate "Loading Spinner" UX and reduce API overhead at runtime.
- **Configuration:** Taxonomies for categories/tags, custom permalinks, and Goldmark renderer with unsafe HTML enabled for rich content.

### 3. Search & Discovery (Pagefind)
- **Post-build Indexing:** After Hugo generates the site, Pagefind crawls the static files to create a lightweight search index (<10KB).
- **Intent-based Asset Loading:** Search CSS/JS assets are only injected into the DOM upon user interaction (shortcut `/` or click), ensuring the initial page load remains ultra-lean.
- **Weighted Ranking:** Article headers are weighted (x10) over body content to ensure precision in search results.

## Performance Baseline (v1.0.0)
Validated via Lighthouse Audit:
- **Total Blocking Time:** 0ms
- **Cumulative Layout Shift:** 0
- **Search Index Size:** 9KB
- **Search Latency:** Sub-100ms (O(1) retrieval)

## Content Features
- **Rich Text**: Portable text with headings, links, and custom blocks.
- **Media**: Hero images, inline images with captions/alt text, and YouTube video embeds via shortcodes.
- **Editorial Elements**: Pull quotes (editorial/left/right styles) with author citations.
- **Taxonomies**: Categories and tags for organization, with navigation dropdowns and pagination.

## Design System
- **Blinded UI Pattern:** A custom-engineered modal system for navigation and search that physically hides the main content to eliminate visual ghosting and focus user attention.
- **Typography-First:** Minimalist aesthetic using serif-heavy editorial styles to mirror editorial literature.
- **Custom Theme:** TailwindCSS extended with semantic color variables (paper, ink, muted) and Lora font for readability.

## 4. Local Development
### Prerequisites
- Node.js 20+, Hugo 0.145.0+
- Sanity API token and project ID (configure in `.env`)

### Commands
# Clone the repo
git clone [https://github.com/Kartik199/mind-the-lines.git](https://github.com/Kartik199/mind-the-lines.git)

```bash
# Install dependencies
npm install

# Run Hugo Server
npm run dev

# Build and Re-index Search
npm run build
```

#  Deployment
Configured for Netlify with automated builds. Publish directory: `public/`. Environment variables include Hugo and Node versions for consistency. The static-first approach ensures global CDN distribution with minimal server overhead.