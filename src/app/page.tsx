import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket, Calculator, Cat, CheckCircle, Heart, Bell, DollarSign, Package, FileText, BarChart3 } from 'lucide-react'

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
            <h1 className="mb-6 bg-gradient-to-br from-primary via-accent to-secondary bg-clip-text text-2xl sm:text-4xl font-extrabold tracking-wide sm:tracking-wider text-transparent md:text-6xl drop-shadow-lg px-2">
              C A T - R A I S I N G
            </h1>

            {/* 酷炫按鈕 - 三個按鈕設計 */}
            <div className="flex flex-col gap-4 sm:flex-row justify-center items-center max-w-2xl mx-auto">
              <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-110 animate-pulse border-2 border-white/20 w-full sm:w-44 min-h-[60px] cursor-pointer" style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                <Link href="/auth/register" className="flex items-center justify-center gap-3 w-full h-full relative z-20">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  免費開始使用
                </Link>
              </Button>
              
              <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-gray-800 font-semibold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-green-200/30 transition-all duration-300 hover:scale-105 border-2 border-green-200/50 hover:border-green-300 w-full sm:w-44 min-h-[60px] cursor-pointer" style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                <Link href="/calculator-trial" className="flex items-center justify-center gap-2 w-full h-full relative z-20">
                  🧮 試用計算機
                </Link>
              </Button>
              
              <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 text-gray-800 font-semibold py-6 px-8 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-yellow-200/30 transition-all duration-300 hover:scale-105 border-2 border-yellow-200/50 hover:border-yellow-300 w-full sm:w-44 min-h-[60px] cursor-pointer" style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                <Link href="/auth/login" className="flex items-center justify-center gap-2 w-full h-full relative z-20">
                  登入
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
            全方位貓咪生活管理
          </h2>
          <p className="mb-16 text-center text-muted-foreground text-lg animate-slide-up" style={{animationDelay: '0.1s'}}>
            從營養到健康，從記帳到提醒，全面呵護您的貓咪
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Calculator className="h-10 w-10 text-primary" />}
              title="營養分析"
              description="基於 AAFCO 標準的科學計算，精準分析貓糧營養成分與乾物質含量。"
              delay="0s"
            />
            <FeatureCard
              icon={<Heart className="h-10 w-10 text-rose-500" />}
              title="健康記錄"
              description="完整的醫療保健記錄，追蹤疫苗、體檢、用藥等重要健康資訊。"
              delay="0.1s"
              comingSoon={true}
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-blue-500" />}
              title="飲食日記"
              description="詳細記錄每日飲食攝取，包含餵食時間、份量與貓咪反應。"
              delay="0.2s"
              comingSoon={true}
            />
            <FeatureCard
              icon={<Bell className="h-10 w-10 text-orange-500" />}
              title="智能提醒"
              description="餵食、用藥、清潔、體檢等重要任務提醒，不再錯過照護時間。"
              delay="0.3s"
              comingSoon={true}
            />
            <FeatureCard
              icon={<DollarSign className="h-10 w-10 text-green-500" />}
              title="支出管理"
              description="詳細記錄貓咪相關花費，包含飼料、醫療、用品等開支統計。"
              delay="0.4s"
              comingSoon={true}
            />
            <FeatureCard
              icon={<Package className="h-10 w-10 text-purple-500" />}
              title="庫存追蹤"
              description="管理貓糧、貓砂、玩具等消耗品庫存，提前預警補貨時間。"
              delay="0.5s"
              comingSoon={true}
            />
            <FeatureCard
              icon={<Cat className="h-10 w-10 text-secondary" />}
              title="多貓管理"
              description="為家中每位主子建立專屬檔案，個別化管理所有生活記錄。"
              delay="0.6s"
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-indigo-500" />}
              title="數據分析"
              description="每月自動生成詳細報表，分析健康趨勢、支出統計與照護品質。"
              delay="0.7s"
              comingSoon={true}
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-success" />}
              title="雲端同步"
              description="所有資料雲端備份，多裝置同步，隨時隨地存取貓咪資訊。"
              delay="0.8s"
              comingSoon={true}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description, delay, comingSoon = false }: { icon: React.ReactNode, title: string, description: string, delay: string, comingSoon?: boolean }) {
  return (
    <Card className={`glass group relative overflow-hidden hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 animate-slide-up border-primary/20 ${comingSoon ? 'opacity-75' : ''}`} style={{animationDelay: delay}}>
      {comingSoon && (
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
            敬請期待
          </span>
        </div>
      )}
      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-primary/20 via-accent/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="absolute -top-20 -right-20 h-40 w-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <CardHeader className="relative z-10">
        <div className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm ring-1 ring-primary/30 group-hover:ring-primary/50 transition-all duration-300 group-hover:scale-110 ${comingSoon ? 'grayscale-0' : ''}`}>
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
