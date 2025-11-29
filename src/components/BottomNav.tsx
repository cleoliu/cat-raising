'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()
  
  const navItems = [
    {
      href: '/dashboard',
      label: '產品',
      icon: '📦',
      activeIcon: '📦'
    },
    {
      href: '/calculator',
      label: '計算機',
      icon: '🧮',
      activeIcon: '🧮'
    },
    {
      href: '/cats',
      label: '管理貓咪',
      icon: '🐱',
      activeIcon: '🐱'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[64px] transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mb-1">
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className={`text-xs font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}