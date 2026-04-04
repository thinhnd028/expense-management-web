# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on port 4001
npm run build     # Production build
npm run start     # Start production server on port 4001
```

Linting and testing tools are installed (ESLint, Playwright) but not wired to npm scripts.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=    # Required for OAuth redirect URIs
```

## Architecture

Full-stack expense management app — Next.js 16 (App Router) + Supabase (PostgreSQL + Auth + RLS) + Tailwind CSS 4 + shadcn/ui.

**Routing**: All authenticated pages live under `src/app/(dashboard)/`. The route group shares a layout that wraps the page in `CurrencyProvider`, renders `Sidebar`/`MobileHeader`/`BottomNav`, and enforces auth. Unauthenticated users are redirected to `/auth/login` by `src/middleware.ts` (which also refreshes the Supabase session on every request).

**Data fetching**: Pages are React Server Components that call the server Supabase client (`src/lib/supabase/server.ts`). Interactive client components use custom hooks in `src/hooks/` which call the browser Supabase client (`src/lib/supabase/client.ts`). There is no global state library — currency preference is the only shared state, managed through `CurrencyContext`.

**Database**: All writes go through Supabase PostgreSQL functions for atomicity (`create_transaction`, `delete_transaction`). Every table has RLS — users only see their own rows, except categories which can be user-owned or default (NULL `user_id`). The full schema is in `supabase/schema.sql` and TypeScript types are generated in `src/types/database.ts`.

**UI components**: shadcn/ui components (Radix UI primitives + Tailwind) live in `src/components/ui/`. Add new ones via `npx shadcn@latest add <component>` — `components.json` at root configures the output path and aliases automatically. Use `cn()` from `src/lib/utils.ts` for conditional Tailwind classes. Feature components are colocated under `src/components/{wallets,transactions,debts,dashboard,layout}/`.

**Data tables**: Pages with list views follow a consistent pattern — `columns.tsx` (TanStack column definitions) + `data-table.tsx` (client component with table state) + `page.tsx` (server component that fetches data and passes it down).

**Currency & dates**: Currency config and formatting live in `src/lib/currency.ts`. Date utilities in `src/lib/date.ts` default to Vietnamese locale (DD/MM/YYYY). The user's preferred currency is stored in `profiles.currency` and accessed via `useCurrency()`.
