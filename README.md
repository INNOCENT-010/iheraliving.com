# IHE'RA — Curated Living

A luxury interior design e-commerce and editorial platform.

## Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS + custom design tokens
- **Language**: TypeScript

## Setup

### 1. Clone and install
```bash
npm install
```

### 2. Environment
Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials.

### 3. Database
In your Supabase dashboard > SQL Editor, run:
```
supabase/migrations/001_initial_schema.sql
supabase/seed/seed.sql
```

### 4. Create admin user
In Supabase > Authentication > Users, create a user with your email/password.

### 5. Run
```bash
npm run dev
```

## Structure

```
src/
  app/
    site/         → Public-facing pages (Home, Surfaces, Lighting, Studio, Journal, Contact)
    admin/        → Admin dashboard (Products, Journal, Analytics, Settings)
    auth/         → Login page
  components/
    layout/       → Navbar, Footer
    home/         → Hero, BrandStatement, FeaturedProducts, JournalPreview
    ui/           → ProductCard, JournalCard, Button, PageTransition
    admin/        → Sidebar, StatsCard, ProductForm, JournalForm
  lib/
    supabase/     → client.ts, server.ts, middleware.ts
    utils/        → cn.ts, formatters.ts
    hooks/        → useProducts.ts, useJournal.ts
  types/          → index.ts, supabase.ts

supabase/
  migrations/     → 001_initial_schema.sql
  seed/           → seed.sql
```

## Route mapping
Note: `src/app/site/` maps to `/` — rename to `src/app/(site)/` 
if using Next.js route groups.

## Admin access
Navigate to `/auth/login` → `/admin`

## Colors
- Charcoal `#1a1a1a` — dominant
- Brass `#b8924a` — accent
- Cream `#f5f0e8` — text
