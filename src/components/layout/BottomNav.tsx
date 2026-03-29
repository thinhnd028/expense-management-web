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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg flex justify-around py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-safe">
      {navItems.map((item) => {
        const isActive = item.href === '/'
          ? pathname === '/'
          : item.href === '/transactions'
          ? pathname === '/transactions'
          : pathname.startsWith(item.href)

        if (item.isAdd) {
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-0.5">
              <div className="w-12 h-12 -mt-5 hero-gradient rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold text-[#0e1c2b] mt-1">Thêm</span>
            </Link>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-3"
          >
            <item.icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-[#0e1c2b]' : 'text-[#454652]')} />
            <span className={cn('text-[10px] font-bold transition-colors', isActive ? 'text-[#0e1c2b]' : 'text-[#454652]')}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
