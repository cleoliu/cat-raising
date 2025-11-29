import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket, Calculator, Cat, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="absolute inset-0 -z-20 bg-grid-white/[0.05]"></div>
        
        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 ring-2 ring-primary/20">
          <Rocket className="h-12 w-12 animate-glow text-primary" />
        </div>
        
        <h1 className="mb-4 bg-gradient-to-br from-primary via-accent to-secondary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl">
          貓咪乾物質計算器
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground md:text-xl">
          專為現代貓奴設計的營養分析工具，運用科技守護愛貓的健康。
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="animate-glow">
            <Link href="/auth/register">
              <Rocket className="mr-2 h-5 w-5" />
              免費開始使用
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/login">
              登入
            </Link>
          </Button>
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

      {/* CTA Section */}
      <section className="relative px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="mx-auto max-w-2xl text-center relative">
          <Card className="glass overflow-hidden animate-scale-in border-primary/30">
            <div className="absolute top-0 left-0 w-full h-1 gradient-primary"></div>
            <CardHeader className="pb-4">
              <div className="mb-4 inline-flex mx-auto h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-sm">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                準備好開始了嗎？
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="mb-8 text-muted-foreground text-lg">
                無需信用卡，立即註冊，開始為您的愛貓進行科學的營養分析。
              </p>
              <Button asChild size="lg" className="w-full gradient-accent text-white hover:scale-105 transition-transform duration-300 animate-glow shadow-2xl">
                <Link href="/auth/register">
                  <Rocket className="mr-2 h-5 w-5" />
                  立即加入
                </Link>
              </Button>
            </CardContent>
          </Card>
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
