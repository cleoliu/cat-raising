'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import CatAvatar, { CAT_AVATARS } from '@/components/CatAvatar'
import { Edit2, Trash2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Cat } from '@/types'

export default function CatsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [cats, setCats] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Cat | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    weight: '',
    avatar_id: 'cat-1'
  })
  const [submitting, setSubmitting] = useState(false)

  // 計算年齡的輔助函數
  const calculateAge = (birthday: string): number => {
    if (!birthday) return 0
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return Math.max(0, age)
  }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    try {
      const age = calculateAge(formData.birthday)
      
      if (editingCat) {
        // 編輯模式
        const updateData: any = {
          name: formData.name,
          age: age,
          weight: parseFloat(formData.weight)
        }
        
        // 只有在有值時才添加新欄位，避免資料庫錯誤
        if (formData.birthday) {
          updateData.birthday = formData.birthday
        }
        if (formData.avatar_id) {
          updateData.avatar_id = formData.avatar_id
        }

        const { error } = await supabase
          .from('cats')
          .update(updateData)
          .eq('id', editingCat.id)

        if (error) {
          console.error('Update error:', error)
          alert('更新貓咪失敗：' + error.message)
          return
        }
      } else {
        // 新增模式
        const insertData: any = {
          user_id: user.id,
          name: formData.name,
          age: age,
          weight: parseFloat(formData.weight)
        }
        
        // 只有在有值時才添加新欄位
        if (formData.birthday) {
          insertData.birthday = formData.birthday
        }
        if (formData.avatar_id) {
          insertData.avatar_id = formData.avatar_id
        }

        const { error } = await supabase
          .from('cats')
          .insert(insertData)

        if (error) {
          console.error('Insert error:', error)
          alert('新增貓咪失敗：' + error.message)
          return
        }
      }

      // 重新載入貓咪列表
      await loadCats(user.id)
      
      // 重設表單
      setFormData({ name: '', birthday: '', weight: '', avatar_id: 'cat-1' })
      setShowAddForm(false)
      setEditingCat(null)
      
    } catch (error: any) {
      alert(`${editingCat ? '更新' : '新增'}貓咪失敗：` + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (cat: Cat) => {
    setEditingCat(cat)
    setFormData({
      name: cat.name,
      birthday: cat.birthday || '',
      weight: cat.weight.toString(),
      avatar_id: cat.avatar_id || 'cat-1'
    })
    setShowAddForm(true)
  }

  const handleCancelEdit = () => {
    setEditingCat(null)
    setFormData({ name: '', birthday: '', weight: '', avatar_id: 'cat-1' })
    setShowAddForm(false)
  }

  const handleDelete = async (catId: string) => {
    if (!confirm('確定要刪除這隻貓咪嗎？這將會一併刪除相關的計算記錄。')) {
      return
    }

    try {
      const { error } = await supabase
        .from('cats')
        .delete()
        .eq('id', catId)

      if (error) {
        alert('刪除失敗：' + error.message)
        return
      }

      // 重新載入貓咪列表
      if (user) {
        await loadCats(user.id)
      }
    } catch (error: any) {
      alert('刪除失敗：' + error.message)
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
      
      {/* Header */}
      <div className="glass border-b border-primary/20 sticky top-0 z-10 backdrop-blur-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4 animate-slide-up">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">貓咪管理</h1>
              <p className="text-sm text-muted-foreground">管理您的貓咪資料</p>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
              className="gradient-primary text-white px-4 py-2 rounded-xl text-sm hover:scale-105 transition-all duration-300 animate-glow shadow-lg"
            >
              + 新增
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">

          {/* Add Cat Form */}
          {showAddForm && (
            <Card className="mb-6 glass border-primary/20 animate-scale-in">
              <CardHeader>
                <CardTitle className="text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {editingCat ? '編輯貓咪' : '新增貓咪'}
                </CardTitle>
                <CardDescription className="text-muted-foreground">填寫貓咪的基本資料</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Avatar Selection */}
                  <div className="space-y-3">
                    <Label>選擇貓咪頭像</Label>
                    <div className="flex flex-wrap gap-3">
                      {CAT_AVATARS.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar_id: avatar.id })}
                          className={`p-2 rounded-xl border-2 transition-all duration-300 hover:scale-110 ${
                            formData.avatar_id === avatar.id 
                              ? 'border-primary bg-primary/10 shadow-lg' 
                              : 'border-primary/30 hover:border-primary/60'
                          }`}
                          title={avatar.name}
                        >
                          <CatAvatar avatarId={avatar.id} size="lg" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">貓咪姓名 *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="例如：小黑"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="glass border-primary/30 focus:border-primary focus:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="birthday">生日</Label>
                      <input
                        id="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                        className="flex h-10 w-full rounded-xl border border-primary/30 bg-background/90 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm transition-all duration-300"
                        style={{ colorScheme: 'light' }}
                      />
                      {formData.birthday && (
                        <p className="text-xs text-muted-foreground">
                          年齡：{calculateAge(formData.birthday)} 歲
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">體重 (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="例如：4.5"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={submitting} className="gradient-primary text-white hover:scale-105 transition-all duration-300 animate-glow">
                      {submitting ? (editingCat ? '更新中...' : '新增中...') : (editingCat ? '更新貓咪' : '新增貓咪')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="glass border-primary/30 hover:bg-primary/10 transition-all duration-300"
                      onClick={handleCancelEdit}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Cats List */}
          {cats.length === 0 ? (
            <Card className="glass border-primary/20 animate-scale-in">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="flex justify-center animate-float">
                      <CatAvatar avatarId="cat-1" size="xl" />
                    </div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-20 h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl"></div>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    還沒有貓咪資料
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    新增您的第一隻貓咪，開始記錄營養資料
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="gradient-primary text-white hover:scale-105 transition-all duration-300 animate-glow shadow-lg">
                    新增第一隻貓咪
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cats.map((cat, index) => (
                <div key={cat.id} className="relative">
                  <Link href={`/dashboard?cat=${cat.id}`}>
                    <Card className="glass border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 animate-slide-up group cursor-pointer" style={{animationDelay: `${index * 0.1}s`}}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <CatAvatar avatarId={cat.avatar_id} size="lg" className="flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                              {cat.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {cat.age} 歲 • {cat.weight} kg
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">年齡：</span>
                            <span className="font-medium text-foreground">{cat.age} 歲</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">體重：</span>
                            <span className="font-medium text-foreground">{cat.weight} kg</span>
                          </div>
                          {cat.birthday && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">生日：</span>
                              <span className="font-medium text-foreground">
                                {new Date(cat.birthday).toLocaleDateString('zh-TW')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-primary/20">
                          <p className="text-xs text-center text-muted-foreground group-hover:text-primary transition-colors duration-300">
                            點擊查看 {cat.name} 的營養記錄
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  {/* 浮動按鈕 */}
                  <div className="absolute top-3 right-3 flex gap-1 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEdit(cat)
                      }}
                      className="p-2 hover:scale-110 transition-transform duration-300 text-primary hover:text-primary/80 hover:bg-primary/10 glass border border-primary/30"
                      title="編輯貓咪"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(cat.id)
                      }}
                      className="p-2 hover:scale-110 transition-transform duration-300 text-destructive hover:text-destructive/80 hover:bg-destructive/10 glass border border-destructive/30"
                      title="刪除貓咪"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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