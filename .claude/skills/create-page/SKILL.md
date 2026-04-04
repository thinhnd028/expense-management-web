# Skill: create-page

Tạo một route mới theo chuẩn Next.js App Router của project này.

## Instructions

When this skill is invoked:

1. Ask the user for the route path if not provided (e.g. `settings/profile`, `reports/monthly`).
2. Determine whether the route belongs under `src/app/(dashboard)/` (protected, needs auth) or `src/app/` (public).
3. Create the necessary files:

**`page.tsx`** — Server Component by default:
- Fetch data using the server Supabase client (`src/lib/supabase/server.ts`)
- Redirect to `/auth/login` if no user session
- Pass fetched data as props to client components
- Follow the pattern in existing pages like `src/app/(dashboard)/wallets/page.tsx`

**`layout.tsx`** — only create if the route needs its own layout wrapper; skip if the parent `(dashboard)/layout.tsx` is sufficient.

**`columns.tsx` + `data-table.tsx`** — create these if the page is a list/table view, following the TanStack Table pattern used in `wallets/`, `transactions/`, `debts/`.

4. Use types from `src/types/database.ts` for all data shapes.
5. Do not add placeholder comments like `// TODO` — generate working code or ask for the missing information.
