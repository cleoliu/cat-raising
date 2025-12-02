'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function DebugPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details }])
  }

  const runDiagnostics = async () => {
    try {
      // 1. 檢查用戶登入狀態
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        addResult('用戶認證', 'error', '用戶未登入或認證失敗', userError)
        setLoading(false)
        return
      }
      
      setUser(user)
      addResult('用戶認證', 'success', `用戶已登入: ${user.email}`)

      // 2. 測試基本數據庫連接
      const { data: testQuery, error: testError } = await supabase
        .from('cats')
        .select('id')
        .limit(1)

      if (testError) {
        addResult('數據庫連接', 'error', '無法連接到數據庫', testError)
      } else {
        addResult('數據庫連接', 'success', '數據庫連接正常')
      }

      // 3. 檢查關聯表是否存在
      try {
        const { data: associationTest, error: associationError } = await supabase
          .from('food_calculation_cats')
          .select('id')
          .limit(1)

        if (associationError) {
          addResult('關聯表測試', 'error', '關聯表不存在或無法訪問', associationError)
        } else {
          addResult('關聯表測試', 'success', '關聯表存在且可訪問')
        }
      } catch (err) {
        addResult('關聯表測試', 'error', '關聯表測試異常', err)
      }

      // 4. 測試創建關聯記錄的權限
      try {
        // 先創建一個測試食品記錄
        const { data: testFood, error: foodError } = await supabase
          .from('food_calculations')
          .insert({
            user_id: user.id,
            brand_name: 'TEST_BRAND',
            product_name: 'TEST_PRODUCT', 
            food_weight: 100,
            protein_percent: 30,
            fat_percent: 15,
            fiber_percent: 3,
            ash_percent: 8,
            moisture_percent: 10,
            dry_matter_content: 90,
            dm_protein: 33.3,
            dm_fat: 16.7,
            dm_fiber: 3.3,
            dm_ash: 8.9,
            favorited: false
          })
          .select()
          .single()

        if (foodError) {
          addResult('測試食品創建', 'error', '無法創建測試食品記錄', foodError)
        } else {
          addResult('測試食品創建', 'success', '測試食品記錄創建成功')

          // 獲取用戶的貓咪
          const { data: userCats, error: catsError } = await supabase
            .from('cats')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)

          if (catsError || !userCats || userCats.length === 0) {
            addResult('貓咪數據', 'warning', '沒有找到用戶的貓咪數據，無法測試關聯創建')
          } else {
            // 測試創建關聯
            const { error: associationInsertError } = await supabase
              .from('food_calculation_cats')
              .insert({
                food_calculation_id: testFood.id,
                cat_id: userCats[0].id
              })

            if (associationInsertError) {
              addResult('關聯創建測試', 'error', '無法創建關聯記錄', associationInsertError)
            } else {
              addResult('關聯創建測試', 'success', '關聯記錄創建成功')
              
              // 清理測試關聯
              await supabase
                .from('food_calculation_cats')
                .delete()
                .eq('food_calculation_id', testFood.id)
            }
          }

          // 清理測試食品記錄
          await supabase
            .from('food_calculations')
            .delete()
            .eq('id', testFood.id)
        }
      } catch (err) {
        addResult('關聯測試', 'error', '關聯測試過程中發生異常', err)
      }

      // 5. 檢查環境資訊
      const envInfo = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
      
      addResult('環境資訊', 'success', '環境資訊收集完成', envInfo)

    } catch (error) {
      addResult('診斷過程', 'error', '診斷過程中發生未預期的錯誤', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h1 className="text-2xl font-bold mb-4">🔍 部署環境診斷</h1>
          <p className="text-gray-600 mb-4">
            這個頁面會幫助診斷部署環境中貓咪關聯功能的問題。
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>正在執行診斷測試...</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className={`bg-white rounded-lg shadow-md border-l-4 ${getStatusColor(result.status)}`}>
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{getStatusIcon(result.status)}</span>
                  <h3 className="font-semibold">{result.test}</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                      詳細資訊
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold mb-3">📋 診斷結果摘要</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-green-600">成功</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-600">警告</div>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-red-600">錯誤</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-700">
                💡 <strong>提示：</strong>如果看到錯誤，請將此頁面的結果截圖或複製詳細資訊，以便進一步診斷問題。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}