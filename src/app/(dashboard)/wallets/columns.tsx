'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Wallet } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const TYPE_LABEL: Record<Wallet['type'], string> = {
  cash:       'Tiền mặt',
  bank:       'Ngân hàng',
  'e-wallet': 'Ví điện tử',
}

const TYPE_CLASS: Record<Wallet['type'], string> = {
  cash:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  bank:       'bg-blue-100 text-blue-700 border-blue-200',
  'e-wallet': 'bg-purple-100 text-purple-700 border-purple-200',
}

interface ColumnOptions {
  onEdit:         (wallet: Wallet) => void
  onDelete:       (wallet: Wallet) => void
  formatAmount:   (n: number) => string
}

export function getColumns({ onEdit, onDelete, formatAmount }: ColumnOptions): ColumnDef<Wallet>[] {
  return [
    // ── Color + Name ───────────────────────────────────────────────
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tên ví <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const w = row.original
        return (
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: w.color }}
            />
            <span className="font-semibold text-foreground">{w.name}</span>
          </div>
        )
      },
    },

    // ── Type ───────────────────────────────────────────────────────
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Loại <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue<Wallet['type']>('type')
        return (
          <Badge className={`border text-xs font-semibold ${TYPE_CLASS[type]}`}>
            {TYPE_LABEL[type]}
          </Badge>
        )
      },
    },

    // ── Balance ────────────────────────────────────────────────────
    {
      accessorKey: 'balance',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Số dư <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-foreground">
          {formatAmount(row.getValue<number>('balance'))}
        </span>
      ),
    },

    // ── Created At ─────────────────────────────────────────────────
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ngày tạo <ArrowUpDown className="w-3 h-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const d = new Date(row.getValue<string>('created_at'))
        return (
          <span className="text-sm text-muted-foreground tabular-nums">
            {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        )
      },
    },

    // ── Actions ────────────────────────────────────────────────────
    {
      id: 'actions',
      header: () => <span className="sr-only">Thao tác</span>,
      cell: ({ row }) => {
        const w = row.original
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
              <DropdownMenuItem onClick={() => onEdit(w)}>
                <Pencil className="w-3.5 h-3.5" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(w)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa ví
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
