'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import CatAvatar from './CatAvatar'

export default function BottomNav() {
  const pathname = usePathname()
  
  const navItems = [
    {
      href: '/dashboard',
      label: '食品',
      icon: (
        <Image
          src="/cat-food-icon.png"
          alt="食品"
          width={24}
          height={24}
          className="object-contain"
          unoptimized={true}
        />
      ),
      activeIcon: (
        <Image
          src="/cat-food-icon.png"
          alt="食品"
          width={24}
          height={24}
          className="object-contain"
          unoptimized={true}
        />
      )
    },
    {
      href: '/cats',
      label: '管理貓咪',
      icon: <CatAvatar avatarId="cat-1" size="sm" />,
      activeIcon: <CatAvatar avatarId="cat-1" size="sm" />
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-[9998]">
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
              <div className="mb-1 flex items-center justify-center">
                {isActive ? item.activeIcon : item.icon}
              </div>
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