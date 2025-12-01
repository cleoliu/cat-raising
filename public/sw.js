const CACHE_NAME = 'cat-raising-v1.0.0'
const urlsToCache = [
  '/',
  '/dashboard',
  '/calculator',
  '/cats',
  '/auth/login',
  '/auth/register',
  '/cats/cat-0.png',
  '/cats/cat-1.png',
  '/cats/cat-2.png',
  '/cats/cat-3.png',
  '/cats/cat-4.png',
  '/cats/cat-5.png',
  '/cats/cat-6.png',
  '/cats/cat-7.png',
  '/cats/cat-8.png',
  '/cats/cat-9.png',
  '/cats/cat-10.png',
  '/cats/cat-11.png',
  '/cats/cat-12.png',
  '/cats/cat-13.png',
  '/cats/cat-14.png',
  '/cats/cat-15.png',
  '/hero-cover.png',
  '/manifest.json'
]

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
  self.skipWaiting()
})

// 啟用 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  // 跳過非 HTTP(S) 請求
  if (!event.request.url.startsWith('http')) {
    return
  }

  // 跳過 Supabase API 請求，保持線上功能
  if (event.request.url.includes('supabase.co')) {
    return fetch(event.request)
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在快取中找到，返回快取版本
        if (response) {
          return response
        }

        // 否則發出網路請求
        return fetch(event.request).then((response) => {
          // 檢查是否收到有效回應
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // 複製回應，因為它是串流且只能使用一次
          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })

          return response
        }).catch(() => {
          // 網路失敗時，嘗試返回離線頁面
          if (event.request.destination === 'document') {
            return caches.match('/')
          }
        })
      })
  )
})

// 處理背景同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // 可以在這裡實現背景資料同步邏輯
  console.log('Background sync triggered')
}

// 處理推送通知（未來擴展功能）
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '您有新的貓咪營養資訊！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看詳情',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '關閉',
        icon: '/icons/xmark.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Cat-Raising', options)
  )
})

// 處理通知點擊
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})