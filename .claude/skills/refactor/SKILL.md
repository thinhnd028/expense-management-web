# Skill: refactor

Refactor the selected code following this codebase's conventions.

## Instructions

When this skill is invoked:

1. Look at the user's IDE selection (marked with `ide_selection` tags). If there is no selection, ask the user to select some code first.
2. Read the full file containing the selection before suggesting changes.
3. Identify concrete improvements in these areas (only report what actually applies):
   - **Duplication**: Extract repeated logic into a hook (`src/hooks/`) or utility (`src/lib/utils.ts`)
   - **Component split**: Break large client components into smaller focused ones
   - **Data fetching**: Move fetch logic out of components into custom hooks following the `useWallets`/`useTransactions` pattern
   - **Type safety**: Use types from `src/types/database.ts` instead of inline or `any`
   - **Readability**: Simplify conditional rendering, reduce nesting, prefer `cn()` for class composition
   - **Supabase patterns**: Use the correct client (server vs browser), handle errors properly
4. Apply the refactored code directly using Edit — do not just describe the changes.
5. Do not refactor beyond the selected code's scope, add features, or change behavior.
