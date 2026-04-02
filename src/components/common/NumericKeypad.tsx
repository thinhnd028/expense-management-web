'use client'

import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumericKeypadProps {
  value: string
  onChange: (value: string) => void
}

export default function NumericKeypad({ value, onChange }: NumericKeypadProps) {
  const handleKey = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1) || '0')
      return
    }
    if (key === '.') {
      if (value.includes('.')) return
      onChange(value + '.')
      return
    }
    const [int, dec] = (value === '0' ? '' : value).split('.')
    if (dec !== undefined && dec.length >= 2) return
    if (!dec && int && int.length >= 10) return
    onChange(value === '0' && key !== '.' ? key : value + key)
  }

  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'del']

  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handleKey(key)}
          className={cn(
            'flex items-center justify-center h-14 rounded-2xl text-xl font-medium transition-all active:scale-95',
            key === 'del'
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
              : 'bg-muted text-foreground hover:bg-muted/70'
          )}
        >
          {key === 'del' ? <Delete className="w-5 h-5" /> : key}
        </button>
      ))}
    </div>
  )
}
