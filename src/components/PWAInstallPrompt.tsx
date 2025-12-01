'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // 檢查瀏覽器環境
    if (typeof window === 'undefined') return

    // 檢查是否為iOS設備
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    // 檢查是否已安裝
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const webAppNavigator = window.navigator as Navigator & { standalone?: boolean }
    const isInWebApp = 'standalone' in webAppNavigator && Boolean(webAppNavigator.standalone)
    
    // 批次更新狀態
    setIsIOS(isIOSDevice)
    setIsInstalled(isStandalone || isInWebApp)

    // 監聽beforeinstallprompt事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // 檢查用戶是否之前拒絕過安裝
      const hasDeclined = localStorage.getItem('pwa-install-declined')
      if (!hasDeclined) {
        setShowPrompt(true)
      }
    }

    // 監聽應用安裝事件
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      localStorage.removeItem('pwa-install-declined')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // 註冊Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'dismissed') {
      localStorage.setItem('pwa-install-declined', 'true')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-declined', 'true')
  }

  // 不顯示提示的情況
  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[10000] animate-slide-up">
      <div className="glass rounded-2xl p-4 border border-primary/30 shadow-2xl backdrop-blur-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              安裝貓咪生活管理 App
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {isIOS 
                ? '點擊分享按鈕，然後選擇「加入主畫面」，隨時管理愛貓生活'
                : '安裝到主畫面，隨時記錄貓咪健康、提醒重要任務'
              }
            </p>
            
            <div className="flex gap-2">
              {!isIOS && (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium"
                >
                  <Download className="h-4 w-4 mr-1" />
                  安裝
                </Button>
              )}
              
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="border-primary/30"
              >
                稍後再說
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}