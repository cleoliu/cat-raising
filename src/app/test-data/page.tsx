'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDataPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          setError('需要先登入')
          setLoading(false)
          return
        }

        const { data: records, error: recordsError } = await supabase
          .from('food_calculations')
          .select(`
            *,
            cats (
              id,
              name,
              avatar_id
            ),
            food_calculation_cats (
              cat_id,
              cats (
                id,
                name,
                avatar_id
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (recordsError) {
          setError('載入資料失敗：' + recordsError.message)
        } else {
          setData(records || [])
        }
      } catch (err: any) {
        setError('意外錯誤：' + err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <div className="p-4">載入中...</div>
  if (error) return <div className="p-4 text-red-600">錯誤: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">數據結構測試</h1>
        
        {data.length === 0 ? (
          <p className="text-gray-600">沒有資料</p>
        ) : (
          <div className="space-y-4">
            {data.map((record, index) => (
              <div key={record.id} className="bg-white p-4 rounded-lg shadow border">
                <h3 className="font-semibold text-lg mb-2">
                  記錄 {index + 1}: {record.brand_name} - {record.product_name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-600 mb-1">舊的單貓關聯 (cat_id):</h4>
                    <p className="mb-1"><strong>cat_id:</strong> {record.cat_id || 'null'}</p>
                    {record.cats ? (
                      <div className="bg-blue-50 p-2 rounded">
                        <p><strong>貓咪:</strong> {record.cats.name}</p>
                        <p><strong>頭像:</strong> {record.cats.avatar_id}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">無單貓關聯</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-green-600 mb-1">新的多貓關聯表:</h4>
                    {record.food_calculation_cats && record.food_calculation_cats.length > 0 ? (
                      <div className="space-y-1">
                        <p><strong>關聯數量:</strong> {record.food_calculation_cats.length}</p>
                        {record.food_calculation_cats.map((association: any, idx: number) => (
                          <div key={association.cat_id} className="bg-green-50 p-2 rounded">
                            <p><strong>貓咪 {idx + 1}:</strong> {association.cats.name}</p>
                            <p><strong>頭像:</strong> {association.cats.avatar_id}</p>
                            <p><strong>ID:</strong> {association.cat_id}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">無多貓關聯</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  創建時間: {new Date(record.created_at).toLocaleString('zh-TW')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}