'use client'

import { Delete } from 'lucide-react'

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
    // Max 10 digits + 2 decimal places
    const [int, dec] = (value === '0' ? '' : value).split('.')
    if (dec !== undefined && dec.length >= 2) return
    if (!dec && int && int.length >= 10) return

    if (value === '0' && key !== '.') {
      onChange(key)
    } else {
      onChange(value + key)
    }
  }

  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'del']

  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handleKey(key)}
          className={`
            flex items-center justify-center h-14 rounded-2xl text-xl font-medium
            transition-all active:scale-95
            ${key === 'del'
              ? 'bg-red-50 text-red-500'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }
          `}
        >
          {key === 'del' ? <Delete className="w-5 h-5" /> : key}
        </button>
      ))}
    </div>
  )
}
