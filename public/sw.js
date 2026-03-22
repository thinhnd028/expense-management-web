// Service Worker v4 — clears all old caches on activate
const CACHE_NAME = 'expenseflow-v4'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.hostname.includes('supabase')) return

  // JS/CSS chunks: always network-first (never stale)
  if (
    url.pathname.startsWith('/_next/') ||
    request.destination === 'script' ||
    request.destination === 'style'
  ) {
    event.respondWith(fetch(request))
    return
  }

  // Navigation: network-first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/') || new Response('Offline', { status: 503 })
      )
    )
    return
  }

  // Images only: cache-first
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          return res
        })
      })
    )
  }
})
