/**
 * 應用程式版本管理
 * 版本號在建置時自動生成，無需手動更新
 */

import { GENERATED_VERSION, VERSION_INFO } from './version.generated'

export const APP_VERSION = GENERATED_VERSION
export const VERSION_KEY = 'cat_raising_app_version'
export { VERSION_INFO }

/**
 * 檢查應用程式版本，如果版本不匹配則清除相關快取
 */
export const checkAndUpdateVersion = () => {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY)
    
    if (storedVersion !== APP_VERSION) {
      console.log(`版本更新：${storedVersion} -> ${APP_VERSION}，正在清除快取...`)
      
      // 清除應用程式相關的快取
      clearApplicationCache()
      
      // 更新版本號
      localStorage.setItem(VERSION_KEY, APP_VERSION)
      
      return true // 表示有版本更新
    }
    
    return false // 沒有版本更新
  } catch (error) {
    console.error('版本檢查失敗:', error)
    return false
  }
}

/**
 * 清除應用程式快取
 */
const clearApplicationCache = () => {
  try {
    // 清除 localStorage 中的應用程式資料（保留版本號和重要設定）
    const keysToKeep = [VERSION_KEY, 'supabase.auth.token']
    const allKeys = Object.keys(localStorage)
    
    allKeys.forEach(key => {
      if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
        localStorage.removeItem(key)
      }
    })
    
    // 清除 sessionStorage
    sessionStorage.clear()
    
    // 強制重新載入頁面以清除記憶體快取
    if (typeof window !== 'undefined') {
      // 使用 location.reload(true) 強制從伺服器重新載入
      window.location.reload()
    }
    
    console.log('應用程式快取已清除')
  } catch (error) {
    console.error('清除快取失敗:', error)
  }
}

/**
 * 手動清除快取（供使用者使用）
 */
export const manualClearCache = () => {
  if (confirm('這將清除應用程式快取並重新載入頁面。是否繼續？')) {
    clearApplicationCache()
  }
}

/**
 * 獲取當前版本號
 */
export const getCurrentVersion = () => APP_VERSION

/**
 * 顯示版本更新通知
 */
export const showUpdateNotification = () => {
  const notification = document.createElement('div')
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 300px;
      backdrop-filter: blur(10px);
    ">
      <div style="font-weight: 600; margin-bottom: 8px;">🎉 應用程式已更新</div>
      <div style="font-size: 14px; opacity: 0.9;">版本 ${APP_VERSION}，快取已自動清除以確保最佳體驗！</div>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // 3秒後自動移除通知
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 3000)
}