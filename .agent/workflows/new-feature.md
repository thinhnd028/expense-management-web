# Workflow: Adding a New Feature

## Step 1 — Invoke frontend-design skill first
Before writing any UI code, invoke `/frontend-design` to get design direction.

---

## Step 2 — Database types
Add to `src/types/database.ts` inside the `Tables` object:

```typescript
your_table: {
  Row: {
    id: string
    user_id: string
    // ... fields
    created_at: string
  }
  Insert: {
    id?: string
    user_id: string
    // ... required fields, optional with ?
  }
  Update: {
    // all optional
  }
  Relationships: []
}
```

Also add convenience type at the bottom:
```typescript
export type YourType = Database['public']['Tables']['your_table']['Row']
```

---

## Step 3 — Data hook

Create `src/hooks/use[Feature].ts`:

```typescript
'use client'
import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { YourType } from '@/types/database'

export function use[Feature]() {
  const supabase = createClient()
  const [items, setItems] = useState<YourType[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('your_table')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { items, loading, refetch: fetch }
}
```

Rules:
- Always get `user.id` via `supabase.auth.getUser()` — never hardcode
- Always guard: if no user, return early
- After mutations: call `refetch()` — never manually merge state

---

## Step 4 — Components

Create `src/components/[feature]/[Feature]Card.tsx`:
- Show item data with consistent card styling
- Top-right: edit + delete icon buttons
- Use `useCurrency()` for amounts, `formatDate()` for dates

Create `src/components/[feature]/[Feature]Form.tsx`:
```typescript
interface [Feature]FormProps {
  item?: YourType | null   // null = create mode, defined = edit mode
  userId: string
  onSuccess: () => void
  onCancel: () => void
}
```
- Validate all fields before calling Supabase
- Show errors inline (no toast, no alert)
- Disable submit button while `loading`
- On success: call `onSuccess()`

---

## Step 5 — Page

Create `src/app/(dashboard)/[feature]/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { use[Feature] } from '@/hooks/use[Feature]'
import BottomSheet from '@/components/ui/BottomSheet'
import EmptyState from '@/components/ui/EmptyState'
import [Feature]Card from '@/components/[feature]/[Feature]Card'
import [Feature]Form from '@/components/[feature]/[Feature]Form'

export default function [Feature]Page() {
  const { items, loading, refetch } = use[Feature]()
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<YourType | null>(null)
  const [deleteItem, setDeleteItem] = useState<YourType | null>(null)

  return (
    <div className="space-y-4">
      {/* Header row: title + add button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Feature Name</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-all">
          <PlusCircle className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : items.length === 0 ? (
        <EmptyState ... />
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <[Feature]Card key={item.id} item={item}
              onEdit={item => { setEditItem(item); setShowForm(true) }}
              onDelete={item => setDeleteItem(item)} />
          ))}
        </div>
      )}

      {/* Create/Edit form */}
      <BottomSheet open={showForm} onClose={() => { setShowForm(false); setEditItem(null) }}>
        <[Feature]Form
          item={editItem}
          userId={userId}
          onSuccess={() => { setShowForm(false); setEditItem(null); refetch() }}
          onCancel={() => { setShowForm(false); setEditItem(null) }} />
      </BottomSheet>

      {/* Delete confirm */}
      <BottomSheet open={!!deleteItem} onClose={() => setDeleteItem(null)}>
        {/* inline confirm UI */}
      </BottomSheet>
    </div>
  )
}
```

---

## Step 6 — Navigation (all 3 files)

```typescript
// src/components/layout/Sidebar.tsx — navItems
{ href: '/[feature]', icon: SomeIcon, label: 'Feature Name' }

// src/components/layout/MobileHeader.tsx — pageTitles
'/[feature]': 'Feature Name'

// src/components/layout/BottomNav.tsx — add matching entry
```

Do not skip any of the 3 navigation files.

---

## Step 7 — Run /simplify
After all code is written, invoke `/simplify` to check for unnecessary complexity.
