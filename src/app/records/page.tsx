'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface FoodRecord {
  id: string
  brand_name: string
  product_name: string
  protein_percent: number
  fat_percent: number
  fiber_percent: number
  ash_percent: number
  moisture_percent: number
  dry_matter_content: number
  dm_protein: number
  dm_fat: number
  dm_fiber: number
  dm_ash: number
  favorited: boolean
  created_at: string
  cats?: {
    name: string
  }
}

export default function RecordsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [records, setRecords] = useState<FoodRecord[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadRecords = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('food_calculations')
        .select(`
          *,
          cats (name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading records:', error)
        return
      }

      setRecords(data || [])
    } catch (error) {
      console.error('Error loading records:', error)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      await loadRecords(user.id)
      setLoading(false)
    }

    getUser()
  }, [router])

  const toggleFavorite = async (recordId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('food_calculations')
        .update({ favorited: !currentFavorite })
        .eq('id', recordId)

      if (error) {
        console.error('Error toggling favorite:', error)
        return
      }

      // Update local state
      setRecords(records.map(record => 
        record.id === recordId 
          ? { ...record, favorited: !currentFavorite }
          : record
      ))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                貓咪乾物質計算器
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">計算記錄</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/calculator">
                <Button variant="outline">新增計算</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">返回首頁</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">計算記錄</h1>
            <p className="text-gray-600 mt-1">查看您的所有營養計算記錄</p>
          </div>

          {/* Records List */}
          {records.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    📊
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    還沒有計算記錄
                  </h3>
                  <p className="text-gray-600 mb-4">
                    開始您的第一次營養計算
                  </p>
                  <Link href="/calculator">
                    <Button>開始計算</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {record.brand_name} - {record.product_name}
                          {record.cats && (
                            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              🐱 {record.cats.name}
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {new Date(record.created_at).toLocaleString('zh-TW')}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(record.id, record.favorited)}
                      >
                        {record.favorited ? '⭐' : '☆'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-600 font-medium">乾物質含量</div>
                        <div className="text-lg font-bold text-blue-900">{record.dry_matter_content}%</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-green-600 font-medium">DM 蛋白質</div>
                        <div className="text-lg font-bold text-green-900">{record.dm_protein}%</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-xs text-orange-600 font-medium">DM 脂肪</div>
                        <div className="text-lg font-bold text-orange-900">{record.dm_fat}%</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-xs text-purple-600 font-medium">DM 纖維</div>
                        <div className="text-lg font-bold text-purple-900">{record.dm_fiber}%</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                      原始數值：蛋白質 {record.protein_percent}% • 脂肪 {record.fat_percent}% • 
                      纖維 {record.fiber_percent}% • 灰分 {record.ash_percent}% • 水分 {record.moisture_percent}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}