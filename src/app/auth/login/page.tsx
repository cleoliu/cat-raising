'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, ArrowLeft } from 'lucide-react'
import CatAvatar from '@/components/CatAvatar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        setMessage('登入成功！正在跳轉...')
        router.push('/dashboard')
      }
    } catch (error: any) {
      setMessage(error.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      setMessage(error.message || 'Google 登入失敗')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-grid opacity-20"></div>
      <div className="fixed top-20 left-1/4 h-96 w-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="fixed bottom-20 right-1/4 h-96 w-96 bg-gradient-to-r from-secondary/15 to-primary/15 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl mb-6 shadow-lg backdrop-blur-sm ring-2 ring-primary/20 animate-float">
              <CatAvatar avatarId="cat-1" size="xl" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">歡迎回來</h1>
            <p className="text-muted-foreground">登入您的帳號繼續使用</p>
          </div>

          <div className="glass rounded-3xl p-8 shadow-2xl border-primary/30">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  電子郵件
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-primary/30 bg-background/50 focus:border-primary focus:ring-primary h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  密碼
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="輸入您的密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-primary/30 bg-background/50 focus:border-primary focus:ring-primary h-12"
                />
              </div>

              {message && (
                <div className={`text-sm p-4 rounded-xl backdrop-blur-sm ${
                  message.includes('成功') 
                    ? 'bg-success/20 text-success border border-success/30' 
                    : 'bg-destructive/20 text-destructive border border-destructive/30'
                }`}>
                  {message}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full gradient-primary text-white hover:scale-105 transition-all duration-300 h-12 rounded-xl font-semibold shadow-lg animate-glow" 
                disabled={loading}
              >
                <LogIn className="mr-2 h-5 w-5" />
                {loading ? '登入中...' : '登入'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">
                  或者
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full glass hover:scale-105 transition-all duration-300 h-12 rounded-xl border-primary/30" 
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              使用 Google 登入
            </Button>
          </div>

          <div className="text-center space-y-4 mt-8">
            <p className="text-sm text-muted-foreground">
              還沒有帳號？
              <Link 
                href="/auth/register" 
                className="text-primary hover:text-primary/80 font-semibold ml-1 hover:underline"
              >
                立即註冊
              </Link>
            </p>
            
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首頁
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
