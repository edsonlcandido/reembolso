# Replit Project Documentation

## Overview
Smart Reimbursement System with AI - A complete expense reimbursement management system with automatic OCR via AI, built with PocketBase + Vue 3 + TypeScript + Tailwind CSS.

## Architecture
This is a monorepo with three components:
- **PocketBase** (backend): Runs on port 8090 (localhost), auto-downloaded on first run
- **Landing Page** (`apps/landing`): Static landing page served via Vite on port 5000 (main frontend)
- **Web App** (`apps/web`): Vue 3 SPA served via Vite on port 5174, accessible via `/app` route

## Project Structure
```
├── apps/
│   ├── landing/          # Landing page (Vite + TypeScript + Tailwind)
│   └── web/              # Main web app (Vue 3 + TypeScript + Tailwind + Pinia)
├── pocketbase/
│   ├── pb_hooks/         # PocketBase hooks (SPA routing)
│   ├── pb_data/          # PocketBase data directory
│   ├── pb_migrations/    # Database migrations
│   └── pb_public/        # Static files served by PocketBase (production)
├── scripts/              # Build and setup scripts
│   ├── pocketbase.js     # Downloads and starts PocketBase
│   ├── copy-landing.js   # Copies landing build to pb_public
│   └── copy-app.js       # Copies web app build to pb_public/app
├── docs/                 # Documentation (PRD, API, Implementation)
└── package.json          # Root package with npm workspaces
```

## Development
- `npm run dev` - Starts all three services concurrently
- Landing page: port 5000 (exposed, 0.0.0.0)
- Web app: port 5174 (localhost)
- PocketBase: port 8090 (localhost)

## Production
- Build: `npm run build` (builds both apps and copies to pb_public)
- Run: PocketBase serves everything from pb_public on port 5000

## Key Configuration
- Vite configs allow all hosts for Replit proxy compatibility
- Landing page proxies `/api` and `/_` to PocketBase, `/app` to web app
- Web app proxies `/api` and `/_` to PocketBase

## Recent Changes
- Configured for Replit environment (ports, hosts, proxy settings)
