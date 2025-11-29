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
import type { User } from '@supabase/supabase-js'
import type { Cat } from '@/types'

export default function CatsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [cats, setCats] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: ''
  })
  const [submitting, setSubmitting] = useState(false)
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
      const { error } = await supabase
        .from('cats')
        .insert({
          user_id: user.id,
          name: formData.name,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight)
        })

      if (error) {
        alert('新增貓咪失敗：' + error.message)
        return
      }

      // 重新載入貓咪列表
      await loadCats(user.id)
      
      // 重設表單
      setFormData({ name: '', age: '', weight: '' })
      setShowAddForm(false)
      
    } catch (error: any) {
      alert('新增貓咪失敗：' + error.message)
    } finally {
      setSubmitting(false)
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">貓咪管理</h1>
              <p className="text-sm text-gray-600">管理您的貓咪資料</p>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm"
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
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>新增貓咪</CardTitle>
                <CardDescription>填寫貓咪的基本資料</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age">年齡 (歲) *</Label>
                      <Input
                        id="age"
                        type="number"
                        min="0"
                        max="30"
                        placeholder="例如：3"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                      />
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
                    <Button type="submit" disabled={submitting}>
                      {submitting ? '新增中...' : '新增貓咪'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setFormData({ name: '', age: '', weight: '' })
                      }}
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
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    🐱
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    還沒有貓咪資料
                  </h3>
                  <p className="text-gray-600 mb-4">
                    新增您的第一隻貓咪，開始記錄營養資料
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    新增第一隻貓咪
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cats.map((cat) => (
                <Card key={cat.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          🐱 {cat.name}
                        </CardTitle>
                        <CardDescription>
                          {cat.age} 歲 • {cat.weight} kg
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(cat.id)}
                      >
                        刪除
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">年齡：</span>
                        <span className="font-medium">{cat.age} 歲</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">體重：</span>
                        <span className="font-medium">{cat.weight} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">建立時間：</span>
                        <span className="font-medium">
                          {new Date(cat.created_at).toLocaleDateString('zh-TW')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Link href={`/dashboard?cat=${cat.id}`}>
                        <Button variant="outline" className="w-full">
                          查看計算記錄
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}