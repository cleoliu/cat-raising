'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import CatAvatar from '@/components/CatAvatar'
import { getCurrentTaiwanDateTime, utcToTaiwanDateTime } from '@/lib/dateUtils'
import type { User } from '@supabase/supabase-js'

interface Cat {
  id: string
  name: string
  avatar_id?: string
  age: number
  weight: number
}

interface FoodCalculation {
  id: string
  brand_name: string
  product_name: string
}

type RecordType = 'feeding' | 'water' | 'supplement' | 'medication'

function AddRecordContent() {
  const [user, setUser] = useState<User | null>(null)
  const [cats, setCats] = useState<Cat[]>([])
  const [foodCalculations, setFoodCalculations] = useState<FoodCalculation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [recordType, setRecordType] = useState<RecordType>('feeding')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    cat_id: '',
    record_time: getCurrentTaiwanDateTime(), // Taiwan time in YYYY-MM-DDTHH:MM format
    
    // Feeding fields
    food_calculation_id: '',
    custom_food_name: '',
    planned_amount: '',
    actual_amount: '',
    remaining_amount: '',
    amount_unit: 'grams',
    appetite_score: '',
    eating_speed: '',
    post_meal_behavior: '',
    
    // Water fields
    water_amount: '',
    water_type: 'tap_water',
    water_source: '',
    
    // Supplement/Medication fields
    product_name: '',
    product_type: '',
    dosage_amount: '',
    dosage_unit: 'ml',
    frequency: '',
    treatment_duration: '',
    administration_method: 'oral',
    reaction_notes: '',
    side_effects: '',
    effectiveness_rating: '',
    prescribed_by: '',
    prescription_date: '',
    
    // Common fields
    notes: ''
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      await loadCats(user.id)
      // 初始載入時不過濾食品，顯示所有食品
      await loadFoodCalculations(user.id)
      
      // Check for edit parameters
      const editId = searchParams.get('edit')
      const editType = searchParams.get('type') as RecordType
      
      if (editId && editType) {
        setIsEditMode(true)
        setEditingId(editId)
        setRecordType(editType)
        await loadEditRecord(editId, editType)
      }
      
      setLoading(false)
    }

    getUser()
  }, [router])

  // 監聽貓咪選擇變化，重新載入對應的食品計算記錄
  useEffect(() => {
    if (user && formData.cat_id && recordType === 'feeding') {
      loadFoodCalculations(user.id, formData.cat_id)
      // 清除已選擇的食品計算記錄，避免顯示不匹配的選項
      setFormData(prev => ({ ...prev, food_calculation_id: '' }))
    }
  }, [formData.cat_id, user, recordType])

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
      
      // Auto-select first cat if only one exists
      if (data && data.length === 1) {
        setFormData(prev => ({ ...prev, cat_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error loading cats:', error)
    }
  }

  const loadFoodCalculations = async (userId: string, catId?: string) => {
    try {
      if (catId) {
        // 如果有選擇貓咪，查詢兩種食品：
        // 1. 與該貓咪有關聯的食品
        // 2. 沒有任何貓咪關聯的食品（通用食品）
        
        // 查詢與貓咪有關聯的食品
        const { data: associatedFoods, error: associatedError } = await supabase
          .from('food_calculations')
          .select(`
            id, 
            brand_name, 
            product_name,
            food_calculation_cats!inner(cat_id)
          `)
          .eq('user_id', userId)
          .eq('food_calculation_cats.cat_id', catId)
          .order('created_at', { ascending: false })

        if (associatedError) {
          console.error('Error loading associated food calculations:', associatedError)
        }

        // 查詢所有食品計算記錄
        const { data: allFoods, error: allFoodsError } = await supabase
          .from('food_calculations')
          .select('id, brand_name, product_name')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        // 查詢所有有關聯的食品ID
        const { data: allAssociations, error: associationsError } = await supabase
          .from('food_calculation_cats')
          .select('food_calculation_id')

        if (allFoodsError) {
          console.error('Error loading all food calculations:', allFoodsError)
        }

        if (associationsError) {
          console.error('Error loading food associations:', associationsError)
        }

        // 在前端過濾出沒有關聯的食品
        const associatedFoodIds = new Set((allAssociations || []).map(a => a.food_calculation_id))
        const unassociatedFoods = (allFoods || []).filter(food => !associatedFoodIds.has(food.id))

        // 合併兩個結果並去重
        const combinedFoods = [
          ...(associatedFoods || []),
          ...(unassociatedFoods || [])
        ]

        // 根據 id 去重並按創建時間排序
        const uniqueFoods = combinedFoods
          .filter((food, index, self) => 
            index === self.findIndex(f => f.id === food.id)
          )
          .slice(0, 20) // 限制數量

        setFoodCalculations(uniqueFoods)
      } else {
        // 沒有選擇特定貓咪，載入所有食品計算記錄
        const { data, error } = await supabase
          .from('food_calculations')
          .select('id, brand_name, product_name')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Error loading food calculations:', error)
          return
        }

        setFoodCalculations(data || [])
      }
    } catch (error) {
      console.error('Error loading food calculations:', error)
    }
  }

  const loadEditRecord = async (recordId: string, type: RecordType) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No valid session found')
      }

      let endpoint = ''
      switch (type) {
        case 'feeding':
          endpoint = `/api/feeding-records/${recordId}`
          break
        case 'water':
          endpoint = `/api/water-records/${recordId}`
          break
        case 'supplement':
        case 'medication':
          endpoint = `/api/supplement-records/${recordId}`
          break
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load record')
      }

      const record = await response.json()
      
      // Populate form based on record type
      switch (type) {
        case 'feeding':
          setFormData({
            ...formData,
            cat_id: record.cat_id || '',
            record_time: record.feeding_time ? utcToTaiwanDateTime(record.feeding_time) : formData.record_time,
            food_calculation_id: record.food_calculation_id || '',
            custom_food_name: record.custom_food_name || '',
            planned_amount: record.planned_amount?.toString() || '',
            actual_amount: record.actual_amount?.toString() || '',
            remaining_amount: record.remaining_amount?.toString() || '',
            amount_unit: record.amount_unit || 'grams',
            appetite_score: record.appetite_score?.toString() || '',
            eating_speed: record.eating_speed || '',
            post_meal_behavior: record.post_meal_behavior || '',
            notes: record.notes || ''
          })
          break
        case 'water':
          setFormData({
            ...formData,
            cat_id: record.cat_id || '',
            record_time: record.record_time ? utcToTaiwanDateTime(record.record_time) : formData.record_time,
            water_amount: record.water_amount?.toString() || '',
            water_type: record.water_type || 'tap_water',
            water_source: record.water_source || '',
            notes: record.notes || ''
          })
          break
        case 'supplement':
        case 'medication':
          setFormData({
            ...formData,
            cat_id: record.cat_id || '',
            record_time: record.record_time ? utcToTaiwanDateTime(record.record_time) : formData.record_time,
            product_name: record.product_name || '',
            product_type: record.product_type || '',
            dosage_amount: record.dosage_amount?.toString() || '',
            dosage_unit: record.dosage_unit || 'ml',
            frequency: record.frequency || '',
            treatment_duration: record.treatment_duration?.toString() || '',
            administration_method: record.administration_method || 'oral',
            reaction_notes: record.reaction_notes || '',
            side_effects: record.side_effects || '',
            effectiveness_rating: record.effectiveness_rating?.toString() || '',
            prescribed_by: record.prescribed_by || '',
            prescription_date: record.prescription_date || '',
            notes: record.notes || ''
          })
          break
      }
    } catch (error: any) {
      console.error('Error loading edit record:', error)
      alert('載入記錄失敗：' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || submitting) return

    setSubmitting(true)
    
    try {
      let endpoint = ''
      let requestBody: any = {
        cat_id: formData.cat_id,
        notes: formData.notes || null
      }

      switch (recordType) {
        case 'feeding':
          endpoint = '/api/feeding-records'
          requestBody = {
            ...requestBody,
            feeding_time: formData.record_time + ':00+08:00', // Store as Taiwan time with timezone
            food_calculation_id: formData.food_calculation_id || null,
            custom_food_name: formData.custom_food_name || null,
            planned_amount: formData.planned_amount ? parseFloat(formData.planned_amount) : null,
            actual_amount: formData.actual_amount ? parseFloat(formData.actual_amount) : null,
            remaining_amount: formData.remaining_amount ? parseFloat(formData.remaining_amount) : null,
            amount_unit: formData.amount_unit,
            appetite_score: formData.appetite_score ? parseInt(formData.appetite_score) : null,
            eating_speed: formData.eating_speed || null,
            post_meal_behavior: formData.post_meal_behavior || null
          }
          break
          
        case 'water':
          endpoint = '/api/water-records'
          requestBody = {
            ...requestBody,
            record_date: formData.record_time.split('T')[0], // Extract date part (still in Taiwan timezone for date)
            record_time: formData.record_time + ':00+08:00', // Store as Taiwan time with timezone
            water_amount: formData.water_amount ? parseFloat(formData.water_amount) : null,
            water_type: formData.water_type,
            water_source: formData.water_source || null
          }
          break
          
        case 'supplement':
        case 'medication':
          endpoint = '/api/supplement-records'
          requestBody = {
            ...requestBody,
            record_time: formData.record_time + ':00+08:00', // Store as Taiwan time with timezone
            record_type: recordType,
            product_name: formData.product_name,
            product_type: formData.product_type || null,
            dosage_amount: formData.dosage_amount ? parseFloat(formData.dosage_amount) : null,
            dosage_unit: formData.dosage_unit,
            frequency: formData.frequency || null,
            treatment_duration: formData.treatment_duration ? parseInt(formData.treatment_duration) : null,
            administration_method: formData.administration_method,
            reaction_notes: formData.reaction_notes || null,
            side_effects: formData.side_effects || null,
            effectiveness_rating: formData.effectiveness_rating ? parseInt(formData.effectiveness_rating) : null,
            prescribed_by: formData.prescribed_by || null,
            prescription_date: formData.prescription_date || null
          }
          break
      }

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No valid session found')
      }

      const method = isEditMode ? 'PUT' : 'POST'
      const url = isEditMode ? `${endpoint}/${editingId}` : endpoint
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} record`)
      }

      // Success - redirect back to diet diary
      router.push('/diet-diary')
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} record:`, error)
      alert(`${isEditMode ? '更新' : '新增'}記錄失敗：` + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderRecordTypeFields = () => {
    switch (recordType) {
      case 'feeding':
        return (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">餵食資訊</h3>
              
              {/* Food Selection */}
              <div className="space-y-2">
                <Label>食物來源</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="food_calculation">從營養計算記錄選擇</Label>
                    <Select 
                      value={formData.food_calculation_id} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        food_calculation_id: value,
                        custom_food_name: value ? '' : prev.custom_food_name 
                      }))}
                    >
                      <SelectTrigger className="glass border-primary/30">
                        <SelectValue placeholder="選擇已計算的食品" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {foodCalculations.map((calc) => (
                          <SelectItem key={calc.id} value={calc.id} className="hover:bg-gray-50">
                            {calc.brand_name} - {calc.product_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-center text-muted-foreground">或</div>
                  
                  <div>
                    <Label htmlFor="custom_food_name">自訂食物名稱</Label>
                    <Input
                      id="custom_food_name"
                      value={formData.custom_food_name}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        custom_food_name: e.target.value,
                        food_calculation_id: e.target.value ? '' : prev.food_calculation_id
                      }))}
                      placeholder="例如：雞胸肉"
                      className="glass border-primary/30"
                      disabled={!!formData.food_calculation_id}
                    />
                  </div>
                </div>
              </div>

              {/* Amount Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planned_amount">計劃份量</Label>
                  <Input
                    id="planned_amount"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.planned_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, planned_amount: e.target.value }))}
                    className="glass border-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount_unit">單位</Label>
                  <Select 
                    value={formData.amount_unit} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, amount_unit: value }))}
                  >
                    <SelectTrigger className="glass border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="grams" className="hover:bg-gray-50">公克</SelectItem>
                      <SelectItem value="pieces" className="hover:bg-gray-50">片/塊</SelectItem>
                      <SelectItem value="portion" className="hover:bg-gray-50">份</SelectItem>
                      <SelectItem value="ml" className="hover:bg-gray-50">毫升</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actual_amount">實際攝取</Label>
                  <Input
                    id="actual_amount"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.actual_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, actual_amount: e.target.value }))}
                    className="glass border-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remaining_amount">剩餘份量</Label>
                  <Input
                    id="remaining_amount"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.remaining_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, remaining_amount: e.target.value }))}
                    className="glass border-primary/30"
                  />
                </div>
              </div>

              {/* Cat Reaction */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appetite_score">食慾評分 (1-5)</Label>
                  <Select 
                    value={formData.appetite_score} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, appetite_score: value }))}
                  >
                    <SelectTrigger className="glass border-primary/30">
                      <SelectValue placeholder="選擇評分" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="1" className="hover:bg-gray-50">1 - 完全拒食</SelectItem>
                      <SelectItem value="2" className="hover:bg-gray-50">2 - 勉強進食</SelectItem>
                      <SelectItem value="3" className="hover:bg-gray-50">3 - 正常進食</SelectItem>
                      <SelectItem value="4" className="hover:bg-gray-50">4 - 積極進食</SelectItem>
                      <SelectItem value="5" className="hover:bg-gray-50">5 - 非常渴望</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eating_speed">進食速度</Label>
                  <Select 
                    value={formData.eating_speed} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, eating_speed: value }))}
                  >
                    <SelectTrigger className="glass border-primary/30">
                      <SelectValue placeholder="選擇速度" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="slow" className="hover:bg-gray-50">緩慢</SelectItem>
                      <SelectItem value="normal" className="hover:bg-gray-50">正常</SelectItem>
                      <SelectItem value="fast" className="hover:bg-gray-50">快速</SelectItem>
                      <SelectItem value="gulping" className="hover:bg-gray-50">狼吞虎嚥</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post_meal_behavior">餐後行為</Label>
                <Input
                  id="post_meal_behavior"
                  value={formData.post_meal_behavior}
                  onChange={(e) => setFormData(prev => ({ ...prev, post_meal_behavior: e.target.value }))}
                  placeholder="例如：滿足、尋找更多、嘔吐"
                  className="glass border-primary/30"
                />
              </div>
            </div>
          </>
        )
        
      case 'water':
        return (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">飲水資訊</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="water_amount">飲水量 (ml)</Label>
                  <Input
                    id="water_amount"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.water_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, water_amount: e.target.value }))}
                    className="glass border-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water_type">水質類型</Label>
                  <Select 
                    value={formData.water_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, water_type: value }))}
                  >
                    <SelectTrigger className="glass border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="tap_water" className="hover:bg-gray-50">自來水</SelectItem>
                      <SelectItem value="boiled_water" className="hover:bg-gray-50">煮沸水</SelectItem>
                      <SelectItem value="filtered_water" className="hover:bg-gray-50">過濾水</SelectItem>
                      <SelectItem value="mineral_water" className="hover:bg-gray-50">礦泉水</SelectItem>
                      <SelectItem value="distilled_water" className="hover:bg-gray-50">蒸餾水</SelectItem>
                      <SelectItem value="other" className="hover:bg-gray-50">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="water_source">飲水地點/來源</Label>
                <Input
                  id="water_source"
                  value={formData.water_source}
                  onChange={(e) => setFormData(prev => ({ ...prev, water_source: e.target.value }))}
                  placeholder="例如：客廳水碗、廚房水龍頭"
                  className="glass border-primary/30"
                />
              </div>
            </div>
          </>
        )
        
      case 'supplement':
      case 'medication':
        return (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {recordType === 'supplement' ? '保健品資訊' : '藥物資訊'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name">產品名稱 *</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    required
                    className="glass border-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_type">類型</Label>
                  <Input
                    id="product_type"
                    value={formData.product_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value }))}
                    placeholder={recordType === 'supplement' ? '例如：魚油、益生菌' : '例如：抗生素、止痛藥'}
                    className="glass border-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage_amount">劑量</Label>
                  <Input
                    id="dosage_amount"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.dosage_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, dosage_amount: e.target.value }))}
                    className="glass border-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage_unit">單位</Label>
                  <Select 
                    value={formData.dosage_unit} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dosage_unit: value }))}
                  >
                    <SelectTrigger className="glass border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="ml" className="hover:bg-gray-50">毫升</SelectItem>
                      <SelectItem value="mg" className="hover:bg-gray-50">毫克</SelectItem>
                      <SelectItem value="g" className="hover:bg-gray-50">公克</SelectItem>
                      <SelectItem value="capsule" className="hover:bg-gray-50">膠囊</SelectItem>
                      <SelectItem value="tablet" className="hover:bg-gray-50">錠劑</SelectItem>
                      <SelectItem value="drops" className="hover:bg-gray-50">滴</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">給藥頻率</Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger className="glass border-primary/30">
                      <SelectValue placeholder="選擇頻率" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="once_daily" className="hover:bg-gray-50">每日一次</SelectItem>
                      <SelectItem value="twice_daily" className="hover:bg-gray-50">每日兩次</SelectItem>
                      <SelectItem value="three_times_daily" className="hover:bg-gray-50">每日三次</SelectItem>
                      <SelectItem value="as_needed" className="hover:bg-gray-50">需要時服用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="administration_method">給藥方式</Label>
                  <Select 
                    value={formData.administration_method} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, administration_method: value }))}
                  >
                    <SelectTrigger className="glass border-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="oral" className="hover:bg-gray-50">口服</SelectItem>
                      <SelectItem value="topical" className="hover:bg-gray-50">外用</SelectItem>
                      <SelectItem value="injection" className="hover:bg-gray-50">注射</SelectItem>
                      <SelectItem value="eye_drops" className="hover:bg-gray-50">點眼</SelectItem>
                      <SelectItem value="ear_drops" className="hover:bg-gray-50">點耳</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {recordType === 'medication' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prescribed_by">開立醫師</Label>
                    <Input
                      id="prescribed_by"
                      value={formData.prescribed_by}
                      onChange={(e) => setFormData(prev => ({ ...prev, prescribed_by: e.target.value }))}
                      className="glass border-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prescription_date">開立日期</Label>
                    <Input
                      id="prescription_date"
                      type="date"
                      value={formData.prescription_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, prescription_date: e.target.value }))}
                      className="glass border-primary/30"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )
        
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-primary/10 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEditMode ? '編輯飲食記錄' : '新增飲食記錄'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? '修改貓咪的飲食記錄' : '記錄貓咪的飲食情況'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="glass border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
              <CardDescription>選擇記錄類型和相關貓咪</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Record Type Selection */}
              <div className="space-y-2">
                <Label>記錄類型</Label>
                <Select 
                  value={recordType} 
                  onValueChange={(value) => setRecordType(value as RecordType)}
                >
                  <SelectTrigger className="glass border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="feeding" className="hover:bg-gray-50">餵食記錄</SelectItem>
                    <SelectItem value="water" className="hover:bg-gray-50">飲水記錄</SelectItem>
                    <SelectItem value="supplement" className="hover:bg-gray-50">保健品記錄</SelectItem>
                    <SelectItem value="medication" className="hover:bg-gray-50">藥物記錄</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cat Selection */}
              <div className="space-y-2">
                <Label htmlFor="cat_id">選擇貓咪 *</Label>
                <Select 
                  value={formData.cat_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cat_id: value }))}
                >
                  <SelectTrigger className="glass border-primary/30">
                    <SelectValue placeholder="選擇貓咪" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {cats.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <CatAvatar avatarId={cat.avatar_id} size="sm" />
                          {cat.name} ({cat.age}歲, {cat.weight}kg)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="record_time">記錄時間 *</Label>
                <Input
                  id="record_time"
                  type="datetime-local"
                  value={formData.record_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, record_time: e.target.value }))}
                  required
                  className="glass border-primary/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Record Type Specific Fields */}
          <Card className="glass border-primary/20 mb-6">
            <CardContent className="pt-6">
              {renderRecordTypeFields()}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="glass border-primary/20 mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="notes">備註</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="其他需要記錄的資訊..."
                  className="glass border-primary/30"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 glass border-primary/30"
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              disabled={submitting || !formData.cat_id}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {isEditMode ? '更新中...' : '儲存中...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isEditMode ? '更新記錄' : '儲存記錄'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AddRecordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
          <p className="text-foreground font-medium">載入中...</p>
        </div>
      </div>
    }>
      <AddRecordContent />
    </Suspense>
  )
}