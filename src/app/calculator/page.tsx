'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { calculateNutrition, validateNutritionInput } from '@/lib/calculations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import CatAvatar from '@/components/CatAvatar'
import type { User } from '@supabase/supabase-js'
import type { Cat, FoodCalculationInput, CalculationResult } from '@/types'

export default function CalculatorPage() {
  const [user, setUser] = useState<User | null>(null)
  const [cats, setCats] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form data
  const [selectedCatId, setSelectedCatId] = useState<string>('none')
  const [formData, setFormData] = useState<FoodCalculationInput>({
    brand_name: '',
    product_name: '',
    food_weight: 0,
    total_calories: undefined,
    calories_per_100g: undefined,
    protein_percent: 0,
    fat_percent: 0,
    fiber_percent: 0,
    ash_percent: 0,
    moisture_percent: 0,
    calcium_percent: undefined,
    phosphorus_percent: undefined,
    sodium_percent: undefined,
  })
  
  // Smart switching state
  interface FoodRecord {
    id: string
    brand_name: string
    product_name: string
    food_weight: number
    total_calories?: number
    calories_per_100g?: number
    protein_percent: number
    fat_percent: number
    fiber_percent: number
    ash_percent: number
    moisture_percent: number
    calcium_percent?: number
    phosphorus_percent?: number
    sodium_percent?: number
    created_at: string
  }
  const [catHistory, setCatHistory] = useState<{ [catId: string]: FoodRecord[] }>({})
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Results
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      await loadCats(user.id)
      setLoading(false)
    }

    getUser()
  }, [router])

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

  const loadCatHistory = async (catId: string) => {
    if (!catId || catHistory[catId]) return

    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from('food_calculations')
        .select('*')
        .eq('cat_id', catId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading cat history:', error)
        return
      }

      setCatHistory(prev => ({
        ...prev,
        [catId]: data || []
      }))
    } catch (error) {
      console.error('Error loading cat history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleCatChange = async (catId: string) => {
    setSelectedCatId(catId)
    
    // Load history for the selected cat (not if "none" is selected)
    if (catId && catId !== 'none') {
      await loadCatHistory(catId)
    }
  }

  const handleInputChange = (field: keyof FoodCalculationInput, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // 清除錯誤和結果當輸入改變時
    setErrors([])
    setResult(null)
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    setCalculating(true)
    setErrors([])

    try {
      // 驗證輸入
      const validationErrors = validateNutritionInput(formData)
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      // 執行計算
      const calculationResult = calculateNutrition(formData)
      setResult(calculationResult)

    } catch (error: any) {
      setErrors(['計算失敗：' + error.message])
    } finally {
      setCalculating(false)
    }
  }

  const handleSave = async () => {
    if (!user || !result) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('food_calculations')
        .insert({
          user_id: user.id,
          cat_id: selectedCatId === 'none' ? null : selectedCatId || null,
          brand_name: formData.brand_name,
          product_name: formData.product_name,
          food_weight: formData.food_weight,
          total_calories: formData.total_calories || null,
          calories_per_100g: formData.calories_per_100g || null,
          protein_percent: formData.protein_percent,
          fat_percent: formData.fat_percent,
          fiber_percent: formData.fiber_percent,
          ash_percent: formData.ash_percent,
          moisture_percent: formData.moisture_percent,
          calcium_percent: formData.calcium_percent || null,
          phosphorus_percent: formData.phosphorus_percent || null,
          sodium_percent: formData.sodium_percent || null,
          dry_matter_content: result.dry_matter_content,
          dm_protein: result.dm_protein,
          dm_fat: result.dm_fat,
          dm_fiber: result.dm_fiber,
          dm_ash: result.dm_ash,
          calorie_density: result.calorie_density || null,
          protein_calorie_ratio: result.protein_calorie_ratio || null,
          fat_calorie_ratio: result.fat_calorie_ratio || null,
          calcium_phosphorus_ratio: result.calcium_phosphorus_ratio || null,
          favorited: false
        })

      if (error) {
        alert('保存失敗：' + error.message)
        return
      }

      alert('計算記錄已保存！')
      
      // 重設表單
      setFormData({
        brand_name: '',
        product_name: '',
        food_weight: 0,
        total_calories: undefined,
        calories_per_100g: undefined,
        protein_percent: 0,
        fat_percent: 0,
        fiber_percent: 0,
        ash_percent: 0,
        moisture_percent: 0,
        calcium_percent: undefined,
        phosphorus_percent: undefined,
        sodium_percent: undefined,
      })
      setResult(null)
      setSelectedCatId('none')

    } catch (error: any) {
      alert('保存失敗：' + error.message)
    } finally {
      setSaving(false)
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 pb-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-grid opacity-10"></div>
      <div className="fixed top-20 left-1/4 h-96 w-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="fixed bottom-20 right-1/4 h-96 w-96 bg-gradient-to-r from-secondary/8 to-primary/8 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      
      {/* Mobile Header */}
      <div className="glass border-b border-primary/20 sticky top-0 z-10 backdrop-blur-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">營養計算</h1>
                <p className="text-xs text-muted-foreground">乾物質分析工具</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center animate-float">
                <span className="text-lg">🧮</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
            
        {/* Input Form */}
        <div className="glass rounded-3xl p-6 border-primary/20 animate-slide-up">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">輸入營養成分</h2>
            <p className="text-muted-foreground">填寫貓糧包裝上的營養資訊</p>
          </div>
                <form onSubmit={handleCalculate} className="space-y-6">
                  
                  {/* Cat Selection */}
                  <div className="space-y-2">
                    <Label>選擇貓咪（可選）</Label>
                    <Select value={selectedCatId} onValueChange={handleCatChange}>
                      <SelectTrigger className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300">
                        <SelectValue placeholder="選擇要計算的貓咪" />
                      </SelectTrigger>
                      <SelectContent className="glass backdrop-blur-lg border-primary/20">
                        <SelectItem value="none" className="hover:bg-primary/10">不指定貓咪</SelectItem>
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
                    {loadingHistory && selectedCatId && selectedCatId !== 'none' && (
                      <p className="text-sm text-blue-600">載入歷史記錄中...</p>
                    )}
                  </div>

                  {/* Historical Records */}
                  {selectedCatId && selectedCatId !== 'none' && catHistory[selectedCatId] && catHistory[selectedCatId].length > 0 && (
                    <div className="space-y-2">
                      <Label>歷史糧食記錄</Label>
                      <div className="glass p-4 rounded-xl space-y-2 max-h-40 overflow-y-auto border border-primary/30">
                        {catHistory[selectedCatId].map((record) => (
                          <div 
                            key={record.id} 
                            className="flex justify-between items-center p-2 glass rounded border border-primary/20 cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
                            onClick={() => {
                              setFormData({
                                brand_name: record.brand_name || '',
                                product_name: record.product_name || '',
                                food_weight: record.food_weight || 0,
                                total_calories: record.total_calories,
                                calories_per_100g: record.calories_per_100g,
                                protein_percent: record.protein_percent || 0,
                                fat_percent: record.fat_percent || 0,
                                fiber_percent: record.fiber_percent || 0,
                                ash_percent: record.ash_percent || 0,
                                moisture_percent: record.moisture_percent || 0,
                                calcium_percent: record.calcium_percent,
                                phosphorus_percent: record.phosphorus_percent,
                                sodium_percent: record.sodium_percent,
                              })
                              setResult(null)
                              setErrors([])
                            }}
                          >
                            <div>
                              <div className="font-medium text-sm">
                                {record.brand_name} - {record.product_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                蛋白質: {record.protein_percent}% • 脂肪: {record.fat_percent}% • 
                                {new Date(record.created_at).toLocaleDateString('zh-TW')}
                              </div>
                            </div>
                            <div className="text-xs text-primary">
                              點擊套用
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        點擊任一記錄即可快速套用到表單中
                      </p>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">基本資訊</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">品牌名稱 *</Label>
                        <Input
                          id="brand"
                          type="text"
                          placeholder="例如：皇家"
                          value={formData.brand_name}
                          onChange={(e) => handleInputChange('brand_name', e.target.value)}
                          required
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product">產品名稱 *</Label>
                        <Input
                          id="product"
                          type="text"
                          placeholder="例如：成貓糧"
                          value={formData.product_name}
                          onChange={(e) => handleInputChange('product_name', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weight and Calories */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">重量與熱量</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">食物重量 (g) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          min="0.1"
                          step="0.1"
                          placeholder="例如：100"
                          value={formData.food_weight || ''}
                          onChange={(e) => handleInputChange('food_weight', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total_calories">整體熱量 (kcal)</Label>
                        <Input
                          id="total_calories"
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="可選"
                          value={formData.total_calories || ''}
                          onChange={(e) => handleInputChange('total_calories', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="calories_per_100g">單位熱量 (kcal/100g)</Label>
                        <Input
                          id="calories_per_100g"
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="可選"
                          value={formData.calories_per_100g || ''}
                          onChange={(e) => handleInputChange('calories_per_100g', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Nutrients */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">主要營養成分 (%)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="protein">蛋白質 *</Label>
                        <Input
                          id="protein"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="例如：32"
                          value={formData.protein_percent || ''}
                          onChange={(e) => handleInputChange('protein_percent', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fat">脂肪 *</Label>
                        <Input
                          id="fat"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="例如：15"
                          value={formData.fat_percent || ''}
                          onChange={(e) => handleInputChange('fat_percent', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fiber">纖維 *</Label>
                        <Input
                          id="fiber"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="例如：3"
                          value={formData.fiber_percent || ''}
                          onChange={(e) => handleInputChange('fiber_percent', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ash">灰分 *</Label>
                        <Input
                          id="ash"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="例如：8"
                          value={formData.ash_percent || ''}
                          onChange={(e) => handleInputChange('ash_percent', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="moisture">水分 *</Label>
                        <Input
                          id="moisture"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="例如：10"
                          value={formData.moisture_percent || ''}
                          onChange={(e) => handleInputChange('moisture_percent', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Minerals */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">礦物質成分 (%) - 可選</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calcium">鈣</Label>
                        <Input
                          id="calcium"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="例如：1.2"
                          value={formData.calcium_percent || ''}
                          onChange={(e) => handleInputChange('calcium_percent', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phosphorus">磷</Label>
                        <Input
                          id="phosphorus"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="例如：1.0"
                          value={formData.phosphorus_percent || ''}
                          onChange={(e) => handleInputChange('phosphorus_percent', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sodium">鈉</Label>
                        <Input
                          id="sodium"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="例如：0.5"
                          value={formData.sodium_percent || ''}
                          onChange={(e) => handleInputChange('sodium_percent', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Errors */}
                  {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <h4 className="text-red-800 font-medium mb-2">請修正以下錯誤：</h4>
                      <ul className="text-red-700 text-sm space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Calculate Button */}
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 animate-glow"
                    disabled={calculating}
                  >
                    {calculating ? '⏳ 計算中...' : '🧮 開始計算'}
                  </Button>
                </form>
        </div>

        {/* Results */}
        <div className="glass rounded-3xl p-6 border-primary/20 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">計算結果</h2>
            <p className="text-muted-foreground">乾物質基準營養成分分析</p>
          </div>
                {result ? (
                  <div className="space-y-6">
                    
                    {/* Main Results */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground animate-slide-up">主要營養分析</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-4 rounded-2xl border border-primary/30 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 animate-scale-in group">
                          <div className="text-xs text-primary font-medium mb-1 group-hover:text-primary transition-colors duration-300">乾物質含量</div>
                          <div className="text-xl font-bold text-primary">{result.dry_matter_content}%</div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-primary/30 to-primary/50 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="bg-gradient-to-br from-success/10 to-success/20 p-4 rounded-2xl border border-success/30 hover:shadow-xl hover:shadow-success/20 transition-all duration-300 hover:scale-105 animate-scale-in group" style={{animationDelay: '0.1s'}}>
                          <div className="text-xs text-success font-medium mb-1 group-hover:text-success transition-colors duration-300">DM 蛋白質</div>
                          <div className="text-xl font-bold text-success">{result.dm_protein}%</div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-success/30 to-success/50 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 p-4 rounded-2xl border border-secondary/30 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 hover:scale-105 animate-scale-in group" style={{animationDelay: '0.2s'}}>
                          <div className="text-xs text-secondary font-medium mb-1 group-hover:text-secondary transition-colors duration-300">DM 脂肪</div>
                          <div className="text-xl font-bold text-secondary">{result.dm_fat}%</div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-secondary/30 to-secondary/50 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-4 rounded-2xl border border-accent/30 hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 hover:scale-105 animate-scale-in group" style={{animationDelay: '0.3s'}}>
                          <div className="text-xs text-accent font-medium mb-1 group-hover:text-accent transition-colors duration-300">DM 纖維</div>
                          <div className="text-xl font-bold text-accent">{result.dm_fiber}%</div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-accent/30 to-accent/50 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Results */}
                    {(result.calorie_density || result.protein_calorie_ratio || result.calcium_phosphorus_ratio) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">進階分析</h3>
                        <div className="space-y-2">
                          {result.calorie_density && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">熱量密度：</span>
                              <span className="font-medium">{result.calorie_density} kcal/100g</span>
                            </div>
                          )}
                          {result.protein_calorie_ratio && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">蛋白質熱量比：</span>
                              <span className="font-medium">{result.protein_calorie_ratio}%</span>
                            </div>
                          )}
                          {result.fat_calorie_ratio && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">脂肪熱量比：</span>
                              <span className="font-medium">{result.fat_calorie_ratio}%</span>
                            </div>
                          )}
                          {result.calcium_phosphorus_ratio && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">鈣磷比：</span>
                              <span className="font-medium">{result.calcium_phosphorus_ratio}:1</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <Button 
                        onClick={handleSave}
                        className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 animate-glow"
                        disabled={saving}
                      >
                        {saving ? '💾 保存中...' : '💾 保存計算記錄'}
                      </Button>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-12 animate-scale-in">
                    <div className="relative mb-8">
                      <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto animate-float border-primary/30">
                        🧮
                      </div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-20 h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl"></div>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      準備開始計算
                    </h3>
                    <p className="text-muted-foreground">
                      填寫表單並點擊「開始計算」來查看結果
                    </p>
                  </div>
                )}
        </div>

      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}