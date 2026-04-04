# Skill: explain-code

Explain the selected code in the context of this codebase.

## Instructions

When this skill is invoked:

1. Look at the user's IDE selection (marked with `ide_selection` tags). If there is no selection, ask the user to select some code first.
2. Explain what the code does clearly and concisely:
   - **Purpose**: What problem it solves or what role it plays
   - **How it works**: Step-by-step walkthrough of the logic
   - **Key dependencies**: Any hooks, utilities, or external APIs it relies on (e.g. Supabase, CurrencyContext, TanStack Table)
   - **Data flow**: Where data comes from and where it goes (especially relevant for hooks, server components, and form handlers)
3. Use the codebase context — reference related files by path when relevant (e.g. `src/hooks/useWallets.ts`, `src/lib/supabase/client.ts`).
4. Keep the explanation at the right level — don't explain basic TypeScript/React unless that is clearly what's being asked.
5. If the code has non-obvious behavior (RLS implications, atomic DB operations, currency formatting, date locale), call that out.
