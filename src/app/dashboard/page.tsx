'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import type { User } from '@supabase/supabase-js'

interface Cat {
  id: string
  name: string
  age: number
  weight: number
  created_at: string
}

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

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null)
  const [cats, setCats] = useState<Cat[]>([])
  const [selectedCatId, setSelectedCatId] = useState<string>('all')
  const [records, setRecords] = useState<FoodRecord[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  const loadCats = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading cats:', error)
        return
      }

      setCats(data || [])
    } catch (error) {
      console.error('Error loading cats:', error)
    }
  }

  const loadRecords = async (userId: string, catId?: string) => {
    try {
      let query = supabase
        .from('food_calculations')
        .select(`
          *,
          cats (name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Filter by cat if specified
      if (catId && catId !== 'all') {
        query = query.eq('cat_id', catId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading records:', error)
        return
      }

      setRecords(data || [])
    } catch (error) {
      console.error('Error loading records:', error)
    }
  }

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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      await loadCats(user.id)
      
      // 檢查 URL 參數是否指定了貓咪
      const catParam = searchParams.get('cat')
      if (catParam) {
        setSelectedCatId(catParam)
        await loadRecords(user.id, catParam)
      } else {
        await loadRecords(user.id, selectedCatId)
      }
      
      setLoading(false)
    }

    getUser()

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, searchParams])

  // 當選擇貓咪改變時重新載入記錄
  useEffect(() => {
    if (user) {
      loadRecords(user.id, selectedCatId)
    }
  }, [selectedCatId, user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 將會被重導向到登入頁面
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">營養產品</h1>
              <p className="text-sm text-gray-600">管理貓咪的營養記錄</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-xs px-3 py-1">
              登出
            </Button>
          </div>

          {/* Cat Filter */}
          <div className="mb-4">
            <Select value={selectedCatId} onValueChange={setSelectedCatId}>
              <SelectTrigger className="w-full rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                <SelectValue placeholder="選擇貓咪篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🐾 所有貓咪</SelectItem>
                {cats.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    🐱 {cat.name} ({cat.age}歲, {cat.weight}kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Records List */}
        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              還沒有營養記錄
            </h3>
            <p className="text-gray-600 mb-6">
              開始第一次營養計算，建立產品記錄
            </p>
            <Link href="/calculator">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl">
                🧮 開始計算
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-3xl p-4 shadow-sm border border-blue-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {record.brand_name} - {record.product_name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {record.cats && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                          🐱 {record.cats.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(record.created_at).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(record.id, record.favorited)}
                    className="p-2"
                  >
                    {record.favorited ? '⭐' : '☆'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <div className="text-xs text-blue-600 font-medium">乾物質</div>
                    <div className="text-sm font-bold text-blue-900">{record.dry_matter_content}%</div>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl">
                    <div className="text-xs text-emerald-600 font-medium">DM蛋白質</div>
                    <div className="text-sm font-bold text-emerald-900">{record.dm_protein}%</div>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-xl">
                    <div className="text-xs text-amber-600 font-medium">DM脂肪</div>
                    <div className="text-sm font-bold text-amber-900">{record.dm_fat}%</div>
                  </div>
                  <div className="bg-violet-50 p-2 rounded-xl">
                    <div className="text-xs text-violet-600 font-medium">DM纖維</div>
                    <div className="text-sm font-bold text-violet-900">{record.dm_fiber}%</div>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  原始：蛋白質{record.protein_percent}% • 脂肪{record.fat_percent}% • 水分{record.moisture_percent}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}