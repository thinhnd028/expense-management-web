'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Wallet, ArrowLeftRight, Users,
  TrendingUp, Settings, ShoppingBag, Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'

export const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/wallets', icon: Wallet, label: 'Wallets' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/debts', icon: Users, label: 'Debts' },
  { href: '/shopee', icon: ShoppingBag, label: 'Shopee' },
  { href: '/sepay', icon: Building2, label: 'SePay' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r border-border bg-background sm:flex">
        {/* Logo + main nav */}
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <TrendingUp className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">ExpenseFlow</span>
          </Link>

          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                      isActive
                        ? 'bg-accent text-black'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        {/* Settings at bottom */}
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  )
}
