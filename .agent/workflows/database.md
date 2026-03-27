# Workflow: Database Operations

## Clients — use the right one

| Context | Import |
|---|---|
| Hook / Client Component | `import { createClient } from '@/lib/supabase/client'` |
| Server Component / API Route | `import { createClient } from '@/lib/supabase/server'` |

Always await `supabase.auth.getUser()` to get user — never assume.

---

## CRUD patterns

### Read (in hook)
```typescript
const { data } = await supabase
  .from('table')
  .select('*, related_table(*)')   // join with *
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

### Create
```typescript
const { error } = await supabase
  .from('table')
  .insert({ user_id: user.id, ...fields })
if (error) { setError(error.message); return }
onSuccess()
```

### Update
```typescript
const { error } = await supabase
  .from('table')
  .update({ ...fields })
  .eq('id', item.id)
  .eq('user_id', user.id)   // always scope to user
```

### Delete
```typescript
const { error } = await supabase
  .from('table')
  .delete()
  .eq('id', item.id)
  .eq('user_id', user.id)   // always scope to user
```

### RPC (atomic multi-table)
Use only when operation needs to update multiple tables atomically (like creating a transaction that also updates wallet balance):
```typescript
const { data, error } = await supabase.rpc('function_name', {
  p_param1: value1,
  p_param2: value2,
})
```
Existing RPCs: `create_transaction`, `delete_transaction`

---

## After any mutation

Call `refetch()` from the hook. Never try to manually update state arrays.

```typescript
// ✅ correct
await supabase.from('table').insert(...)
onSuccess()  // which calls refetch()

// ❌ wrong
const newItem = { ...data }
setItems(prev => [...prev, newItem])
```

---

## Error handling

```typescript
const { data, error } = await supabase.from('table').insert(...)
if (error) {
  setError(error.message)
  return
}
```

Show error inline in the form. Never use `console.error` as the only handler.

---

## Adding a new table to the schema

1. Write the SQL migration
2. Update `src/types/database.ts` — add to `Tables` object + convenience type
3. Never query tables not in `database.ts` (no type safety)
