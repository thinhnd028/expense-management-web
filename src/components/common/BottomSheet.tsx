'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export default function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={v => !v && onClose()}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />

        {/* Sheet */}
        <DialogPrimitive.Content
          className={cn(
            'fixed z-50 w-full max-w-lg bg-background rounded-t-2xl md:rounded-2xl',
            'bottom-0 left-1/2 -translate-x-1/2 md:top-1/2 md:bottom-auto md:-translate-y-1/2',
            'max-h-[90vh] overflow-y-auto shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out duration-300',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=open]:slide-in-from-bottom md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-bottom md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=closed]:zoom-out-95',
            className
          )}
        >
          {/* Mobile drag handle */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          {/* Header */}
          {title ? (
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <DialogPrimitive.Title className="font-semibold text-foreground text-base">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          ) : (
            <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
          )}

          <div className="px-5 py-4 pb-safe">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
