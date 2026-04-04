'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Trash2 } from 'lucide-react'
import { TransactionWithDetails } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateShort } from '@/lib/utils'

const TYPE_LABEL = { income: 'Thu nhập', expense: 'Chi tiêu', transfer: 'Chuyển khoản' }
const TYPE_CLASS = {
  income:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  expense:  'bg-red-100 text-red-700 border-red-200',
  transfer: 'bg-blue-100 text-blue-700 border-blue-200',
}
const AMOUNT_CLASS = {
  income:   'text-emerald-700',
  expense:  'text-destructive',
  transfer: 'text-foreground',
}
const AMOUNT_PREFIX = { income: '+', expense: '-', transfer: '' }

interface ColumnOptions {
  onDelete:     (id: string) => void
  formatAmount: (n: number) => string
}

export function getColumns({ onDelete, formatAmount }: ColumnOptions): ColumnDef<TransactionWithDetails>[] {
  return [
    // ── Date ──────────────────────────────────────────────────────
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <Button
          variant="ghost" size="sm"
          className="-ml-2 h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ngày <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDateShort(row.getValue<string>('date'))}
        </span>
      ),
    },

    // ── Description ───────────────────────────────────────────────
    {
      id: 'description',
      accessorFn: row => row.note || row.categories?.name || TYPE_LABEL[row.type],
      header: () => (
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mô tả</span>
      ),
      cell: ({ row }) => {
        const tx = row.original
        const label = tx.note || tx.categories?.name || TYPE_LABEL[tx.type]
        return <span className="font-medium text-foreground max-w-[180px] truncate block">{label}</span>
      },
    },

    // ── Type ──────────────────────────────────────────────────────
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <Button
          variant="ghost" size="sm"
          className="h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Loại <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue<TransactionWithDetails['type']>('type')
        return (
          <Badge className={`border text-xs font-semibold ${TYPE_CLASS[type]}`}>
            {TYPE_LABEL[type]}
          </Badge>
        )
      },
    },

    // ── Category ──────────────────────────────────────────────────
    {
      id: 'category',
      accessorFn: row => row.categories?.name ?? '',
      header: () => (
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Danh mục</span>
      ),
      cell: ({ row }) => {
        const name = row.original.categories?.name
        return name
          ? <span className="text-sm text-muted-foreground">{name}</span>
          : <span className="text-sm text-muted-foreground/40">—</span>
      },
    },

    // ── Wallet ────────────────────────────────────────────────────
    {
      id: 'wallet',
      accessorFn: row => (row.wallets as { name: string } | null)?.name ?? '',
      header: () => (
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ví</span>
      ),
      cell: ({ row }) => {
        const name = (row.original.wallets as { name: string } | null)?.name
        return <span className="text-sm text-muted-foreground">{name ?? '—'}</span>
      },
    },

    // ── Amount ────────────────────────────────────────────────────
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <Button
          variant="ghost" size="sm"
          className="h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Số tiền <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const tx = row.original
        return (
          <span className={`font-bold tabular-nums ${AMOUNT_CLASS[tx.type]}`}>
            {AMOUNT_PREFIX[tx.type]}{formatAmount(tx.amount)}
          </span>
        )
      },
    },

    // ── Actions ───────────────────────────────────────────────────
    {
      id: 'actions',
      header: () => <span className="sr-only">Xóa</span>,
      cell: ({ row }) => (
        <button
          onClick={() => onDelete(row.original.id)}
          className="p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ]
}
