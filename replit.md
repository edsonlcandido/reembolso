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

## Database Collections
PocketBase collections created via migrations:
- **users** (auth): Extended with name, avatar fields
- **companies**: Company management (name, cnpj, email, phone, logo, settings)
- **company_users**: User-company relationship (role: admin/approver/employee)
- **approvers**: Approval workflow (level, max_amount, delegates_to)
- **expense_reports**: Expense reports (title, period, status, total_amount)
- **expense_items**: Individual expenses (amount, category, receipt_image, OCR data)
- **categories**: Custom expense categories per company
- **audit_logs**: Complete audit trail

## Superuser
- Email: edsonluizcandido+admin@gmail.com

## App Views & Components
- **AppLayout**: Shared layout with collapsible sidebar + top navbar for all authenticated routes
- **Stores**: auth (login/register/profile), company (CRUD + members), expenses (reports + items)
- **Views**: Dashboard, CompanySetup, CompanyMembers, ExpenseReports, ExpenseReportDetail, CreateExpenseReport, Categories, Profile, Login, Register, ForgotPassword
- **Router**: Nested routes with AppLayout as parent wrapper, meta-based auth guards

## Design Conventions
- All text in Brazilian Portuguese
- Blue/purple gradient theme (bg-gradient-to-r from-blue-600 to-purple-600)
- Monetary values stored as integer cents (R$1,00 = 100), formatted with formatCurrency()
- Category enum: food, transport, lodging, supplies, other
- Status workflow: draft → submitted → approved/rejected → paid

## Recent Changes
- Implemented full company management (CRUD, member invitation, role assignment)
- Built expense reports system (create reports, add items, status workflow)
- Created Dashboard with real metrics from PocketBase
- Added shared AppLayout with responsive sidebar navigation
- Configured PocketBase API rules for authenticated users
- Fixed category enum mismatch (material → supplies)
- Created PocketBase migrations for all PRD collections
- Created superuser admin account
- Fixed IPv4/IPv6 proxy issue (web app host: 127.0.0.1)
- Configured for Replit environment (ports, hosts, proxy settings)
