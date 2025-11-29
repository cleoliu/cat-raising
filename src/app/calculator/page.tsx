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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white border-b border-blue-100 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">營養計算</h1>
                <p className="text-xs text-gray-500">乾物質分析工具</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧮</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
            
        {/* Input Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">輸入營養成分</h2>
            <p className="text-gray-600">填寫貓糧包裝上的營養資訊</p>
          </div>
                <form onSubmit={handleCalculate} className="space-y-6">
                  
                  {/* Cat Selection */}
                  <div className="space-y-2">
                    <Label>選擇貓咪（可選）</Label>
                    <Select value={selectedCatId} onValueChange={handleCatChange}>
                      <SelectTrigger className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                        <SelectValue placeholder="選擇要計算的貓咪" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">不指定貓咪</SelectItem>
                        {cats.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name} ({cat.age}歲, {cat.weight}kg)
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
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 max-h-40 overflow-y-auto">
                        {catHistory[selectedCatId].map((record) => (
                          <div 
                            key={record.id} 
                            className="flex justify-between items-center p-2 bg-white rounded border cursor-pointer hover:bg-blue-50"
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
                            <div className="text-xs text-blue-600">
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
                          className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
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
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold shadow-md"
                    disabled={calculating}
                  >
                    {calculating ? '⏳ 計算中...' : '🧮 開始計算'}
                  </Button>
                </form>
        </div>

        {/* Results */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">計算結果</h2>
            <p className="text-gray-600">乾物質基準營養成分分析</p>
          </div>
                {result ? (
                  <div className="space-y-6">
                    
                    {/* Main Results */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">主要營養分析</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                          <div className="text-xs text-blue-600 font-medium mb-1">乾物質含量</div>
                          <div className="text-xl font-bold text-blue-900">{result.dry_matter_content}%</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200">
                          <div className="text-xs text-emerald-600 font-medium mb-1">DM 蛋白質</div>
                          <div className="text-xl font-bold text-emerald-900">{result.dm_protein}%</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200">
                          <div className="text-xs text-amber-600 font-medium mb-1">DM 脂肪</div>
                          <div className="text-xl font-bold text-amber-900">{result.dm_fat}%</div>
                        </div>
                        <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 rounded-2xl border border-violet-200">
                          <div className="text-xs text-violet-600 font-medium mb-1">DM 纖維</div>
                          <div className="text-xl font-bold text-violet-900">{result.dm_fiber}%</div>
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
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md"
                        disabled={saving}
                      >
                        {saving ? '💾 保存中...' : '💾 保存計算記錄'}
                      </Button>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      🧮
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      準備開始計算
                    </h3>
                    <p className="text-gray-600">
                      填寫左側表單並點擊「開始計算」來查看結果
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