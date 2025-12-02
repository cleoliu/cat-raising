'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import CatAvatar from '@/components/CatAvatar'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Cat {
  id: string
  name: string
  avatar_id?: string
}

interface DietRecord {
  id: string
  record_time: string
  record_type: 'feeding' | 'water' | 'supplement' | 'medication'
  food_name?: string
  amount?: number
  amount_unit?: string
  notes?: string
  cat: Cat
  // Feeding specific fields
  appetite_score?: number
  eating_speed?: string
  post_meal_behavior?: string
  // Water specific fields  
  water_type?: string
  water_source?: string
  // Supplement/medication specific fields
  product_type?: string
  dosage_amount?: number
  frequency?: string
  effectiveness_rating?: number
}

export default function DietDiaryPage() {
  const [records, setRecords] = useState<DietRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [dailySummary, setDailySummary] = useState({
    feeding_count: 0,
    water_intake: 0,
    supplement_count: 0,
    medication_count: 0
  })
  const router = useRouter()

  const loadRecords = async (userId: string, date: string) => {
    try {
      // Load all diet records for the selected date
      const startOfDay = `${date}T00:00:00.000Z`
      const endOfDay = `${date}T23:59:59.999Z`
      
      // Get auth token for API requests
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No valid session for API requests')
        return
      }

      const authHeaders = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }

      const [feedingResponse, waterResponse, supplementResponse] = await Promise.all([
        fetch(`/api/feeding-records?date_from=${startOfDay}&date_to=${endOfDay}`, { headers: authHeaders }),
        fetch(`/api/water-records?date_from=${date}&date_to=${date}`, { headers: authHeaders }),
        fetch(`/api/supplement-records?date_from=${startOfDay}&date_to=${endOfDay}`, { headers: authHeaders })
      ])

      const [feedingRecords, waterRecords, supplementRecords] = await Promise.all([
        feedingResponse.ok ? feedingResponse.json() : [],
        waterResponse.ok ? waterResponse.json() : [],
        supplementResponse.ok ? supplementResponse.json() : []
      ])

      // Combine all records and format them for display
      const allRecords: DietRecord[] = []

      // Add feeding records
      feedingRecords.forEach((record: {
        id: string;
        feeding_time: string;
        custom_food_name?: string;
        food_calculations?: { brand_name: string; product_name: string };
        actual_amount?: number;
        planned_amount?: number;
        amount_unit?: string;
        notes?: string;
        cats: Cat;
        appetite_score?: number;
        eating_speed?: string;
        post_meal_behavior?: string;
      }) => {
        let foodName = record.custom_food_name
        if (!foodName && record.food_calculations) {
          foodName = `${record.food_calculations.brand_name} - ${record.food_calculations.product_name}`
        }
        if (!foodName) {
          foodName = '未指定食品'
        }

        allRecords.push({
          id: record.id,
          record_time: record.feeding_time,
          record_type: 'feeding',
          food_name: foodName,
          amount: record.actual_amount || record.planned_amount,
          amount_unit: record.amount_unit,
          notes: record.notes,
          cat: record.cats,
          appetite_score: record.appetite_score,
          eating_speed: record.eating_speed,
          post_meal_behavior: record.post_meal_behavior
        })
      })

      // Add water records
      waterRecords.forEach((record: {
        id: string;
        record_time: string;
        water_type: string;
        water_amount: number;
        notes?: string;
        cats: Cat;
        water_source?: string;
      }) => {
        const waterTypeName = {
          'tap_water': '自來水',
          'boiled_water': '煮沸水', 
          'filtered_water': '過濾水',
          'mineral_water': '礦泉水',
          'distilled_water': '蒸餾水',
          'other': '其他'
        }[record.water_type] || record.water_type

        allRecords.push({
          id: record.id,
          record_time: record.record_time,
          record_type: 'water',
          food_name: waterTypeName,
          amount: record.water_amount,
          amount_unit: 'ml',
          notes: record.notes,
          cat: record.cats,
          water_type: record.water_type,
          water_source: record.water_source
        })
      })

      // Add supplement records
      supplementRecords.forEach((record: {
        id: string;
        record_time: string;
        record_type: 'supplement' | 'medication';
        product_name: string;
        dosage_amount: number;
        dosage_unit: string;
        notes?: string;
        cats: Cat;
        product_type?: string;
        frequency?: string;
        effectiveness_rating?: number;
      }) => {
        allRecords.push({
          id: record.id,
          record_time: record.record_time,
          record_type: record.record_type as 'supplement' | 'medication',
          food_name: record.product_name,
          amount: record.dosage_amount,
          amount_unit: record.dosage_unit,
          notes: record.notes,
          cat: record.cats,
          product_type: record.product_type,
          dosage_amount: record.dosage_amount,
          frequency: record.frequency,
          effectiveness_rating: record.effectiveness_rating
        })
      })

      // Sort by time (most recent first)
      allRecords.sort((a, b) => new Date(b.record_time).getTime() - new Date(a.record_time).getTime())
      
      setRecords(allRecords)
      
      // Calculate summary immediately with the new records
      const feedingCount = allRecords.filter(r => r.record_type === 'feeding').length
      const waterIntake = allRecords
        .filter(r => r.record_type === 'water')
        .reduce((sum, r) => sum + (r.amount || 0), 0)
      const supplementCount = allRecords.filter(r => r.record_type === 'supplement').length
      const medicationCount = allRecords.filter(r => r.record_type === 'medication').length

      setDailySummary({
        feeding_count: feedingCount,
        water_intake: Math.round(waterIntake),
        supplement_count: supplementCount,
        medication_count: medicationCount
      })
    } catch (error) {
      console.error('Error loading diet records:', error)
      setRecords([])
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }

      await loadRecords(user.id, selectedDate)
      setLoading(false)
    }

    getUser()
  }, [router, selectedDate])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
  }

  const changeDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate)
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      currentDate.setDate(currentDate.getDate() + 1)
    }
    setSelectedDate(currentDate.toISOString().split('T')[0])
  }

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center relative overflow-hidden pb-20">
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
      
      {/* Header */}
      <div className="glass border-b border-primary/20 sticky top-0 z-10 backdrop-blur-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">飲食日記</h1>
              <p className="text-sm text-muted-foreground">記錄貓咪的每日飲食</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center animate-float">
                <span className="text-lg">📝</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="px-4 py-4">
        <div className="glass rounded-3xl p-4 border-primary/20 animate-slide-up">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeDate('prev')}
              className="hover:bg-primary/10 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="text-center flex-1">
              <div className="text-lg font-semibold text-foreground">
                {formatDate(selectedDate)}
              </div>
              {!isToday && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="mt-2 text-xs glass border-primary/30"
                >
                  回到今天
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeDate('next')}
              className="hover:bg-primary/10 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-4 border border-yellow-200 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <h3 className="text-lg font-semibold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            每日摘要
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-2 rounded-lg border border-pink-200">
              <div className="text-xs text-pink-600 font-medium">餵食次數</div>
              <div className="text-sm font-bold text-pink-600">{dailySummary.feeding_count} 次</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-600 font-medium">飲水量</div>
              <div className="text-sm font-bold text-blue-600">{dailySummary.water_intake} ml</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-lg border border-green-200">
              <div className="text-xs text-green-600 font-medium">保健品</div>
              <div className="text-sm font-bold text-green-600">{dailySummary.supplement_count} 次</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-lg border border-orange-200">
              <div className="text-xs text-orange-600 font-medium">藥物</div>
              <div className="text-sm font-bold text-orange-600">{dailySummary.medication_count} 次</div>
            </div>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="px-4">
        {records.length === 0 ? (
          <Card className="glass border-primary/20 animate-scale-in">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto animate-float border-primary/30 p-4">
                    <span className="text-3xl">📝</span>
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-24 h-24 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl"></div>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {isToday ? '今日還沒有記錄' : '當日沒有記錄'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  使用右下角的按鈕開始記錄飲食
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <Card key={record.id} className="glass border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <CatAvatar avatarId={record.cat.avatar_id} size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Header with time and type */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {new Date(record.record_time).toLocaleTimeString('zh-TW', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            record.record_type === 'feeding' ? 'bg-pink-100 text-pink-700' :
                            record.record_type === 'water' ? 'bg-blue-100 text-blue-700' :
                            record.record_type === 'supplement' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {record.record_type === 'feeding' && '🍽️ 餵食'}
                            {record.record_type === 'water' && '💧 飲水'}
                            {record.record_type === 'supplement' && '💊 保健品'}
                            {record.record_type === 'medication' && '💉 藥物'}
                          </span>
                          {record.food_name && (
                            <span className="text-sm font-medium text-foreground">
                              {record.food_name}
                            </span>
                          )}
                        </div>
                      </div>


                      {/* Content details based on record type */}
                      <div className="space-y-1">
                        {record.record_type === 'feeding' && (
                          <>
                            {record.amount && (
                              <div className="text-sm text-muted-foreground">
                                份量: {record.amount} {record.amount_unit || 'grams'}
                              </div>
                            )}
                            {record.appetite_score && (
                              <div className="text-sm text-muted-foreground">
                                食慾: {record.appetite_score}/5 分
                              </div>
                            )}
                            {record.eating_speed && (
                              <div className="text-sm text-muted-foreground">
                                速度: {
                                  record.eating_speed === 'slow' ? '緩慢' :
                                  record.eating_speed === 'normal' ? '正常' :
                                  record.eating_speed === 'fast' ? '快速' :
                                  record.eating_speed === 'gulping' ? '狼吞虎嚥' :
                                  record.eating_speed
                                }
                              </div>
                            )}
                          </>
                        )}
                        
                        {record.record_type === 'water' && (
                          <>
                            {record.amount && (
                              <div className="text-sm text-muted-foreground">
                                飲水量: {record.amount} ml
                              </div>
                            )}
                            {record.water_source && (
                              <div className="text-sm text-muted-foreground">
                                地點: {record.water_source}
                              </div>
                            )}
                          </>
                        )}

                        {(record.record_type === 'supplement' || record.record_type === 'medication') && (
                          <>
                            {record.product_type && (
                              <div className="text-sm text-muted-foreground">
                                類型: {record.product_type}
                              </div>
                            )}
                            {record.amount && (
                              <div className="text-sm text-muted-foreground">
                                劑量: {record.amount} {record.amount_unit || 'ml'}
                              </div>
                            )}
                            {record.frequency && (
                              <div className="text-sm text-muted-foreground">
                                頻率: {
                                  record.frequency === 'once_daily' ? '每日一次' :
                                  record.frequency === 'twice_daily' ? '每日兩次' :
                                  record.frequency === 'three_times_daily' ? '每日三次' :
                                  record.frequency === 'as_needed' ? '需要時服用' :
                                  record.frequency
                                }
                              </div>
                            )}
                            {record.effectiveness_rating && (
                              <div className="text-sm text-muted-foreground">
                                效果: {record.effectiveness_rating}/5 分
                              </div>
                            )}
                          </>
                        )}

                        {record.notes && (
                          <div className="text-sm text-muted-foreground mt-2 p-2 bg-gray-50 rounded-lg">
                            {record.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-20 right-4 z-[9999] group">
        <button 
          onClick={() => {
            router.push('/diet-diary/add-record')
          }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-110 animate-pulse-slow flex items-center justify-center group-hover:animate-none touch-manipulation"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          <Plus className="h-6 w-6" />
        </button>
        <div className="absolute bottom-16 right-0 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          新增記錄
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}