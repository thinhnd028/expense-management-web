'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, HandCoins, CheckCheck, Trash2 } from 'lucide-react'
import { DebtWithTransactions } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateShort } from '@/lib/utils'

const TYPE_LABEL = { borrow: 'Tôi đang nợ', lend: 'Người nợ tôi' }
const TYPE_CLASS  = {
  borrow: 'bg-rose-100 text-rose-700 border-rose-200',
  lend:   'bg-amber-100 text-amber-700 border-amber-200',
}
const STATUS_CLASS = {
  unpaid: 'bg-orange-100 text-orange-700 border-orange-200',
  paid:   'bg-emerald-100 text-emerald-700 border-emerald-200',
}

interface ColumnOptions {
  onRepay:     (debt: DebtWithTransactions) => void
  onMarkPaid:  (debt: DebtWithTransactions) => void
  onDelete:    (debt: DebtWithTransactions) => void
  formatAmount:(n: number) => string
}

export function getColumns({ onRepay, onMarkPaid, onDelete, formatAmount }: ColumnOptions): ColumnDef<DebtWithTransactions>[] {
  return [
    // ── Name ──────────────────────────────────────────────────────
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost" size="sm"
          className="-ml-2 h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Người <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{row.getValue<string>('name')}</span>
      ),
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
        const type = row.getValue<DebtWithTransactions['type']>('type')
        return (
          <Badge className={`border text-xs font-semibold ${TYPE_CLASS[type]}`}>
            {TYPE_LABEL[type]}
          </Badge>
        )
      },
    },

    // ── Original Amount ───────────────────────────────────────────
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <Button
          variant="ghost" size="sm"
          className="h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Gốc <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-muted-foreground">
          {formatAmount(row.getValue<number>('amount'))}
        </span>
      ),
    },

    // ── Remaining ─────────────────────────────────────────────────
    {
      id: 'remaining',
      accessorFn: row => row.remaining ?? 0,
      header: ({ column }) => (
        <Button
          variant="ghost" size="sm"
          className="h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Còn lại <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const remaining = row.original.remaining ?? 0
        return (
          <span className={`font-bold tabular-nums ${remaining > 0 ? 'text-destructive' : 'text-emerald-700'}`}>
            {formatAmount(remaining)}
          </span>
        )
      },
    },

    // ── Status ────────────────────────────────────────────────────
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost" size="sm"
          className="h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Trạng thái <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue<DebtWithTransactions['status']>('status')
        return (
          <Badge className={`border text-xs font-semibold ${STATUS_CLASS[status]}`}>
            {status === 'paid' ? 'Đã xong' : 'Chưa trả'}
          </Badge>
        )
      },
    },

    // ── Due Date ──────────────────────────────────────────────────
    {
      accessorKey: 'due_date',
      header: ({ column }) => (
        <Button
          variant="ghost" size="sm"
          className="h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Hạn trả <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const due = row.getValue<string | null>('due_date')
        return (
          <span className="text-sm text-muted-foreground tabular-nums">
            {due ? formatDateShort(due) : '—'}
          </span>
        )
      },
    },

    // ── Actions ───────────────────────────────────────────────────
    {
      id: 'actions',
      header: () => <span className="sr-only">Thao tác</span>,
      cell: ({ row }) => {
        const debt = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="sr-only">Mở menu</span>
                </button>
              }
            />
            <DropdownMenuContent align="end">
              {debt.status === 'unpaid' && (
                <>
                  <DropdownMenuItem onClick={() => onRepay(debt)}>
                    <HandCoins className="w-3.5 h-3.5" />
                    Ghi nhận thanh toán
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMarkPaid(debt)}>
                    <CheckCheck className="w-3.5 h-3.5" />
                    Đánh dấu xong
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(debt)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
