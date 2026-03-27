# Workflow: UI Components

## Always invoke `/frontend-design` first

Before writing any new page or major component, invoke the `/frontend-design` skill. This ensures:
- Consistent visual quality
- Correct use of the design system
- No generic AI-looking UI

---

## Available shared components

Import from `@/components/ui/`:

| Component | Usage |
|---|---|
| `BottomSheet` | All create/edit/confirm modals |
| `EmptyState` | When a list has no items |
| `Button` | Standard buttons (has variant, size, loading props) |
| `Input` | Text inputs with label + error |
| `Select` | Dropdowns |
| `NumericKeypad` | Amount entry (transactions, debts) |
| `DynamicIcon` | Render category icons by name |

Radix primitives (already installed):
- `@/components/ui/tooltip` → `Tooltip, TooltipContent, TooltipTrigger, TooltipProvider`
- `@/components/ui/dropdown-menu` → `DropdownMenu, ...`
- `@/components/ui/sheet` → `Sheet, SheetContent, ...`

---

## Modal rules

- **Always use `BottomSheet`** for create/edit/delete confirm — never inline forms in the page
- Dismiss: overlay click OR close button
- One BottomSheet per action (create, edit, delete = 3 separate BottomSheet instances in page state)
- Delete confirm: small inline UI inside BottomSheet — show item name, two buttons (cancel / confirm delete)
- **Never use `window.confirm`**, `alert`, or toast for confirmations

---

## Card component pattern

```tsx
interface [Feature]CardProps {
  item: YourType
  onEdit?: (item: YourType) => void
  onDelete?: (item: YourType) => void
}

export default function [Feature]Card({ item, onEdit, onDelete }: [Feature]CardProps) {
  const { formatAmount } = useCurrency()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between">
        {/* Left: icon + info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <SomeIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{item.name}</p>
            <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
          </div>
        </div>
        {/* Right: amount + actions */}
        <div className="flex items-center gap-2">
          <p className="font-bold text-gray-900">{formatAmount(item.amount)}</p>
          {onEdit && (
            <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <Pencil className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Form component pattern

```tsx
export default function [Feature]Form({ item, userId, onSuccess, onCancel }: Props) {
  const supabase = createClient()
  const [name, setName] = useState(item?.name ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    // 1. Validate
    if (!name.trim()) { setError('Name is required'); return }
    // 2. Save
    setLoading(true)
    const { error: dbError } = item
      ? await supabase.from('table').update({ name }).eq('id', item.id)
      : await supabase.from('table').insert({ user_id: userId, name })
    setLoading(false)
    if (dbError) { setError(dbError.message); return }
    // 3. Done
    onSuccess()
  }

  return (
    <div className="p-5 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">{item ? 'Edit' : 'Add'} Feature</h2>
      {/* fields */}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />{error}
        </p>
      )}
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm disabled:opacity-60 active:scale-[0.98] transition-all">
          {loading ? 'Saving...' : item ? 'Save' : 'Add'}
        </button>
      </div>
    </div>
  )
}
```

---

## Loading state

Use skeleton divs, not spinners, for list loading:
```tsx
{loading ? (
  <div className="space-y-3">
    {[1,2,3].map(i => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
    ))}
  </div>
) : ( ... )}
```

---

## Mobile responsiveness

- Default layout: stacked (`space-y-3` or `space-y-4`)
- Grid when appropriate: `grid grid-cols-1 sm:grid-cols-2 gap-3`
- Never fixed pixel widths for content areas
- Bottom navigation exists — content must not be hidden behind it: bottom pages use `pb-20 sm:pb-0`
