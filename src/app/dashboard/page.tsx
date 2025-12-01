'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import CatAvatar from '@/components/CatAvatar'
import { Trash2, PawPrint, Calculator, Edit2 } from 'lucide-react'
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
  carbohydrate_percent: number | null
  calcium_percent: number | null
  phosphorus_percent: number | null
  sodium_percent: number | null
  target_age: string | null
  food_type: string | null
  dry_matter_content: number
  dm_protein: number
  dm_fat: number
  dm_fiber: number
  dm_ash: number
  calcium_phosphorus_ratio: number | null
  favorited: boolean
  created_at: string
  food_calculation_cats?: {
    cats: {
      id: string
      name: string
      avatar_id?: string
    }
  }[]
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null)
  const [cats, setCats] = useState<Cat[]>([])
  const [selectedCatId, setSelectedCatId] = useState<string>('all')
  const [records, setRecords] = useState<FoodRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRecord, setEditingRecord] = useState<FoodRecord | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [formData, setFormData] = useState({
    brand_name: '',
    product_name: '',
    protein_percent: '',
    fat_percent: '',
    fiber_percent: '',
    ash_percent: '',
    moisture_percent: '',
    carbohydrate_percent: '',
    calcium_percent: '',
    phosphorus_percent: '',
    sodium_percent: '',
    target_age: '',
    food_type: ''
  })
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
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
          food_calculation_cats (
            cats (
              id,
              name,
              avatar_id
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Filter by cat if specified - need to join through the association table
      if (catId && catId !== 'all') {
        const { data: calculationIds, error: filterError } = await supabase
          .from('food_calculation_cats')
          .select('food_calculation_id')
          .eq('cat_id', catId)

        if (filterError) {
          console.error('Error filtering by cat:', filterError)
          return
        }

        const ids = calculationIds.map(item => item.food_calculation_id)
        if (ids.length === 0) {
          setRecords([])
          return
        }

        query = query.in('id', ids)
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

  const handleEditRecord = (record: FoodRecord) => {
    setEditingRecord(record)
    setFormData({
      brand_name: record.brand_name,
      product_name: record.product_name,
      protein_percent: record.protein_percent.toString(),
      fat_percent: record.fat_percent.toString(),
      fiber_percent: record.fiber_percent.toString(),
      ash_percent: record.ash_percent.toString(),
      moisture_percent: record.moisture_percent.toString(),
      carbohydrate_percent: record.carbohydrate_percent?.toString() || '',
      calcium_percent: record.calcium_percent?.toString() || '',
      phosphorus_percent: record.phosphorus_percent?.toString() || '',
      sodium_percent: record.sodium_percent?.toString() || '',
      target_age: record.target_age || '',
      food_type: record.food_type || ''
    })
    // Set currently associated cats
    const currentCatIds = record.food_calculation_cats?.map(assoc => assoc.cats.id) || []
    setSelectedCatIds(currentCatIds)
    setShowEditForm(true)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return

    setSubmitting(true)

    try {
      // 計算乾物質和 DM 值
      const protein = parseFloat(formData.protein_percent)
      const fat = parseFloat(formData.fat_percent)
      const fiber = parseFloat(formData.fiber_percent)
      const ash = parseFloat(formData.ash_percent)
      const moisture = parseFloat(formData.moisture_percent)
      
      const dryMatter = 100 - moisture
      const dmProtein = (protein / dryMatter) * 100
      const dmFat = (fat / dryMatter) * 100
      const dmFiber = (fiber / dryMatter) * 100
      const dmAsh = (ash / dryMatter) * 100

      const updatedData = {
        brand_name: formData.brand_name,
        product_name: formData.product_name,
        protein_percent: protein,
        fat_percent: fat,
        fiber_percent: fiber,
        ash_percent: ash,
        moisture_percent: moisture,
        carbohydrate_percent: formData.carbohydrate_percent ? parseFloat(formData.carbohydrate_percent) : null,
        calcium_percent: formData.calcium_percent ? parseFloat(formData.calcium_percent) : null,
        phosphorus_percent: formData.phosphorus_percent ? parseFloat(formData.phosphorus_percent) : null,
        sodium_percent: formData.sodium_percent ? parseFloat(formData.sodium_percent) : null,
        target_age: formData.target_age || null,
        food_type: formData.food_type || null,
        dry_matter_content: parseFloat(dryMatter.toFixed(1)),
        dm_protein: parseFloat(dmProtein.toFixed(1)),
        dm_fat: parseFloat(dmFat.toFixed(1)),
        dm_fiber: parseFloat(dmFiber.toFixed(1)),
        dm_ash: parseFloat(dmAsh.toFixed(1)),
        calcium_phosphorus_ratio: (formData.calcium_percent && formData.phosphorus_percent && parseFloat(formData.phosphorus_percent) > 0) 
          ? parseFloat((parseFloat(formData.calcium_percent) / parseFloat(formData.phosphorus_percent)).toFixed(2))
          : null
      }

      const { error } = await supabase
        .from('food_calculations')
        .update(updatedData)
        .eq('id', editingRecord.id)

      if (error) {
        console.error('Error updating record:', error)
        alert('更新失敗：' + error.message)
        return
      }

      // Update cat associations
      // First, delete existing associations
      const { error: deleteError } = await supabase
        .from('food_calculation_cats')
        .delete()
        .eq('food_calculation_id', editingRecord.id)

      if (deleteError) {
        console.error('Error deleting old cat associations:', deleteError)
        alert('更新貓咪關聯失敗：' + deleteError.message)
        return
      }

      // Then, create new associations if any cats are selected
      if (selectedCatIds.length > 0) {
        const catAssociations = selectedCatIds.map(catId => ({
          food_calculation_id: editingRecord.id,
          cat_id: catId
        }))

        const { error: insertError } = await supabase
          .from('food_calculation_cats')
          .insert(catAssociations)

        if (insertError) {
          console.error('Error creating new cat associations:', insertError)
          alert('更新貓咪關聯失敗：' + insertError.message)
          return
        }
      }

      // Reload records to get updated associations
      if (user) {
        await loadRecords(user.id, selectedCatId)
      }
      
      setShowEditForm(false)
      setEditingRecord(null)
      setSelectedCatIds([])
      setFormData({
        brand_name: '',
        product_name: '',
        protein_percent: '',
        fat_percent: '',
        fiber_percent: '',
        ash_percent: '',
        moisture_percent: '',
        carbohydrate_percent: '',
        calcium_percent: '',
        phosphorus_percent: '',
        sodium_percent: '',
        target_age: '',
        food_type: ''
      })
    } catch (error: any) {
      console.error('Error updating record:', error)
      alert('更新失敗：' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingRecord(null)
    setShowEditForm(false)
    setSelectedCatIds([])
    setFormData({
      brand_name: '',
      product_name: '',
      protein_percent: '',
      fat_percent: '',
      fiber_percent: '',
      ash_percent: '',
      moisture_percent: '',
      carbohydrate_percent: '',
      calcium_percent: '',
      phosphorus_percent: '',
      sodium_percent: '',
      target_age: '',
      food_type: ''
    })
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
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={handleLogout} className="text-xs px-2 sm:px-3 py-1 glass border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                登出
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Edit Form */}
        {showEditForm && (
          <Card className="mb-6 glass border-primary/20 animate-scale-in overflow-visible relative z-10">
            <CardHeader>
              <CardTitle className="text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                編輯產品記錄
              </CardTitle>
              <CardDescription className="text-muted-foreground">修改產品的營養成分資料</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitEdit} className="space-y-4 overflow-visible">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand_name">品牌名稱 *</Label>
                    <Input
                      id="brand_name"
                      type="text"
                      placeholder="例如：皇家"
                      value={formData.brand_name}
                      onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                      required
                      className="glass border-primary/30 focus:border-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="product_name">產品名稱 *</Label>
                    <Input
                      id="product_name"
                      type="text"
                      placeholder="例如：成貓乾糧"
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      required
                      className="glass border-primary/30 focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">主要營養成分 (%)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="protein_percent">蛋白質 % *</Label>
                      <Input
                        id="protein_percent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="32.0"
                        value={formData.protein_percent}
                        onChange={(e) => setFormData({ ...formData, protein_percent: e.target.value })}
                        required
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fat_percent">脂肪 % *</Label>
                      <Input
                        id="fat_percent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="10.0"
                        value={formData.fat_percent}
                        onChange={(e) => setFormData({ ...formData, fat_percent: e.target.value })}
                        required
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="carbohydrate_percent">碳水</Label>
                      <Input
                        id="carbohydrate_percent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="25.0"
                        value={formData.carbohydrate_percent}
                        onChange={(e) => setFormData({ ...formData, carbohydrate_percent: e.target.value })}
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fiber_percent">纖維 % *</Label>
                      <Input
                        id="fiber_percent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="3.0"
                        value={formData.fiber_percent}
                        onChange={(e) => setFormData({ ...formData, fiber_percent: e.target.value })}
                        required
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ash_percent">灰分 % *</Label>
                      <Input
                        id="ash_percent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="6.0"
                        value={formData.ash_percent}
                        onChange={(e) => setFormData({ ...formData, ash_percent: e.target.value })}
                        required
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="moisture_percent">水分 % *</Label>
                      <Input
                        id="moisture_percent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="10.0"
                        value={formData.moisture_percent}
                        onChange={(e) => setFormData({ ...formData, moisture_percent: e.target.value })}
                        required
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 礦物質成分 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">礦物質成分 (%) - 可選</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calcium_percent">鈣</Label>
                      <Input
                        id="calcium_percent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="1.2"
                        value={formData.calcium_percent}
                        onChange={(e) => setFormData({ ...formData, calcium_percent: e.target.value })}
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phosphorus_percent">磷</Label>
                      <Input
                        id="phosphorus_percent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="1.0"
                        value={formData.phosphorus_percent}
                        onChange={(e) => setFormData({ ...formData, phosphorus_percent: e.target.value })}
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sodium_percent">鈉</Label>
                      <Input
                        id="sodium_percent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0.5"
                        value={formData.sodium_percent}
                        onChange={(e) => setFormData({ ...formData, sodium_percent: e.target.value })}
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 產品資訊 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">產品資訊 - 可選</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target_age">適用年齡</Label>
                      <Select value={formData.target_age || ''} onValueChange={(value) => setFormData({ ...formData, target_age: value || '' })}>
                        <SelectTrigger className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300">
                          <SelectValue placeholder="選擇適用年齡" />
                        </SelectTrigger>
                        <SelectContent className="glass backdrop-blur-lg border-primary/20 z-[9999]">
                          <SelectItem value="幼貓" className="hover:bg-primary/10">幼貓</SelectItem>
                          <SelectItem value="成貓" className="hover:bg-primary/10">成貓</SelectItem>
                          <SelectItem value="老貓" className="hover:bg-primary/10">老貓</SelectItem>
                          <SelectItem value="全年齡" className="hover:bg-primary/10">全年齡</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="food_type">種類</Label>
                      <Select value={formData.food_type || ''} onValueChange={(value) => setFormData({ ...formData, food_type: value || '' })}>
                        <SelectTrigger className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300">
                          <SelectValue placeholder="選擇產品種類" />
                        </SelectTrigger>
                        <SelectContent className="glass backdrop-blur-lg border-primary/20 z-[9999]">
                          <SelectItem value="主食罐" className="hover:bg-primary/10">主食罐</SelectItem>
                          <SelectItem value="餐包" className="hover:bg-primary/10">餐包</SelectItem>
                          <SelectItem value="主食凍乾" className="hover:bg-primary/10">主食凍乾</SelectItem>
                          <SelectItem value="零食凍乾" className="hover:bg-primary/10">零食凍乾</SelectItem>
                          <SelectItem value="生食" className="hover:bg-primary/10">生食</SelectItem>
                          <SelectItem value="乾糧" className="hover:bg-primary/10">乾糧</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 貓咪選擇 */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">關聯貓咪 - 可選</h3>
                  <div className="glass p-4 rounded-xl border border-primary/30 space-y-2 max-h-40 overflow-y-auto">
                    {cats.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">尚未新增貓咪</p>
                    ) : (
                      cats.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 p-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-all duration-200">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                            checked={selectedCatIds.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCatIds(prev => [...prev, cat.id])
                              } else {
                                setSelectedCatIds(prev => prev.filter(id => id !== cat.id))
                              }
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <CatAvatar avatarId={cat.avatar_id} size="sm" />
                            <span className="text-sm font-medium">{cat.name}</span>
                            <span className="text-xs text-muted-foreground">({cat.age}歲, {cat.weight}kg)</span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedCatIds.length > 0 && (
                    <p className="text-sm text-primary">已選擇 {selectedCatIds.length} 隻貓咪</p>
                  )}
                </div>

                </form>
                
                {/* 按鈕區域獨立 */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg relative">
                  <div className="flex flex-col gap-3">
                    <button 
                      type="button"
                      disabled={submitting}
                      className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-4 px-6 rounded-lg text-lg font-medium disabled:opacity-50"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Dashboard submit clicked')
                        if (!submitting) {
                          const form = document.querySelector('form')
                          if (form) {
                            const event = new Event('submit', { bubbles: true, cancelable: true })
                            form.dispatchEvent(event)
                          }
                        }
                      }}
                      onTouchStart={() => console.log('Dashboard submit touch start')}
                      style={{ 
                        minHeight: '50px',
                        zIndex: 10,
                        pointerEvents: 'auto',
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'rgba(59,130,246,0.2)'
                      }}
                    >
                      {submitting ? '更新中...' : '更新記錄'}
                    </button>
                    
                    <button 
                      type="button"
                      className="w-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 py-4 px-6 rounded-lg text-lg font-medium"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Dashboard cancel clicked')
                        handleCancelEdit()
                      }}
                      onTouchStart={() => console.log('Dashboard cancel touch start')}
                      style={{ 
                        minHeight: '50px',
                        zIndex: 10,
                        pointerEvents: 'auto',
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'rgba(156,163,175,0.2)'
                      }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Cat Filter - 移至卡片上方 */}
        <div className="mb-6 animate-slide-up">
          <Select value={selectedCatId} onValueChange={setSelectedCatId}>
            <SelectTrigger className="w-full rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300">
              <SelectValue placeholder="選擇貓咪篩選" />
            </SelectTrigger>
            <SelectContent className="glass backdrop-blur-lg border-primary/20">
              <SelectItem value="all" className="hover:bg-primary/10 flex items-center gap-2">
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
            <p className="text-muted-foreground">
              使用右下角的計算機按鈕開始第一次營養計算
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => (
              <div key={record.id} className="relative">
                <div className="glass border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 animate-slide-up group cursor-pointer rounded-3xl p-4" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="mb-3">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {record.brand_name} - {record.product_name}
                    </h3>
                    
                    {/* 產品資訊標籤 */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {record.target_age && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                          {record.target_age}
                        </span>
                      )}
                      {record.food_type && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                          {record.food_type}
                        </span>
                      )}
                    </div>
                    
                    {/* 貓咪標籤 */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {record.food_calculation_cats && record.food_calculation_cats.length > 0 ? (
                        record.food_calculation_cats.map((association) => (
                          <span key={association.cats.id} className="text-xs bg-gradient-to-r from-primary/20 to-accent/20 text-primary px-2 py-1 rounded-full border border-primary/30 flex items-center gap-1">
                            <CatAvatar avatarId={association.cats.avatar_id} size="sm" />
                            {association.cats.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-300">
                          未指定貓咪
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </div>

                  {/* 浮動按鈕 - 參照管理貓咪頁樣式 */}
                  {!showEditForm && (
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(record.id, record.favorited)
                      }}
                      className="h-8 w-8 p-0 hover:scale-110 transition-transform duration-300 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-full flex items-center justify-center"
                      title="切換收藏"
                    >
                      {record.favorited ? '⭐' : '☆'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditRecord(record)
                      }}
                      className="h-8 w-8 p-0 hover:scale-110 transition-transform duration-300 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full flex items-center justify-center"
                      title="編輯記錄"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteRecord(record.id, `${record.brand_name} - ${record.product_name}`)
                      }}
                      className="h-8 w-8 p-0 hover:scale-110 transition-transform duration-300 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full flex items-center justify-center"
                      title="刪除記錄"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  <div className={`bg-gradient-to-br p-2 rounded-xl border hover:shadow-lg transition-all duration-300 ${
                    record.dm_protein >= 35
                      ? 'from-success/10 to-success/20 border-success/30 hover:shadow-success/20'
                      : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                  }`}>
                    <div className={`text-xs font-medium ${record.dm_protein >= 35 ? 'text-success' : 'text-red-600'}`}>
                      蛋白質乾物比 (≥35%)
                    </div>
                    <div className={`text-sm font-bold ${record.dm_protein >= 35 ? 'text-success' : 'text-red-600'}`}>
                      {record.dm_protein}%
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br p-2 rounded-xl border hover:shadow-lg transition-all duration-300 ${
                    (record.dm_fat >= 30 && record.dm_fat <= 50)
                      ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                      : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                  }`}>
                    <div className={`text-xs font-medium ${(record.dm_fat >= 30 && record.dm_fat <= 50) ? 'text-green-600' : 'text-red-600'}`}>
                      脂肪乾物比 (30-50%)
                    </div>
                    <div className={`text-sm font-bold ${(record.dm_fat >= 30 && record.dm_fat <= 50) ? 'text-green-600' : 'text-red-600'}`}>
                      {record.dm_fat}%
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br p-2 rounded-xl border hover:shadow-lg transition-all duration-300 ${
                    (() => {
                      if (!record.carbohydrate_percent) return 'from-gray-100/60 to-gray-200/60 border-gray-300/30 hover:shadow-gray-200/20'
                      const carbDM = ((record.carbohydrate_percent / record.dry_matter_content) * 100)
                      return carbDM <= 10
                        ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                        : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                    })()
                  }`}>
                    <div className={`text-xs font-medium ${
                      (() => {
                        if (!record.carbohydrate_percent) return 'text-gray-600'
                        const carbDM = ((record.carbohydrate_percent / record.dry_matter_content) * 100)
                        return carbDM <= 10 ? 'text-green-600' : 'text-red-600'
                      })()
                    }`}>
                      碳水乾物比 (≤10%)
                    </div>
                    <div className={`text-sm font-bold ${
                      (() => {
                        if (!record.carbohydrate_percent) return 'text-gray-600'
                        const carbDM = ((record.carbohydrate_percent / record.dry_matter_content) * 100)
                        return carbDM <= 10 ? 'text-green-600' : 'text-red-600'
                      })()
                    }`}>
                      {record.carbohydrate_percent 
                        ? ((record.carbohydrate_percent / record.dry_matter_content) * 100).toFixed(1) + '%'
                        : '未提供'
                      }
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br p-2 rounded-xl border hover:shadow-lg transition-all duration-300 ${
                    (record.dm_fiber >= 2.5 && record.dm_fiber <= 5)
                      ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                      : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                  }`}>
                    <div className={`text-xs font-medium ${(record.dm_fiber >= 2.5 && record.dm_fiber <= 5) ? 'text-green-600' : 'text-red-600'}`}>
                      纖維乾物比 (2.5-5%)
                    </div>
                    <div className={`text-sm font-bold ${(record.dm_fiber >= 2.5 && record.dm_fiber <= 5) ? 'text-green-600' : 'text-red-600'}`}>
                      {record.dm_fiber}%
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br p-2 rounded-xl border hover:shadow-lg transition-all duration-300 ${
                    (() => {
                      if (!record.phosphorus_percent) return 'from-gray-100/60 to-gray-200/60 border-gray-300/30 hover:shadow-gray-200/20'
                      return record.phosphorus_percent <= 1.2
                        ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                        : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                    })()
                  }`}>
                    <div className={`text-xs font-medium ${
                      (() => {
                        if (!record.phosphorus_percent) return 'text-gray-600'
                        return record.phosphorus_percent <= 1.2 ? 'text-green-600' : 'text-red-600'
                      })()
                    }`}>
                      磷含量 (≤1.2%)
                    </div>
                    <div className={`text-sm font-bold ${
                      (() => {
                        if (!record.phosphorus_percent) return 'text-gray-600'
                        return record.phosphorus_percent <= 1.2 ? 'text-green-600' : 'text-red-600'
                      })()
                    }`}>
                      {record.phosphorus_percent ? `${record.phosphorus_percent}%` : '未提供'}
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br p-2 rounded-xl border hover:shadow-lg transition-all duration-300 ${
                    (() => {
                      if (!record.calcium_phosphorus_ratio) return 'from-gray-100/60 to-gray-200/60 border-gray-300/30 hover:shadow-gray-200/20'
                      return (record.calcium_phosphorus_ratio >= 1.1 && record.calcium_phosphorus_ratio <= 1.8)
                        ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                        : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                    })()
                  }`}>
                    <div className={`text-xs font-medium ${
                      (() => {
                        if (!record.calcium_phosphorus_ratio) return 'text-gray-600'
                        return (record.calcium_phosphorus_ratio >= 1.1 && record.calcium_phosphorus_ratio <= 1.8) ? 'text-green-600' : 'text-red-600'
                      })()
                    }`}>
                      鈣磷比 (1.1-1.8)
                    </div>
                    <div className={`text-sm font-bold ${
                      (() => {
                        if (!record.calcium_phosphorus_ratio) return 'text-gray-600'
                        return (record.calcium_phosphorus_ratio >= 1.1 && record.calcium_phosphorus_ratio <= 1.8) ? 'text-green-600' : 'text-red-600'
                      })()
                    }`}>
                      {record.calcium_phosphorus_ratio ? `${record.calcium_phosphorus_ratio.toFixed(2)}:1` : '未提供'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    原始：蛋白質{record.protein_percent}%、脂肪{record.fat_percent}%、纖維{record.fiber_percent}%、灰分{record.ash_percent}%、水分{record.moisture_percent}%
                    {record.carbohydrate_percent && `、碳水${record.carbohydrate_percent}%`}
                  </div>
                  {(record.calcium_percent || record.phosphorus_percent || record.sodium_percent) && (
                    <div>
                      礦物質：
                      {record.calcium_percent && `鈣${record.calcium_percent}%`}
                      {record.calcium_percent && (record.phosphorus_percent || record.sodium_percent) && '、'}
                      {record.phosphorus_percent && `磷${record.phosphorus_percent}%`}
                      {record.phosphorus_percent && record.sodium_percent && '、'}
                      {record.sodium_percent && `鈉${record.sodium_percent}%`}
                    </div>
                  )}
                  {/* 適用年齡和種類已移至上方標籤顯示 */}
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 懸浮計算機按鈕 */}
      <Link href="/calculator">
        <div className="fixed bottom-20 right-4 z-[9999] group">
          <button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-110 animate-pulse-slow flex items-center justify-center group-hover:animate-none">
            <Calculator className="h-6 w-6" />
          </button>
          <div className="absolute bottom-16 right-0 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            營養計算
          </div>
        </div>
      </Link>

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