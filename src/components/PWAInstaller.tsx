'use client'

import { useEffect } from 'react'

export default function PWAInstaller() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    async function setupSW() {
      // Clear ALL caches first to prevent stale JS
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))

      // Register SW — new SW will skipWaiting and claim clients immediately
      const reg = await navigator.serviceWorker.register('/sw.js')

      // If a new SW is waiting, activate it immediately
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing
        newSW?.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            newSW.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })
    }

    setupSW().catch(console.error)
  }, [])

  return null
}
