# Anti-patterns — Never Do These

## State & data

| ❌ Wrong | ✅ Correct |
|---|---|
| Manually merge state after mutation | Call `refetch()` from hook |
| Fetch directly in page component | Create a `use[Feature]` hook |
| `useState` for server data in page | Use hook |
| Hardcode `user_id` | Always `await supabase.auth.getUser()` |
| Query without `.eq('user_id', user.id)` | Scope every query to the current user |

## UI & UX

| ❌ Wrong | ✅ Correct |
|---|---|
| `window.confirm(...)` | BottomSheet with confirm UI |
| `alert(...)` | Inline error message |
| Toast notifications | Inline error/success state |
| Inline form in page | BottomSheet modal |
| Format money manually (`toLocaleString`) | `formatAmount()` from `useCurrency()` |
| Format dates manually | `formatDate()` from `@/lib/utils` |
| Invent new Tailwind colors | Use color system from conventions.md |
| Add emoji to code/UI | Only if user explicitly asks |

## Code quality

| ❌ Wrong | ✅ Correct |
|---|---|
| `any` type | Types from `database.ts` |
| Add new npm package without checking | Check existing deps first |
| CSS modules / styled-components | Tailwind only |
| New icon library | `lucide-react` only |
| Create util function used once | Inline the logic |
| `console.error` as only error handler | Show error in UI |
| Backwards-compat shims for removed code | Delete cleanly |

## Navigation

| ❌ Wrong | ✅ Correct |
|---|---|
| Update only Sidebar.tsx | Update all 3: Sidebar + MobileHeader + BottomNav |
| Hardcode page title in component | Add to `pageTitles` in MobileHeader |

## Database

| ❌ Wrong | ✅ Correct |
|---|---|
| Query table not in `database.ts` | Add type to `database.ts` first |
| Multi-table mutations without RPC | Use `supabase.rpc()` for atomicity |
| Missing user scope in mutation | Always `.eq('user_id', user.id)` |
| Skip updating `database.ts` | Always keep types in sync |

## Features

| ❌ Wrong | ✅ Correct |
|---|---|
| Build page before hook | Hook → Components → Page |
| Add feature without design skill | Invoke `/frontend-design` first |
| Add optional configs "for future" | Build only what is asked |
| Add error handling for impossible cases | Trust Supabase + TS types |
