import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <div className="px-4 pt-8 pb-6">
        <div className="max-w-md mx-auto text-center">
          
          {/* App Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl mb-6 shadow-xl">
            <span className="text-4xl">🐱</span>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            貓咪乾物質計算器
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            專業貓糧營養分析工具<br />
            為愛貓選擇最適合的食物
          </p>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <Link
              href="/auth/register"
              className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-4 rounded-2xl font-semibold text-lg shadow-lg active:scale-95 transition-transform"
            >
              🚀 免費開始使用
            </Link>
            <Link
              href="/auth/login"
              className="block w-full bg-blue-50 border-2 border-blue-200 text-blue-700 text-center py-4 rounded-2xl font-semibold hover:bg-blue-100 transition-colors"
            >
              已有帳號？立即登入
            </Link>
          </div>

        </div>
      </div>

      {/* Features */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧮</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">精準計算</h3>
            </div>
            <p className="text-gray-600">基於AAFCO標準的科學計算公式</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">智能記錄</h3>
            </div>
            <p className="text-gray-600">自動保存歷史記錄，一鍵重複使用</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🐾</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">多貓管理</h3>
            </div>
            <p className="text-gray-600">為每隻貓咪建立專屬檔案</p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
            <p className="text-sm text-blue-700 font-medium mb-2">
              ✨ 完全免費使用
            </p>
            <p className="text-xs text-blue-600">
              無需信用卡，立即開始為愛貓計算營養
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
