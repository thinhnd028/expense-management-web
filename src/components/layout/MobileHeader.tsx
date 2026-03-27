'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PanelLeft, TrendingUp, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'
import { cn } from '@/lib/utils'
import { navItems } from '@/components/layout/Sidebar'
import {
  Sheet, SheetContent, SheetTrigger, SheetClose,
} from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/wallets': 'Wallets',
  '/transactions': 'Transactions',
  '/transactions/new': 'New Transaction',
  '/debts': 'Debts',
  '/settings': 'Settings',
}

interface HeaderProps {
  profile: Profile | null
}

export default function MobileHeader({ profile }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] || 'ExpenseFlow'
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {/* Mobile sheet trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:text-foreground">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <SheetClose asChild>
              <Link
                href="/"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <TrendingUp className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">ExpenseFlow</span>
              </Link>
            </SheetClose>
            {navItems.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-4 px-2.5',
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </SheetClose>
              )
            })}
            <SheetClose asChild>
              <Link
                href="/settings"
                className={cn(
                  'flex items-center gap-4 px-2.5',
                  pathname.startsWith('/settings') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Breadcrumb (desktop) */}
      <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{title}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="overflow-hidden rounded-full border border-border outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm">
                {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <span className="sr-only">User menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
