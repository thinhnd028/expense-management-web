# ExpenseFlow — Agent Instructions

## Skills

- **`/frontend-design`** — invoke BEFORE writing any new page or UI component
- **`/simplify`** — invoke AFTER finishing a feature

---

## Project

Full-stack PWA: Next.js 16 + Supabase + Tailwind CSS 4. Mobile-first.
Auth: Supabase (Google OAuth + Email). State: `useState` + custom hooks + `CurrencyContext`.
Dev server: **http://localhost:4001** (`npm run dev` chạy port 4001)

---

## Detailed docs (read before working)

| Topic | File |
|---|---|
| Styling, naming, color system, Tailwind classes | [`.agent/conventions.md`](.agent/conventions.md) |
| Step-by-step: adding a new feature | [`.agent/workflows/new-feature.md`](.agent/workflows/new-feature.md) |
| Database CRUD patterns, Supabase usage | [`.agent/workflows/database.md`](.agent/workflows/database.md) |
| UI components: BottomSheet, Card, Form patterns | [`.agent/workflows/ui-components.md`](.agent/workflows/ui-components.md) |
| What NOT to do | [`.agent/anti-patterns.md`](.agent/anti-patterns.md) |

---

## Quick rules

1. New feature order: **database types → hook → components → page → navigation (3 files)**
2. Never fetch data in a page component — always use a hook
3. Never `window.confirm` / `alert` — use `BottomSheet` with inline confirm UI
4. Always scope Supabase queries with `.eq('user_id', user.id)`
5. Always use `formatAmount()` from `useCurrency()` for money display
6. Navigation: update `Sidebar.tsx` + `MobileHeader.tsx` + `BottomNav.tsx` — all 3
