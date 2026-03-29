'use client'

import { useState } from 'react'
import { Search, Bell, Info } from 'lucide-react'
import { Profile } from '@/types/database'

interface HeaderProps {
  profile: Profile | null
}

const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']

export default function MobileHeader({ profile: _ }: HeaderProps) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-white border-b border-black/5 px-6 shrink-0">
      {/* Left: Search */}
      <div className="flex items-center gap-2 bg-[#f3f4f5] rounded-xl px-3 py-2 w-64">
        <Search className="w-4 h-4 text-[#454652] shrink-0" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="bg-transparent text-sm text-[#191c1d] placeholder:text-[#454652] outline-none w-full"
        />
      </div>

      <div className="flex-1" />

      {/* Right: icons + date select */}
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-full text-[#454652] hover:bg-[#edeeef] transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full text-[#454652] hover:bg-[#edeeef] transition-colors">
          <Info className="w-4 h-4" />
        </button>

        {/* Date selector */}
        <div className="flex items-center gap-1 ml-1">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="text-sm font-medium text-[#191c1d] bg-[#f3f4f5] border-none rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:bg-[#edeeef] transition-colors appearance-none"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="text-sm font-medium text-[#191c1d] bg-[#f3f4f5] border-none rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:bg-[#edeeef] transition-colors appearance-none"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
