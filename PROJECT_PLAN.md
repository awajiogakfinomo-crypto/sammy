# Stock Footage Finder - Implementation Plan

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Styling**: Tailwind CSS
- **Stock APIs**: Pexels, Pixabay, Unsplash (free tiers, real footage)
- **Script Analysis**: compromise.js (lightweight NLP) + custom keyword extraction
- **ZIP Creation**: archiver.js
- **File Upload**: multer

## Project Structure
```
sammy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   │   ├── stockApis/  # Stock footage API integrations
│   │   │   ├── scriptAnalysis/ # NLP processing
│   │   │   └── download/   # ZIP creation
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utilities
│   └── package.json
├── package.json            # Root package.json for scripts
└── README.md
```

## Stock Footage APIs (Free Tiers - Real Footage)
1. **Pexels API** - 200 req/hr free, videos + photos
2. **Pixabay API** - 100 req/min free, videos + photos
3. **Unsplash API** - 50 req/hr free, photos only (high quality)

## Script Analysis Approach
1. Split script into sentences/scenes
2. Extract visual keywords: nouns, verbs, locations, actions
3. Map to search queries for stock APIs
4. Score and rank results by relevance

## Implementation Phases
1. **Phase 1**: Project setup, basic Express + React structure
2. **Phase 2**: Stock API integrations (Pexels, Pixabay, Unsplash)
3. **Phase 3**: Script analysis engine
4. **Phase 4**: Frontend UI - script input, scene breakdown, results
5. **Phase 5**: Selection UI, preview, ZIP download
6. **Phase 6**: Polish, error handling, rate limiting, caching