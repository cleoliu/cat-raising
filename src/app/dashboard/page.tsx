'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import CatAvatar from '@/components/CatAvatar'
import { Trash2, PawPrint, Calculator } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Cat {
  id: string
  name: string
  age: number
  weight: number
  avatar_id?: string
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

  const deleteRecord = async (recordId: string, recordName: string) => {
    if (!confirm(`確定要刪除「${recordName}」這筆計算記錄嗎？此操作無法復原。`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('food_calculations')
        .delete()
        .eq('id', recordId)

      if (error) {
        console.error('Error deleting record:', error)
        alert('刪除失敗：' + error.message)
        return
      }

      // Update local state
      setRecords(records.filter(record => record.id !== recordId))
    } catch (error: any) {
      console.error('Error deleting record:', error)
      alert('刪除失敗：' + error.message)
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center relative overflow-hidden">
        <div className="fixed top-20 left-1/4 h-96 w-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="fixed bottom-20 right-1/4 h-96 w-96 bg-gradient-to-r from-secondary/15 to-primary/15 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="text-center glass rounded-3xl p-8 animate-scale-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 animate-glow"></div>
          </div>
          <p className="text-foreground font-medium animate-pulse">載入中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 將會被重導向到登入頁面
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 pb-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-grid opacity-10"></div>
      <div className="fixed top-20 left-1/4 h-96 w-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="fixed bottom-20 right-1/4 h-96 w-96 bg-gradient-to-r from-secondary/8 to-primary/8 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      
      {/* Header */}
      <div className="glass border-b border-primary/20 sticky top-0 z-10 backdrop-blur-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">營養產品</h1>
              <p className="text-sm text-muted-foreground">管理貓咪的營養記錄</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/calculator">
                <Button className="gradient-primary text-white px-4 py-2 rounded-xl text-sm hover:scale-105 transition-all duration-300 animate-glow shadow-lg">
                  <Calculator className="h-4 w-4 mr-2" />
                  營養計算
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="text-xs px-3 py-1 glass border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                登出
              </Button>
            </div>
          </div>

          {/* Cat Filter */}
          <div className="mb-4 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <Select value={selectedCatId} onValueChange={setSelectedCatId}>
              <SelectTrigger className="w-full rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300">
                <SelectValue placeholder="選擇貓咪篩選" />
              </SelectTrigger>
              <SelectContent className="glass backdrop-blur-lg border-primary/20">
                <SelectItem value="all" className="hover:bg-primary/10 flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  所有貓咪
                </SelectItem>
                {cats.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="hover:bg-primary/10">
                    <div className="flex items-center gap-2">
                      <CatAvatar avatarId={cat.avatar_id} size="sm" />
                      {cat.name} ({cat.age}歲, {cat.weight}kg)
                    </div>
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
          <div className="text-center py-12 animate-scale-in">
            <div className="relative mb-8">
              <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto animate-float border-primary/30">
                <span className="text-2xl">📦</span>
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-24 h-24 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              還沒有營養記錄
            </h3>
            <p className="text-muted-foreground mb-6">
              開始第一次營養計算，建立產品記錄
            </p>
            <Link href="/calculator">
              <Button className="gradient-primary text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-300 animate-glow shadow-lg">
                🧮 開始計算
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => (
              <div key={record.id} className="glass rounded-3xl p-4 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] animate-slide-up group" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                      {record.brand_name} - {record.product_name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {record.cats && (
                        <span className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-primary px-2 py-1 rounded-full border border-primary/30 flex items-center gap-1">
                          <CatAvatar avatarId="cat-1" size="sm" />
                          {record.cats.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(record.id, record.favorited)}
                      className="p-2 hover:scale-110 transition-transform duration-300"
                      title="切換收藏"
                    >
                      {record.favorited ? '⭐' : '☆'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRecord(record.id, `${record.brand_name} - ${record.product_name}`)}
                      className="p-2 hover:scale-110 transition-transform duration-300 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      title="刪除記錄"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-2 rounded-xl border border-primary/30 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <div className="text-xs text-primary font-medium">乾物質</div>
                    <div className="text-sm font-bold text-primary">{record.dry_matter_content}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-success/10 to-success/20 p-2 rounded-xl border border-success/30 hover:shadow-lg hover:shadow-success/20 transition-all duration-300">
                    <div className="text-xs text-success font-medium">DM蛋白質</div>
                    <div className="text-sm font-bold text-success">{record.dm_protein}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-2 rounded-xl border border-secondary/30 hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300">
                    <div className="text-xs text-secondary font-medium">DM脂肪</div>
                    <div className="text-sm font-bold text-secondary">{record.dm_fat}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-2 rounded-xl border border-accent/30 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300">
                    <div className="text-xs text-accent font-medium">DM纖維</div>
                    <div className="text-sm font-bold text-accent">{record.dm_fiber}%</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center relative overflow-hidden">
        <div className="fixed top-20 left-1/4 h-96 w-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="fixed bottom-20 right-1/4 h-96 w-96 bg-gradient-to-r from-secondary/15 to-primary/15 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="glass rounded-3xl p-8 animate-scale-in">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">載入中...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}