'use client'

import { useEffect } from 'react'
import { checkAndUpdateVersion, showUpdateNotification } from '@/lib/version'

/**
 * 版本管理組件
 * 在應用程式載入時自動檢查版本並處理快取清除
 */
export default function VersionManager() {
  useEffect(() => {
    // 延遲執行版本檢查，避免阻塞初始渲染
    const timer = setTimeout(() => {
      const wasUpdated = checkAndUpdateVersion()
      
      if (wasUpdated) {
        // 顯示更新通知
        showUpdateNotification()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // 這個組件不渲染任何內容
  return null
}