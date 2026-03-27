'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, Plus, Users, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/wallets', icon: Wallet, label: 'Wallets' },
  { href: '/transactions/new', icon: Plus, label: 'Add', isAdd: true },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/debts', icon: Users, label: 'Debts' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-background border-t border-border pb-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : item.href === '/transactions'
            ? pathname === '/transactions'
            : pathname.startsWith(item.href)

          if (item.isAdd) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 -mt-5 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                  <Plus className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-primary font-medium mt-1">Add</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-15"
            >
              <item.icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-[10px] font-medium transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
