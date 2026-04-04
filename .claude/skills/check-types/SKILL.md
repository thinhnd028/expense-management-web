# Skill: check-types

Chạy TypeScript type-check và tự động sửa các lỗi tìm thấy.

## Instructions

When this skill is invoked:

1. Run the TypeScript compiler in no-emit mode:

```bash
npx tsc --noEmit
```

2. Parse the output. If there are no errors, report that types are clean.
3. If there are errors, group them by file and fix them one file at a time:
   - Read the full file before editing
   - Fix only the reported type errors — do not refactor surrounding code
   - Prefer using existing types from `src/types/database.ts` over writing new inline types
   - For Supabase query results, use the generated types (e.g. `Tables<'wallets'>`, `TablesInsert<'transactions'>`)
   - Do not suppress errors with `as any` or `// @ts-ignore` unless genuinely unavoidable, and explain why if you do
4. After fixing, re-run `npx tsc --noEmit` to confirm errors are resolved.
5. Report a summary of what was fixed.
