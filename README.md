# Mind the Lines

A high-performance, minimalist editorial platform designed for deep-dive investigations into distributed systems, Java architecture, and Tamil classical literature.

## 1. Technical Philosophy
The architecture follows a **Static-First, Minimal-JS** philosophy. The goal is to provide a "paper-like" reading experience with sub-second latency and zero unnecessary client-side overhead.

## 2. Tech Stack
- **Framework:** Hugo (Static Site Generator)
- **Styling:** Tailwind CSS 4.0 (Theme-aware, hardware-accelerated transitions)
- **Search:** Pagefind (Static low-bandwidth indexing)
- **Deployment:** Netlify / GitHub Actions

## 3. Engineering Highlights
### High-Performance Static Search
Instead of using a heavy third-party SaaS for search, this project utilizes **Pagefind**.
- **Lazy-Loading:** Search libraries are only fetched upon user intent (shortcut or click).
- **Weighted Ranking:** Article titles are weighted 10x higher than body content to ensure relevance.
- **Payload:** Entire search index is currently < 10KB.

### View-State Management
Implemented a "Blinded UI" pattern for navigation. By toggling visibility states and utilizing backdrop filters, the UI eliminates DOM clutter during search/nav sessions, leading to a **0ms Total Blocking Time** in Lighthouse audits.

## 4. Local Development
```bash
# Clone the repo
git clone [https://github.com/your-username/mind-the-lines.git](https://github.com/your-username/mind-the-lines.git)

# Run Hugo Server
npm run dev

# Re-index Search (requires Pagefind)
npm run build
