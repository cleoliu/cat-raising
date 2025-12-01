'use client'

import { useEffect, useState, useRef } from 'react'
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
  const savingRef = useRef(false)
  const lastSaveTime = useRef(0)
  const saveInProgressRef = useRef(false) // 額外的全局鎖
  const savePromiseRef = useRef<Promise<void> | null>(null) // 保存 Promise 引用
  
  // Form data - changed to support multiple cats
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([])
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
    carbohydrate_percent: undefined,
    calcium_percent: undefined,
    phosphorus_percent: undefined,
    sodium_percent: undefined,
    target_age: undefined,
    food_type: undefined,
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

  // Handle cat selection (multiple cats)
  const handleCatSelection = (catId: string) => {
    setSelectedCatIds(prev => {
      if (prev.includes(catId)) {
        // Remove cat if already selected
        return prev.filter(id => id !== catId)
      } else {
        // Add cat if not selected
        return [...prev, catId]
      }
    })
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
    if (savePromiseRef.current) {
      console.log('Save already in progress, waiting for existing save...')
      return savePromiseRef.current
    }

    const now = Date.now()

    if (!user || !result || saving || savingRef.current || saveInProgressRef.current || (now - lastSaveTime.current < 5000)) {
      console.log('Duplicate save attempt prevented', {
        user: !!user,
        result: !!result,
        saving,
        savingRefCurrent: savingRef.current,
        saveInProgressRefCurrent: saveInProgressRef.current,
        timeDiff: now - lastSaveTime.current
      })
      return
    }

    // Set locks IMMEDIATELY before creating the promise to prevent race conditions
    setSaving(true)
    savingRef.current = true
    saveInProgressRef.current = true
    lastSaveTime.current = now

    const savePromise = (async () => {
      try {

        console.log('Starting save process', { userId: user.id, timestamp: now })

        const saveId = `${user.id}-${now}-${Math.random().toString(36).substr(2, 9)}`
        console.log('Save ID:', saveId)

        // Create a single food calculation record (not linked to any specific cat initially)
        console.log(`[${saveId}] Creating single food calculation record...`)
        
        const { data: foodCalculation, error: calculationError } = await supabase
          .from('food_calculations')
          .insert({
            user_id: user.id,
            cat_id: null, // Always null now, we use the association table for cat relationships
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
            carbohydrate_percent: formData.carbohydrate_percent || null,
            calcium_percent: formData.calcium_percent || null,
            phosphorus_percent: formData.phosphorus_percent || null,
            sodium_percent: formData.sodium_percent || null,
            target_age: formData.target_age || null,
            food_type: formData.food_type || null,
            dry_matter_content: result.dry_matter_content,
            dm_protein: result.dm_protein,
            dm_fat: result.dm_fat,
            dm_fiber: result.dm_fiber,
            dm_ash: result.dm_ash,
            calorie_density: result.calorie_density || null,
            protein_calorie_ratio: result.protein_calorie_ratio || null,
            fat_calorie_ratio: result.fat_calorie_ratio || null,
            carbohydrate_calorie_ratio: result.carbohydrate_calorie_ratio || null,
            calcium_phosphorus_ratio: result.calcium_phosphorus_ratio || null,
            favorited: false
          })
          .select()
          .single()

        if (calculationError) {
          console.log(`[${saveId}] Food calculation creation failed:`, calculationError)
          alert('保存失敗：' + calculationError.message)
          return
        }

        console.log(`[${saveId}] Food calculation created successfully:`, foodCalculation.id)

        // If cats are selected, create associations in the junction table
        if (selectedCatIds.length > 0) {
          console.log(`[${saveId}] Creating ${selectedCatIds.length} cat associations...`)
          console.log(`[${saveId}] Selected cat IDs:`, selectedCatIds)
          console.log(`[${saveId}] Food calculation ID:`, foodCalculation.id)
          
          // Try to create associations directly - let the error handling determine if table exists
          const associationPromises = selectedCatIds.map(async (catId) => {
            console.log(`[${saveId}] Inserting association: food_calculation_id=${foodCalculation.id}, cat_id=${catId}`)
            console.log(`[${saveId}] Environment check:`, {
              isDev: process.env.NODE_ENV === 'development',
              supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
              hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'
            })
            
            const result = await supabase
              .from('food_calculation_cats')
              .insert({
                food_calculation_id: foodCalculation.id,
                cat_id: catId
              })
            
            if (result.error) {
              console.error(`[${saveId}] Association insert failed for cat ${catId}:`, {
                error: result.error,
                errorCode: result.error.code,
                errorMessage: result.error.message,
                errorDetails: result.error.details,
                errorHint: result.error.hint,
                insertData: { food_calculation_id: foodCalculation.id, cat_id: catId }
              })
            } else {
              console.log(`[${saveId}] Association insert successful for cat ${catId}:`, result.data)
            }
            
            return result
          })

          const associationResults = await Promise.all(associationPromises)
          
          // Check for errors with detailed logging
          const failedAssociations = associationResults.filter(result => result.error)
          if (failedAssociations.length > 0) {
            console.error(`[${saveId}] Some cat associations failed:`, failedAssociations)
            
            // Check if it's a table doesn't exist error
            const tableNotExistErrors = failedAssociations.filter(failed => 
              failed.error?.message?.includes('does not exist') ||
              failed.error?.message?.includes('relation') && failed.error?.message?.includes('food_calculation_cats')
            )
            
            if (tableNotExistErrors.length > 0) {
              console.warn(`[${saveId}] Association table doesn't exist, updating food calculation with first cat`)
              alert('警告：多貓關聯功能需要執行數據庫遷移。目前只保存第一隻選中的貓咪。\n請執行 migration/complete-migration-for-multiple-cats.sql')
              
              // Fallback: update the food calculation with the first selected cat
              const { error: updateError } = await supabase
                .from('food_calculations')
                .update({ cat_id: selectedCatIds[0] })
                .eq('id', foodCalculation.id)
                
              if (updateError) {
                console.error(`[${saveId}] Fallback cat_id update failed:`, updateError)
              } else {
                console.log(`[${saveId}] Fallback: Updated cat_id to ${selectedCatIds[0]}`)
              }
            } else {
              // Other types of errors
              failedAssociations.forEach(failed => {
                console.error(`[${saveId}] Failed association error:`, failed.error)
              })
              alert(`部分貓咪關聯保存失敗：${failedAssociations.length} 個關聯保存失敗。請檢查控制台日誌。`)
            }
          } else {
            console.log(`[${saveId}] All ${selectedCatIds.length} cat associations created successfully`)
          }
        } else {
          console.log(`[${saveId}] No cats selected, skipping association creation`)
        }
        
        console.log(`[${saveId}] Save process completed successfully`)
        alert('計算記錄已保存！')
        
        // 跳轉到產品頁並強制刷新
        router.push('/dashboard?refresh=' + Date.now())
      } catch (error) {
        console.error('Unexpected error during save:', error)
      } finally {
        setSaving(false)
        savingRef.current = false
        saveInProgressRef.current = false
        savePromiseRef.current = null
      }
    })()

    savePromiseRef.current = savePromise
    return savePromise
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
                  
                  {/* Cat Selection - Multiple cats */}
                  <div className="space-y-3">
                    <Label>選擇貓咪（可多選，可選）</Label>
                    <div className="glass p-4 rounded-xl border border-primary/30">
                      {cats.length === 0 ? (
                        <p className="text-muted-foreground text-sm">暫無貓咪資料，請先到貓咪頁面新增</p>
                      ) : (
                        <div className="space-y-3">
                          {cats.map((cat) => (
                            <div key={cat.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
                              <input
                                type="checkbox"
                                id={`cat-${cat.id}`}
                                checked={selectedCatIds.includes(cat.id)}
                                onChange={() => handleCatSelection(cat.id)}
                                className="h-4 w-4 text-primary focus:ring-primary border-primary/30 rounded"
                              />
                              <label htmlFor={`cat-${cat.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
                                <CatAvatar avatarId={cat.avatar_id} size="sm" />
                                <span className="text-sm font-medium">{cat.name} ({cat.age}歲, {cat.weight}kg)</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedCatIds.length > 0 && (
                      <p className="text-sm text-primary">
                        已選擇 {selectedCatIds.length} 隻貓咪: {selectedCatIds.map(id => cats.find(c => c.id === id)?.name).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Removed historical records for simplicity with multiple cat selection */}

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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carbohydrate">碳水</Label>
                        <Input
                          id="carbohydrate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="例如：25"
                          value={formData.carbohydrate_percent || ''}
                          onChange={(e) => handleInputChange('carbohydrate_percent', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
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
                          className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">產品資訊 - 可選</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="target_age">適用年齡</Label>
                        <Select value={formData.target_age || ''} onValueChange={(value) => handleInputChange('target_age', value || undefined)}>
                          <SelectTrigger className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300">
                            <SelectValue placeholder="選擇適用年齡" />
                          </SelectTrigger>
                          <SelectContent className="glass backdrop-blur-lg border-primary/20">
                            <SelectItem value="幼貓" className="hover:bg-primary/10">幼貓</SelectItem>
                            <SelectItem value="成貓" className="hover:bg-primary/10">成貓</SelectItem>
                            <SelectItem value="老貓" className="hover:bg-primary/10">老貓</SelectItem>
                            <SelectItem value="全年齡" className="hover:bg-primary/10">全年齡</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="food_type">種類</Label>
                        <Select value={formData.food_type || ''} onValueChange={(value) => handleInputChange('food_type', value || undefined)}>
                          <SelectTrigger className="rounded-xl glass border-primary/30 focus:border-primary focus:ring-primary hover:bg-primary/5 transition-all duration-300">
                            <SelectValue placeholder="選擇產品種類" />
                          </SelectTrigger>
                          <SelectContent className="glass backdrop-blur-lg border-primary/20">
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
                      <h3 className="text-lg font-semibold text-foreground animate-slide-up">營養成分乾物質分析</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className={`bg-gradient-to-br p-4 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in group relative ${
                          result.dm_protein >= 35 
                            ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                            : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                        }`}>
                          <div className={`text-xs font-medium mb-1 group-hover:opacity-80 transition-colors duration-300 ${
                            result.dm_protein >= 35 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            蛋白質乾物比 (≥35%)
                          </div>
                          <div className={`text-xl font-bold ${result.dm_protein >= 35 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.dm_protein}%
                          </div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"></div>
                        </div>
                        <div className={`bg-gradient-to-br p-4 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in group relative ${
                          (result.dm_fat >= 30 && result.dm_fat <= 50)
                            ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                            : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                        }`} style={{animationDelay: '0.1s'}}>
                          <div className={`text-xs font-medium mb-1 group-hover:opacity-80 transition-colors duration-300 ${
                            (result.dm_fat >= 30 && result.dm_fat <= 50) ? 'text-green-600' : 'text-red-600'
                          }`}>
                            脂肪乾物比 (30-50%)
                          </div>
                          <div className={`text-xl font-bold ${(result.dm_fat >= 30 && result.dm_fat <= 50) ? 'text-green-600' : 'text-red-600'}`}>
                            {result.dm_fat}%
                          </div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"></div>
                        </div>
                        <div className={`bg-gradient-to-br p-4 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in group relative ${
                          (() => {
                            if (!formData.carbohydrate_percent) return 'from-gray-100/60 to-gray-200/60 border-gray-300/30 hover:shadow-gray-200/20'
                            const carbDM = ((formData.carbohydrate_percent / result.dry_matter_content) * 100)
                            return carbDM <= 10
                              ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                              : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                          })()
                        }`} style={{animationDelay: '0.2s'}}>
                          <div className={`text-xs font-medium mb-1 group-hover:opacity-80 transition-colors duration-300 ${
                            (() => {
                              if (!formData.carbohydrate_percent) return 'text-gray-600'
                              const carbDM = ((formData.carbohydrate_percent / result.dry_matter_content) * 100)
                              return carbDM <= 10 ? 'text-green-600' : 'text-red-600'
                            })()
                          }`}>
                            碳水化合物乾物比 (≤10%)
                          </div>
                          <div className={`text-xl font-bold ${
                            (() => {
                              if (!formData.carbohydrate_percent) return 'text-gray-600'
                              const carbDM = ((formData.carbohydrate_percent / result.dry_matter_content) * 100)
                              return carbDM <= 10 ? 'text-green-600' : 'text-red-600'
                            })()
                          }`}>
                            {formData.carbohydrate_percent 
                              ? ((formData.carbohydrate_percent / result.dry_matter_content) * 100).toFixed(1) + '%'
                              : '未提供'
                            }
                          </div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"></div>
                        </div>
                        <div className={`bg-gradient-to-br p-4 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in group relative ${
                          result.dm_fiber <= 2
                            ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                            : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                        }`} style={{animationDelay: '0.3s'}}>
                          <div className={`text-xs font-medium mb-1 group-hover:opacity-80 transition-colors duration-300 ${
                            result.dm_fiber <= 2 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            纖維乾物比 (≤2%)
                          </div>
                          <div className={`text-xl font-bold ${result.dm_fiber <= 2 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.dm_fiber}%
                          </div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"></div>
                        </div>
                        <div className={`bg-gradient-to-br p-4 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in group relative ${
                          (() => {
                            if (!formData.phosphorus_percent) return 'from-gray-100/60 to-gray-200/60 border-gray-300/30 hover:shadow-gray-200/20'
                            // 假設 1% 磷含量約等於 300mg/kcal，所以 <350mg/kcal 約為 <1.2%
                            return formData.phosphorus_percent <= 1.2
                              ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                              : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                          })()
                        }`} style={{animationDelay: '0.4s'}}>
                          <div className={`text-xs font-medium mb-1 group-hover:opacity-80 transition-colors duration-300 ${
                            (() => {
                              if (!formData.phosphorus_percent) return 'text-gray-600'
                              // Convert percentage to mg/kcal estimate (rough conversion: 1% = 300mg/kcal)
                              const phosphorusMg = formData.phosphorus_percent * 300
                              return phosphorusMg < 350 ? 'text-green-600' : 'text-red-600'
                            })()
                          }`}>
                            磷含量 (&lt;350mg/kcal)
                          </div>
                          <div className={`text-xl font-bold ${
                            (() => {
                              if (!formData.phosphorus_percent) return 'text-gray-600'
                              const phosphorusMg = formData.phosphorus_percent * 300
                              return phosphorusMg < 350 ? 'text-green-600' : 'text-red-600'
                            })()
                          }`}>
                            {formData.phosphorus_percent ? `${Math.round(formData.phosphorus_percent * 300)}mg/kcal` : '未提供'}
                          </div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"></div>
                        </div>
                        <div className={`bg-gradient-to-br p-4 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in group relative ${
                          (() => {
                            if (!result.calcium_phosphorus_ratio) return 'from-gray-100/60 to-gray-200/60 border-gray-300/30 hover:shadow-gray-200/20'
                            return (result.calcium_phosphorus_ratio >= 1.1 && result.calcium_phosphorus_ratio <= 1.8)
                              ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                              : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                          })()
                        }`} style={{animationDelay: '0.5s'}}>
                          <div className={`text-xs font-medium mb-1 group-hover:opacity-80 transition-colors duration-300 ${
                            (() => {
                              if (!result.calcium_phosphorus_ratio) return 'text-gray-600'
                              return (result.calcium_phosphorus_ratio >= 1.1 && result.calcium_phosphorus_ratio <= 1.8) ? 'text-green-600' : 'text-red-600'
                            })()
                          }`}>
                            鈣磷比 (1.1-1.8)
                          </div>
                          <div className={`text-xl font-bold ${
                            (() => {
                              if (!result.calcium_phosphorus_ratio) return 'text-gray-600'
                              return (result.calcium_phosphorus_ratio >= 1.1 && result.calcium_phosphorus_ratio <= 1.8) ? 'text-green-600' : 'text-red-600'
                            })()
                          }`}>
                            {result.calcium_phosphorus_ratio ? `${result.calcium_phosphorus_ratio.toFixed(2)}:1` : '未提供'}
                          </div>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"></div>
                        </div>
                      </div>
                    </div>

                    {/* Calorie Ratios - Only show if calorie data is available */}
                    {(result.protein_calorie_ratio || result.fat_calorie_ratio || result.carbohydrate_calorie_ratio) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground animate-slide-up">熱量比分析</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {result.protein_calorie_ratio && (
                            <div className={`bg-gradient-to-br p-4 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in group relative ${
                              result.protein_calorie_ratio >= 45 && result.protein_calorie_ratio <= 60
                                ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                                : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                            }`}>
                              <div className={`text-xs font-medium mb-1 group-hover:opacity-80 transition-colors duration-300 ${
                                result.protein_calorie_ratio >= 45 && result.protein_calorie_ratio <= 60 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                蛋白質熱量比 (45-60%)
                              </div>
                              <div className={`text-xl font-bold ${
                                result.protein_calorie_ratio >= 45 && result.protein_calorie_ratio <= 60 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {result.protein_calorie_ratio}%
                              </div>
                              <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"></div>
                            </div>
                          )}
                          {result.fat_calorie_ratio && (
                            <div className={`bg-gradient-to-br p-4 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in group relative ${
                              result.fat_calorie_ratio >= 30 && result.fat_calorie_ratio <= 50
                                ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                                : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                            }`}>
                              <div className={`text-xs font-medium mb-1 group-hover:opacity-80 transition-colors duration-300 ${
                                result.fat_calorie_ratio >= 30 && result.fat_calorie_ratio <= 50 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                脂肪熱量比 (30-50%)
                              </div>
                              <div className={`text-xl font-bold ${
                                result.fat_calorie_ratio >= 30 && result.fat_calorie_ratio <= 50 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {result.fat_calorie_ratio}%
                              </div>
                              <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"></div>
                            </div>
                          )}
                          {result.carbohydrate_calorie_ratio && (
                            <div className={`bg-gradient-to-br p-4 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in group relative ${
                              result.carbohydrate_calorie_ratio <= 10
                                ? 'from-green-50 to-green-100 border-green-300 hover:shadow-green/20'
                                : 'from-red-50 to-red-100 border-red-300 hover:shadow-red/20'
                            }`}>
                              <div className={`text-xs font-medium mb-1 group-hover:opacity-80 transition-colors duration-300 ${
                                result.carbohydrate_calorie_ratio <= 10 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                碳水熱量比 (≤10%)
                              </div>
                              <div className={`text-xl font-bold ${
                                result.carbohydrate_calorie_ratio <= 10 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {result.carbohydrate_calorie_ratio}%
                              </div>
                              <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}


                    {/* Save Button */}
                    <div className="pt-6 border-t border-gray-200">
                      <button 
                        onClick={handleSave}
                        disabled={saving || savingRef.current || saveInProgressRef.current}
                        className={`
                          w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300
                          ${saving || savingRef.current || saveInProgressRef.current
                            ? 'bg-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-95 shadow-lg hover:shadow-xl'
                          }
                          text-white transform hover:scale-105
                          focus:outline-none focus:ring-4 focus:ring-green-200
                          touch-manipulation
                        `}
                        style={{
                          minHeight: '56px',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        {saving || savingRef.current || saveInProgressRef.current ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            保存中...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            💾 保存計算記錄
                          </span>
                        )}
                      </button>
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