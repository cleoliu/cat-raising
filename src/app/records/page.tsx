'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CatAvatar from '@/components/CatAvatar'
import Image from 'next/image'
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
  cat_id?: string | null
  cats?: {
    id: string
    name: string
    avatar_id?: string
  }
  food_calculation_cats?: Array<{
    cat_id: string
    cats: {
      id: string
      name: string
      avatar_id?: string
    }
  }>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-grid opacity-10"></div>
      <div className="fixed top-20 left-1/4 h-96 w-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="fixed bottom-20 right-1/4 h-96 w-96 bg-gradient-to-r from-secondary/8 to-primary/8 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      
      {/* Navigation */}
      <nav className="glass border-b border-primary/20 sticky top-0 z-10 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 animate-slide-up">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                貓咪乾物質計算器
              </Link>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">計算記錄</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/calculator">
                <Button variant="outline" className="glass border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-105">新增計算</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="glass border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-105">返回首頁</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">計算記錄</h1>
            <p className="text-muted-foreground mt-1">查看您的所有營養計算記錄</p>
          </div>

          {/* Records List */}
          {records.length === 0 ? (
            <Card className="glass border-primary/20 animate-scale-in">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto animate-float border-primary/30 p-4">
                      <Image
                        src="/cat-food-icon.png"
                        alt="貓糧圖標"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                        unoptimized={true}
                      />
                    </div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-24 h-24 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl"></div>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    還沒有計算記錄
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    開始您的第一次營養計算
                  </p>
                  <Link href="/calculator">
                    <Button className="gradient-primary text-white hover:scale-105 transition-all duration-300 animate-glow shadow-lg">開始計算</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record, index) => (
                <Card key={record.id} className="glass border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] animate-slide-up group" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors duration-300">
                          {record.brand_name} - {record.product_name}
                        </CardTitle>
                        
                        {/* Show cats - priority: association table first, then fallback to legacy cat_id */}
                        {record.food_calculation_cats && record.food_calculation_cats.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {record.food_calculation_cats.map((association) => (
                              <span key={association.cat_id} className="text-xs text-primary bg-gradient-to-r from-primary/20 to-accent/20 px-2 py-1 rounded border border-primary/30 flex items-center gap-1">
                                <CatAvatar avatarId={association.cats.avatar_id || "cat-1"} size="sm" />
                                {association.cats.name}
                              </span>
                            ))}
                          </div>
                        ) : record.cats ? (
                          // Fallback to legacy single cat relationship
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs text-primary bg-gradient-to-r from-primary/20 to-accent/20 px-2 py-1 rounded border border-primary/30 flex items-center gap-1">
                              <CatAvatar avatarId={record.cats.avatar_id || "cat-1"} size="sm" />
                              {record.cats.name}
                            </span>
                          </div>
                        ) : null}
                        <CardDescription className="text-muted-foreground">
                          {new Date(record.created_at).toLocaleString('zh-TW')}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:scale-110 transition-transform duration-300 h-12 w-12 touch-manipulation"
                        style={{
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                        onClick={() => toggleFavorite(record.id, record.favorited)}
                      >
                        {record.favorited ? '⭐' : '☆'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-3 rounded-xl border border-primary/30 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                        <div className="text-xs text-primary font-medium">乾物質含量</div>
                        <div className="text-lg font-bold text-primary">{record.dry_matter_content}%</div>
                      </div>
                      <div className="bg-gradient-to-br from-success/10 to-success/20 p-3 rounded-xl border border-success/30 hover:shadow-lg hover:shadow-success/20 transition-all duration-300">
                        <div className="text-xs text-success font-medium">DM 蛋白質</div>
                        <div className="text-lg font-bold text-success">{record.dm_protein}%</div>
                      </div>
                      <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-3 rounded-xl border border-secondary/30 hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300">
                        <div className="text-xs text-secondary font-medium">DM 脂肪</div>
                        <div className="text-lg font-bold text-secondary">{record.dm_fat}%</div>
                      </div>
                      <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-3 rounded-xl border border-accent/30 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300">
                        <div className="text-xs text-accent font-medium">DM 纖維</div>
                        <div className="text-lg font-bold text-accent">{record.dm_fiber}%</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-primary/20 text-sm text-muted-foreground">
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