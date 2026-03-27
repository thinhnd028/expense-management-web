# Code Conventions

## Tech stack (do not add alternatives)
- Framework: Next.js 16 + React 19
- Styling: Tailwind CSS 4 — no CSS modules, no styled-components
- Icons: `lucide-react` only
- Charts: `chart.js` + `react-chartjs-2` (already installed) — register only needed components, never import all
- UI primitives: Radix UI (tooltip, dropdown-menu, sheet) — already installed
- Backend: Supabase (Postgres + Auth)
- Date: `date-fns` (already installed)

---

## File naming & placement

| What | Where | Name pattern |
|---|---|---|
| Dashboard page | `src/app/(dashboard)/[feature]/page.tsx` | `page.tsx` |
| API route | `src/app/api/[feature]/[action]/route.ts` | `route.ts` |
| Data hook | `src/hooks/` | `use[Feature].ts` |
| Feature components | `src/components/[feature]/` | `[Feature]Card.tsx`, `[Feature]Form.tsx` |
| Shared UI | `src/components/ui/` | PascalCase |

---

## Tailwind class standards

| Element | Classes |
|---|---|
| Page card / section | `bg-white rounded-2xl border border-gray-100 shadow-sm` |
| Icon container | `w-10 h-10 rounded-xl bg-{color}-50 flex items-center justify-center` |
| Primary button | `bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold active:scale-[0.98]` |
| Danger button | `border border-red-200 text-red-500 hover:bg-red-50 rounded-xl` |
| Ghost button | `text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl` |
| Input | `bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent` |
| Tab bar | `flex gap-1 bg-gray-100 p-1 rounded-2xl` |
| Tab item active | `bg-white text-gray-900 shadow-sm rounded-xl` |
| Tab item inactive | `text-gray-500 hover:text-gray-700 rounded-xl` |
| Section title | `font-semibold text-gray-800` |
| Muted label | `text-xs text-gray-400` |
| Amount income | `text-emerald-600 font-semibold` |
| Amount expense | `text-red-500 font-semibold` |
| Amount transfer | `text-blue-600 font-semibold` |

Always use `cn()` from `@/lib/utils` for conditional classes.

---

## Color system

- Primary action: `indigo-600 / indigo-700`
- Income / success: `emerald-500 / emerald-600`
- Expense / danger: `red-500 / red-600`
- Transfer / info: `blue-500 / blue-600`
- Warning: `amber-500 / amber-600`
- Backgrounds: `gray-50` (input), `gray-100` (section bg), `white` (card)
- Borders: `gray-100` (card border), `gray-200` (input border)
- Text primary: `gray-900`
- Text secondary: `gray-500 / gray-600`
- Text muted: `gray-400`

Wallet card gradients: always inline style `background: 'linear-gradient(135deg, color1, color2)'`

---

## Formatting utilities — never format manually

```typescript
import { formatAmount } from '@/contexts/CurrencyContext'   // ← via useCurrency()
import { formatDate, formatDateShort, formatDateInput } from '@/lib/utils'
import { WALLET_COLORS } from '@/lib/utils'                 // reuse, don't invent new colors
```

- Money: always `formatAmount(value)` from `useCurrency()` hook
- Dates: always `formatDate()` or `formatDateShort()` from utils
- Tailwind merging: always `cn()` from `@/lib/utils`

---

## TypeScript rules

- No `any` — use types from `src/types/database.ts`
- Extend existing types with interfaces when needed
- Export convenience types at bottom of `database.ts` (e.g. `export type Wallet = ...`)
- Props interfaces above the component, not inline
