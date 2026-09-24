# Doha Live IP Hub 🇶🇦 
### VisionOS Glassmorphism CRM & Entertainment Host Partnership Engine

An Apple-style, high-performance Entertainment IP CRM built for scouting, evaluating, and securing world-class touring theatricals, immersive exhibitions, motorsport spectacles, and family entertainment properties for premier Qatar venues (QNCC, DECC, Lusail Multipurpose Arena, Katara Cultural Village, Place Vendôme, and Aspire Zone).

---

## ✨ Features

- **Apple VisionOS Spatial UI**: Translucent glassmorphism cards, blurred depth layers, specular highlights, and micro-interactions.
- **Strict 4-Card Desktop Layout**: 4 columns on desktop (`grid-template-columns: repeat(4, 1fr)`), 2 columns on tablet, and fluid 1-column layout on mobile.
- **1-Screen Spatial Dossier Modal**: Clean, scroll-free desktop view fitted within the viewport (`max-height: 88vh; overflow: hidden`) with tabbed Pitch & Strategy studios.
- **1-Click Links & Interactive Venue Popover**: Direct 1-click links to Official Websites and LinkedIn Licensor profiles, plus an interactive `📍 Venue` popover revealing technical specs and seating capacities.
- **Verified Actual Live Event Photography**: 44 core properties and 16 discovery pool items linked to real stage and touring productions.
- **Automated Daily Extraction Engine**: Discovers at least 10 brand-new unique entertainment IPs & branded events every 24 hours with deduplication protection.

---

## ⚡ Cloudflare Pages & Neon Serverless Architecture

> **CRITICAL ZERO-COST / AUTO-SUSPEND GUARANTEE**:
> Traditional databases keep persistent TCP connections open (`pg.Pool`), preventing serverless databases from sleeping and burning hours 24/7.
> **This architecture strictly guarantees Neon auto-suspends after 5 minutes of idle time.**

### How Neon Stays Inactive (Scale-to-Zero)
1. **Connectionless HTTP Driver (`@neondatabase/serverless`)**: Queries execute via atomic HTTPS POST requests to Neon's HTTP proxy endpoint (`/sql`). No TCP connection pools or keep-alive sockets are maintained.
2. **Ephemeral Cloudflare Pages Functions**: Serverless edge handlers in `/functions/api/ips.js` and `/functions/api/sync.js` spin up on-demand, run the query, and terminate immediately.
3. **Zero Background Polling Loops**: No `setInterval` pings or background heartbeats. All data is cached in `localStorage` (local-first). Remote database sync occurs **only** on user command or explicit mutation.
4. **Resilient Offline Fallback**: If Neon is suspended or offline, the app seamlessly serves cached local properties without UI interruption.

---

## 🛠️ Neon Database Setup

1. Create a free serverless project at [neon.tech](https://neon.tech).
2. Go to **SQL Editor** in your Neon dashboard.
3. Run the schema found in [`db/schema.sql`](./db/schema.sql):

```sql
CREATE TABLE IF NOT EXISTS entertainment_ips (
    id VARCHAR(64) PRIMARY KEY,
    title TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    image TEXT,
    licensor TEXT,
    producer TEXT,
    person TEXT,
    email TEXT,
    website TEXT,
    linkedin_url TEXT,
    social TEXT,
    past_shows TEXT,
    past_show_url TEXT,
    venue_fit JSONB DEFAULT '[]'::jsonb,
    brand_details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(32) DEFAULT 'Prospect',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

4. Copy your connection string from the Neon dashboard:
   ```
   DATABASE_URL=postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require
   ```

---

## ☁️ Cloudflare Pages Deployment

### Option A: Via Cloudflare Dashboard (Recommended)
1. Push this repository to your GitHub account (see instructions below).
2. Log into the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Under **Settings** > **Environment variables**:
   - Add variable: `DATABASE_URL` = your Neon PostgreSQL connection string.
   - Add variable: `NODE_VERSION` = `20`
5. Click **Save and Deploy**.

### Option B: Via Cloudflare Wrangler CLI
```bash
# Authenticate with Cloudflare
npx wrangler login

# Deploy Pages with functions
npx wrangler pages deploy dist --project-name doha-entertainment-ip-hub

# Set your secret Neon database connection string
npx wrangler pages secret put DATABASE_URL
```

---

## 🚀 Pushing to GitHub

To push this codebase to your own GitHub repository:

```bash
# 1. Create a new empty repository on GitHub (e.g., "doha-entertainment-ip-hub")
# 2. Link your remote and push:
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:3000)
npm run dev

# Build for production
npm run build
```
