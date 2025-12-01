import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket, Calculator, Cat, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section - 全屏背景圖片 */}
      <section className="relative min-h-screen flex flex-col">
        {/* 背景圖片 */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-cover.png"
            alt="溫馨的貓咪居家場景"
            fill
            className="object-cover object-center"
            priority={true}
            unoptimized={true}
          />
          {/* 輕微淡化效果 - 保持圖片亮度 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60"></div>
        </div>

        {/* 內容區域 - 調整為底部對齊 */}
        <div className="relative z-10 flex-1 flex flex-col justify-end items-center px-4 pb-32">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            {/* Title */}
            <h1 className="mb-6 bg-gradient-to-br from-primary via-accent to-secondary bg-clip-text text-4xl font-extrabold tracking-wider text-transparent md:text-6xl drop-shadow-lg">
              C A T - R A I S I N G
            </h1>

            {/* 酷炫按鈕 - 等寬設計 */}
            <div className="flex flex-col gap-4 sm:flex-row justify-center items-center max-w-md mx-auto">
              <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-primary/40 transition-all duration-500 hover:scale-110 animate-pulse border-2 border-white/20 w-full sm:w-48">
                <Link href="/auth/register" className="relative z-10 flex items-center justify-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  免費開始使用
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
              </Button>
              
              <Button asChild size="lg" className="group relative overflow-hidden bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-white/30 hover:border-white/50 w-full sm:w-48">
                <Link href="/auth/login" className="relative z-10 flex items-center justify-center gap-3">
                  登入
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 向下滾動指示器 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl animate-slide-up">
            三大核心功能
          </h2>
          <p className="mb-16 text-center text-muted-foreground text-lg animate-slide-up" style={{animationDelay: '0.1s'}}>
            強大功能，守護愛貓健康
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Calculator className="h-10 w-10 text-primary" />}
              title="精準計算"
              description="基於 AAFCO 標準的科學計算公式，確保營養數據的準確性。"
              delay="0s"
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-success" />}
              title="智能記錄"
              description="自動保存歷史記錄，方便追蹤與比較不同貓糧的營養成分。"
              delay="0.2s"
            />
            <FeatureCard
              icon={<Cat className="h-10 w-10 text-secondary" />}
              title="多貓管理"
              description="為家中每位主子建立專屬檔案，個別化管理飲食健康。"
              delay="0.4s"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) {
  return (
    <Card className="glass group relative overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 animate-slide-up border-primary/20" style={{animationDelay: delay}}>
      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="absolute -top-20 -right-20 h-40 w-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <CardHeader className="relative z-10">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm ring-1 ring-primary/30 group-hover:ring-primary/50 transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>
        <CardTitle className="text-2xl font-bold mb-3">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
