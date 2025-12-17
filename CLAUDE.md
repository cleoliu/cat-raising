# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Production server
npm start

# Linting
npm run lint

# Generate version
npm run version:generate
```

## Architecture Overview

**Tech Stack**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), PWA-enabled

**Application Purpose**: Full-featured cat care management platform with nutrition calculation (AAFCO-based), diet diary, health records, and feeding/supplement tracking. Mobile-first responsive design with glass-morphism UI.

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (feeding, water, supplement records, nutrition analytics)
│   ├── auth/              # Login & register pages
│   ├── calculator/        # Nutrition calculator (AAFCO dry matter analysis)
│   ├── cats/              # Cat management page
│   ├── dashboard/         # Food records & calculations
│   ├── diet-diary/        # Diet diary with daily records
│   └── layout.tsx         # Root layout with PWA config
├── components/
│   ├── ui/                # shadcn/ui components (button, card, input, etc.)
│   ├── BottomNav.tsx      # Three-tab bottom navigation
│   ├── CatAvatar.tsx      # Cat avatar component (18 cat images)
│   ├── PWAInstallPrompt.tsx
│   └── VersionManager.tsx
├── lib/
│   ├── calculations.ts    # Core nutrition calculation logic (dry matter, calorie ratios)
│   ├── dateUtils.ts       # Taiwan timezone (UTC+8) utilities - CRITICAL for all datetime handling
│   ├── supabase.ts        # Supabase client + Database type definitions
│   └── utils.ts           # Utility functions
├── types/
│   └── index.ts           # TypeScript interfaces (Cat, FoodCalculation, etc.)
```

### Database Schema

**Main Tables**:
- `users` - Extended auth.users with profile data
- `cats` - Cat profiles (name, birthday, weight, avatar_id)
- `food_calculations` - Nutrition analysis records with AAFCO dry matter calculations
- `feeding_records` - Daily feeding logs with appetite tracking
- `water_records` - Water intake tracking
- `supplement_records` - Supplement/medication logs

**Key Patterns**:
- All tables have `user_id` foreign key with RLS policies for data isolation
- Timestamps use `TIMESTAMP WITH TIME ZONE` and stored in UTC
- Relations: `feeding_records` → `cats`, `feeding_records` → `food_calculations`

## Critical Development Patterns

### 1. Timezone Handling (CRITICAL)

**ALWAYS use `src/lib/dateUtils.ts` for ALL datetime operations. Taiwan timezone (UTC+8) is the application standard.**

```typescript
import { 
  getCurrentTaiwanDateTime,      // Get current time in Taiwan for input defaults
  taiwanDateTimeToUtc,            // Convert user input to UTC for storage
  utcToTaiwanDateTime,            // Convert DB UTC to Taiwan for editing
  formatTaiwanDateTime,           // Display UTC timestamps in Taiwan timezone
  taiwanDateToUtcRange            // Query records by Taiwan date
} from '@/lib/dateUtils'
```

**Why this matters**: Database stores UTC, but users operate in Taiwan timezone. Incorrect conversion causes off-by-8-hours bugs in feeding/water records.

### 2. Nutrition Calculations

Use `src/lib/calculations.ts` for all nutrition analysis:
- `calculateNutrition(input)` - Calculates dry matter basis, calorie ratios, calcium/phosphorus ratio
- `validateNutritionInput(input)` - Validates nutritional percentages

**AAFCO Standards** (hardcoded in UI):
- Protein (dry matter): ≥35%
- Fat (dry matter): 30-50%
- Carbohydrate (dry matter): ≤10%
- Calcium/Phosphorus ratio: 1.1-1.8

### 3. API Route Patterns

All API routes follow this structure:
```typescript
// 1. Extract auth header
const authHeader = request.headers.get('authorization')
if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// 2. Create Supabase client with auth
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } }
})

// 3. Verify user
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// 4. RLS automatically enforces user_id isolation
```

**No-cache headers** are set in `next.config.ts` for all `/api/*` routes.

### 4. Component Patterns

- **Path alias**: Use `@/` for imports (configured in `tsconfig.json`)
- **UI components**: Use shadcn/ui components from `src/components/ui/`
- **Client components**: Mark with `'use client'` when using hooks/state
- **Styling**: Tailwind CSS with custom glass-morphism design

### 5. Authentication Flow

- Supabase Auth with email/password
- JWT tokens passed via `Authorization: Bearer <token>` header
- RLS policies on all tables enforce `user_id` isolation
- Use `src/lib/supabase.ts` exported client for frontend, create new client in API routes with auth headers

## Common Tasks

### Adding a New API Route

1. Create route file in `src/app/api/[resource]/route.ts`
2. Implement auth pattern (see API Route Patterns above)
3. Use Supabase client with RLS (automatically filters by user_id)
4. Return JSON with appropriate status codes
5. Test with authorization header

### Adding a New Page

1. Create page in `src/app/[route]/page.tsx`
2. If using client-side state: add `'use client'` directive
3. Import `BottomNav` component if it's a main tab
4. Use Taiwan timezone utilities for any datetime displays
5. Follow mobile-first responsive design (glass-morphism cards)

### Working with Dates

**NEVER** use raw `new Date()` or `.toISOString()` without timezone conversion:
```typescript
// ✅ CORRECT
import { getCurrentTaiwanDateTime, taiwanDateTimeToUtc } from '@/lib/dateUtils'
const defaultTime = getCurrentTaiwanDateTime() // For input[type="datetime-local"]
const utcTime = taiwanDateTimeToUtc(userInput)  // Before saving to DB

// ❌ WRONG
const now = new Date().toISOString() // This uses browser timezone!
```

### Database Migrations

Migration scripts are in `/migration/` directory. Common patterns:
- RLS policy fixes: `/migration/fix-rls-policy.sql`
- Timezone fixes: `/migration/fix-water-records-timezone.sql`
- Field adjustments: `/migration/fix-optional-fields.sql`

Run via Supabase SQL Editor or CLI.

## Environment Variables

Required in `.env.local` (development) and Vercel (production):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

## Testing & Quality

- **No test framework configured yet** - verify changes manually
- Check TypeScript errors: `npm run build` (includes type checking)
- Lint before committing: `npm run lint`
- Test in mobile viewport (primary use case)

## Deployment

- **Frontend**: Vercel (configured via `vercel.json` or auto-detected)
- **Database**: Supabase (schema in `supabase-schema.sql` and `diet-diary-schema.sql`)
- **PWA**: Service worker in `public/sw.js`, manifest in `public/manifest.json`
- See `DEPLOYMENT.md` for full deployment guide

## Known Issues & Gotchas

1. **Timezone bugs**: Always use `dateUtils.ts` functions
2. **RLS policies**: Ensure all new tables have proper `user_id` RLS policies
3. **Build ID**: `next.config.ts` generates unique build IDs to force client updates
4. **No static export**: This is a dynamic app with API routes
5. **React 19**: Uses React 19 with new JSX runtime

## Code Conventions

- **No comments** unless absolutely necessary for complex logic
- **TypeScript strict mode** enabled
- **Component naming**: PascalCase for components, camelCase for utilities
- **File naming**: kebab-case for routes, PascalCase for components
- **Import order**: External libs → Internal libs → Components → Types
- Always define TypeScript types (avoid `any`)
