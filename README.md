# Stock Footage Finder

A web application that analyzes your script and finds matching real stock footage from multiple sources (Pexels, Pixabay, Unsplash).

## Features

- **Script Analysis**: Paste your script and automatically break it into scenes with extracted keywords
- **Multi-source Search**: Searches Pexels, Pixabay, and Unsplash for matching videos and images
- **Scene-by-scene Results**: Review footage for each scene individually
- **Selection & Download**: Select specific clips and download as a ZIP package
- **Real Footage Only**: All results are from real photographers/videographers (not AI-generated)
- **Serverless Ready**: Deploy to Netlify with zero server management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Netlify Functions (Node.js + TypeScript)
- **Stock APIs**: Pexels, Pixabay, Unsplash
- **NLP**: compromise.js for script analysis
- **ZIP Creation**: archiver.js (in-memory, no persistent storage)

## Project Structure

```
sammy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
├── server/                 # Original Express backend (for local dev)
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Server entry point
│   └── package.json
├── netlify/
│   ├── functions/          # Netlify Functions (serverless API)
│   │   ├── services/       # Shared services (stock APIs, analysis, download)
│   │   ├── utils/          # Shared utilities (types, helpers)
│   │   ├── analyze.ts      # POST /api/analyze
│   │   ├── analyze-file.ts # POST /api/analyze-file
│   │   ├── search.ts       # POST /api/search
│   │   ├── search-all.ts   # POST /api/search-all
│   │   ├── select.ts       # POST /api/select
│   │   ├── download.ts     # POST /api/download
│   │   ├── analysis.ts     # GET /api/analysis
│   │   └── health.ts       # GET /health
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── edge-functions/     # (Optional) Edge functions for future use
├── netlify.toml            # Netlify configuration
├── package.json            # Root workspace config
├── .env.example            # Environment template
└── README.md
```

## Prerequisites

- Node.js 18+
- npm or yarn
- API keys for at least one stock footage provider:
  - [Pexels API](https://www.pexels.com/api/) (free, 200 req/hr)
  - [Pixabay API](https://pixabay.com/api/docs/) (free, 100 req/min)
  - [Unsplash API](https://unsplash.com/developers) (free, 50 req/hr)

## Quick Start

### Local Development (with Express server)

```bash
cd /home/dfi-instructor/Documents/sammy
npm run install:all
cp .env.example .env
# Edit .env and add your API keys
npm run dev
```

This starts:
- Backend on http://localhost:3001
- Frontend on http://localhost:3000 (proxied to backend)

### Local Development (with Netlify Functions)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Install all dependencies
npm run install:all

# Copy env file
cp .env.example .env
# Edit .env and add your API keys

# Run Netlify dev server (runs frontend + functions locally)
npm run netlify:dev
# or
netlify dev
```

This starts:
- Frontend + Functions on http://localhost:8888
- API available at http://localhost:8888/api/*

## Deploy to Netlify

### Option 1: Git Integration (Recommended)

1. Push this repository to GitHub/GitLab/Bitbucket
2. Go to [Netlify Dashboard](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Add environment variables in Site Configuration > Environment Variables:
   - `PEXELS_API_KEY`
   - `PIXABAY_API_KEY`
   - `UNSPLASH_ACCESS_KEY`
7. Click "Deploy site"

### Option 2: Manual Deploy

```bash
# Build the project
npm run build

# Deploy to Netlify (requires netlify-cli)
netlify deploy --prod --dir=client/dist --functions=netlify/functions/dist
```

### Option 3: Netlify CLI with Git

```bash
# Link to existing Netlify site or create new
netlify init

# Deploy
netlify deploy --prod
```

## Build Configuration

The `netlify.toml` file configures:
- **Build command**: `npm run build` (builds client + functions)
- **Publish directory**: `client/dist` (static frontend assets)
- **Functions directory**: `netlify/functions` (serverless API)
- **Redirects**: `/api/*` → `/.netlify/functions/:splat`
- **SPA fallback**: `/*` → `/index.html`
- **Headers**: CORS, security, caching

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/analyze | Analyze script text |
| POST | /api/analyze-file | Analyze uploaded script file |
| POST | /api/search | Search footage for a specific scene |
| POST | /api/search-all | Search footage for all scenes |
| POST | /api/select | Update scene selections |
| POST | /api/download | Create ZIP download (returns base64) |
| GET | /api/analysis | Get current analysis (client-side state) |
| GET | /health | Health check |

## Netlify Functions Architecture

The backend has been converted from Express to **Netlify Functions**:

- **Stateless**: No in-memory state (`currentAnalysis` removed)
- **Client-side state**: Frontend stores analysis and sends with each request
- **Base64 ZIP downloads**: Files returned as base64 data URLs (no persistent storage)
- **Shared services**: Stock APIs, script analysis, download logic in `netlify/functions/services/`
- **Timeout**: 26 seconds max (Netlify free tier limit)

### Key Differences from Express Version

| Feature | Express | Netlify Functions |
|---------|---------|-------------------|
| State | In-memory (`currentAnalysis`) | Client sends state with each request |
| File storage | Local `downloads/` folder | Base64 in response |
| File serving | `/api/download/file/:filename` | Not needed (base64 direct) |
| Rate limiting | `express-rate-limit` | Netlify built-in |
| CORS | `cors` middleware | Netlify headers + function headers |
| Sessions | Possible | Not supported (stateless) |

## API Key Setup

### Pexels
1. Go to https://www.pexels.com/api/new/
2. Create an application
3. Copy the API key to `PEXELS_API_KEY`

### Pixabay
1. Register at https://pixabay.com/accounts/register/
2. Get API key from https://pixabay.com/api/docs/
3. Copy to `PIXABAY_API_KEY`

### Unsplash
1. Create app at https://unsplash.com/oauth/applications
2. Copy Access Key to `UNSPLASH_ACCESS_KEY`

## Notes

- **Rate Limits**: Each API has rate limits. The app handles errors gracefully.
- **Downloads**: ZIP files are created in-memory and returned as base64 (no server storage).
- **No API Keys**: The app works without API keys but will return no results.
- **Licenses**: Always check individual asset licenses before commercial use.
- **Function Timeout**: Large downloads may timeout on free tier (26s limit). Consider upgrading for production.

## License

MIT