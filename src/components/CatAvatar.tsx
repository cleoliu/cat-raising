'use client'

import React from 'react'

// 預設貓咪圖標選項 - 手繪風格
export const CAT_AVATARS = [
  {
    id: 'cat-1',
    name: '白貓咪',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 主體 */}
        <ellipse cx="50" cy="60" rx="28" ry="25" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        {/* 頭部 */}
        <circle cx="50" cy="40" r="22" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        {/* 耳朵 */}
        <path d="M35 28 Q32 20 40 25 Q45 30 42 35" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        <path d="M65 28 Q68 20 60 25 Q55 30 58 35" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        {/* 耳朵內側 */}
        <path d="M37 28 Q36 24 40 26 Q42 29 40 31" fill="#FFB3BA" stroke="none"/>
        <path d="M63 28 Q64 24 60 26 Q58 29 60 31" fill="#FFB3BA" stroke="none"/>
        {/* 眼睛 - 瞇瞇眼 */}
        <path d="M42 38 Q45 35 48 38" stroke="#6C757D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M52 38 Q55 35 58 38" stroke="#6C757D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* 鼻子 */}
        <path d="M48 45 L50 47 L52 45" fill="#FFB3BA" stroke="#E9ECEF" strokeWidth="0.5"/>
        {/* 嘴巴 */}
        <path d="M50 47 Q47 50 44 48 M50 47 Q53 50 56 48" stroke="#6C757D" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* 鬍鬚 */}
        <path d="M30 42 L40 43 M30 46 L40 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        <path d="M70 42 L60 43 M70 46 L60 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        {/* 腳 */}
        <ellipse cx="38" cy="78" rx="6" ry="8" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
        <ellipse cx="62" cy="78" rx="6" ry="8" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: 'cat-2', 
    name: '橘貓咪',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 主體 */}
        <ellipse cx="50" cy="60" rx="28" ry="25" fill="#FFD93D" stroke="#FFCC02" strokeWidth="1.5"/>
        {/* 頭部 */}
        <circle cx="50" cy="40" r="22" fill="#FFD93D" stroke="#FFCC02" strokeWidth="1.5"/>
        {/* 條紋 */}
        <path d="M30 35 Q50 32 70 35" stroke="#FF9500" strokeWidth="2" fill="none"/>
        <path d="M32 50 Q50 47 68 50" stroke="#FF9500" strokeWidth="2" fill="none"/>
        <path d="M35 65 Q50 62 65 65" stroke="#FF9500" strokeWidth="2" fill="none"/>
        {/* 耳朵 */}
        <path d="M35 28 Q32 20 40 25 Q45 30 42 35" fill="#FFD93D" stroke="#FFCC02" strokeWidth="1.5"/>
        <path d="M65 28 Q68 20 60 25 Q55 30 58 35" fill="#FFD93D" stroke="#FFCC02" strokeWidth="1.5"/>
        {/* 耳朵內側 */}
        <path d="M37 28 Q36 24 40 26 Q42 29 40 31" fill="#FFB3BA" stroke="none"/>
        <path d="M63 28 Q64 24 60 26 Q58 29 60 31" fill="#FFB3BA" stroke="none"/>
        {/* 眼睛 - 瞇瞇眼 */}
        <path d="M42 38 Q45 35 48 38" stroke="#6C757D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M52 38 Q55 35 58 38" stroke="#6C757D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* 鼻子 */}
        <path d="M48 45 L50 47 L52 45" fill="#FFB3BA" stroke="#E9ECEF" strokeWidth="0.5"/>
        {/* 嘴巴 */}
        <path d="M50 47 Q47 50 44 48 M50 47 Q53 50 56 48" stroke="#6C757D" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* 鬍鬚 */}
        <path d="M30 42 L40 43 M30 46 L40 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        <path d="M70 42 L60 43 M70 46 L60 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        {/* 腳 */}
        <ellipse cx="38" cy="78" rx="6" ry="8" fill="#FFD93D" stroke="#FFCC02" strokeWidth="1"/>
        <ellipse cx="62" cy="78" rx="6" ry="8" fill="#FFD93D" stroke="#FFCC02" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: 'cat-3',
    name: '灰貓咪',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 主體 */}
        <ellipse cx="50" cy="60" rx="28" ry="25" fill="#CED4DA" stroke="#ADB5BD" strokeWidth="1.5"/>
        {/* 頭部 */}
        <circle cx="50" cy="40" r="22" fill="#CED4DA" stroke="#ADB5BD" strokeWidth="1.5"/>
        {/* 耳朵 */}
        <path d="M35 28 Q32 20 40 25 Q45 30 42 35" fill="#CED4DA" stroke="#ADB5BD" strokeWidth="1.5"/>
        <path d="M65 28 Q68 20 60 25 Q55 30 58 35" fill="#CED4DA" stroke="#ADB5BD" strokeWidth="1.5"/>
        {/* 耳朵內側 */}
        <path d="M37 28 Q36 24 40 26 Q42 29 40 31" fill="#FFB3BA" stroke="none"/>
        <path d="M63 28 Q64 24 60 26 Q58 29 60 31" fill="#FFB3BA" stroke="none"/>
        {/* 眼睛 - 瞇瞇眼 */}
        <path d="M42 38 Q45 35 48 38" stroke="#6C757D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M52 38 Q55 35 58 38" stroke="#6C757D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* 鼻子 */}
        <path d="M48 45 L50 47 L52 45" fill="#FFB3BA" stroke="#E9ECEF" strokeWidth="0.5"/>
        {/* 嘴巴 */}
        <path d="M50 47 Q47 50 44 48 M50 47 Q53 50 56 48" stroke="#6C757D" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* 鬍鬚 */}
        <path d="M30 42 L40 43 M30 46 L40 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        <path d="M70 42 L60 43 M70 46 L60 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        {/* 腳 */}
        <ellipse cx="38" cy="78" rx="6" ry="8" fill="#CED4DA" stroke="#ADB5BD" strokeWidth="1"/>
        <ellipse cx="62" cy="78" rx="6" ry="8" fill="#CED4DA" stroke="#ADB5BD" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: 'cat-4',
    name: '黑貓咪',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 主體 */}
        <ellipse cx="50" cy="60" rx="28" ry="25" fill="#495057" stroke="#343A40" strokeWidth="1.5"/>
        {/* 頭部 */}
        <circle cx="50" cy="40" r="22" fill="#495057" stroke="#343A40" strokeWidth="1.5"/>
        {/* 耳朵 */}
        <path d="M35 28 Q32 20 40 25 Q45 30 42 35" fill="#495057" stroke="#343A40" strokeWidth="1.5"/>
        <path d="M65 28 Q68 20 60 25 Q55 30 58 35" fill="#495057" stroke="#343A40" strokeWidth="1.5"/>
        {/* 耳朵內側 */}
        <path d="M37 28 Q36 24 40 26 Q42 29 40 31" fill="#FFB3BA" stroke="none"/>
        <path d="M63 28 Q64 24 60 26 Q58 29 60 31" fill="#FFB3BA" stroke="none"/>
        {/* 眼睛 - 瞇瞇眼 */}
        <path d="M42 38 Q45 35 48 38" stroke="#F8F9FA" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M52 38 Q55 35 58 38" stroke="#F8F9FA" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* 鼻子 */}
        <path d="M48 45 L50 47 L52 45" fill="#FFB3BA" stroke="#E9ECEF" strokeWidth="0.5"/>
        {/* 嘴巴 */}
        <path d="M50 47 Q47 50 44 48 M50 47 Q53 50 56 48" stroke="#F8F9FA" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* 鬍鬚 */}
        <path d="M30 42 L40 43 M30 46 L40 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        <path d="M70 42 L60 43 M70 46 L60 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        {/* 腳 */}
        <ellipse cx="38" cy="78" rx="6" ry="8" fill="#495057" stroke="#343A40" strokeWidth="1"/>
        <ellipse cx="62" cy="78" rx="6" ry="8" fill="#495057" stroke="#343A40" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: 'cat-5',
    name: '花色貓咪',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 主體 */}
        <ellipse cx="50" cy="60" rx="28" ry="25" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        {/* 頭部 */}
        <circle cx="50" cy="40" r="22" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        {/* 花色斑點 */}
        <circle cx="35" cy="35" r="5" fill="#FFD93D"/>
        <circle cx="62" cy="30" r="4" fill="#FF9500"/>
        <ellipse cx="45" cy="65" rx="8" ry="6" fill="#FFD93D"/>
        <circle cx="65" cy="70" r="6" fill="#FF9500"/>
        {/* 耳朵 */}
        <path d="M35 28 Q32 20 40 25 Q45 30 42 35" fill="#FFD93D" stroke="#FFCC02" strokeWidth="1.5"/>
        <path d="M65 28 Q68 20 60 25 Q55 30 58 35" fill="#FF9500" stroke="#FF8500" strokeWidth="1.5"/>
        {/* 耳朵內側 */}
        <path d="M37 28 Q36 24 40 26 Q42 29 40 31" fill="#FFB3BA" stroke="none"/>
        <path d="M63 28 Q64 24 60 26 Q58 29 60 31" fill="#FFB3BA" stroke="none"/>
        {/* 眼睛 - 瞇瞇眼 */}
        <path d="M42 38 Q45 35 48 38" stroke="#6C757D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M52 38 Q55 35 58 38" stroke="#6C757D" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* 鼻子 */}
        <path d="M48 45 L50 47 L52 45" fill="#FFB3BA" stroke="#E9ECEF" strokeWidth="0.5"/>
        {/* 嘴巴 */}
        <path d="M50 47 Q47 50 44 48 M50 47 Q53 50 56 48" stroke="#6C757D" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* 鬍鬚 */}
        <path d="M30 42 L40 43 M30 46 L40 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        <path d="M70 42 L60 43 M70 46 L60 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        {/* 腳 */}
        <ellipse cx="38" cy="78" rx="6" ry="8" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
        <ellipse cx="62" cy="78" rx="6" ry="8" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
      </svg>
    )
  },
  {
    id: 'cat-6',
    name: '睡覺貓咪',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 主體 */}
        <ellipse cx="50" cy="60" rx="28" ry="25" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        {/* 頭部 */}
        <circle cx="50" cy="40" r="22" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        {/* 耳朵 */}
        <path d="M35 28 Q32 20 40 25 Q45 30 42 35" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        <path d="M65 28 Q68 20 60 25 Q55 30 58 35" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1.5"/>
        {/* 耳朵內側 */}
        <path d="M37 28 Q36 24 40 26 Q42 29 40 31" fill="#FFB3BA" stroke="none"/>
        <path d="M63 28 Q64 24 60 26 Q58 29 60 31" fill="#FFB3BA" stroke="none"/>
        {/* 眼睛 - 閉眼睡覺 */}
        <path d="M40 38 L50 38" stroke="#6C757D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M52 38 L60 38" stroke="#6C757D" strokeWidth="2" strokeLinecap="round"/>
        {/* 睡覺符號 */}
        <text x="72" y="25" fill="#ADB5BD" fontSize="8" fontFamily="serif">z</text>
        <text x="78" y="20" fill="#ADB5BD" fontSize="6" fontFamily="serif">z</text>
        <text x="82" y="17" fill="#ADB5BD" fontSize="4" fontFamily="serif">z</text>
        {/* 鼻子 */}
        <path d="M48 45 L50 47 L52 45" fill="#FFB3BA" stroke="#E9ECEF" strokeWidth="0.5"/>
        {/* 嘴巴 - 微笑 */}
        <path d="M47 50 Q50 52 53 50" stroke="#6C757D" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* 鬍鬚 */}
        <path d="M30 42 L40 43 M30 46 L40 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        <path d="M70 42 L60 43 M70 46 L60 45" stroke="#ADB5BD" strokeWidth="1" strokeLinecap="round"/>
        {/* 腳 */}
        <ellipse cx="38" cy="78" rx="6" ry="8" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
        <ellipse cx="62" cy="78" rx="6" ry="8" fill="#F8F9FA" stroke="#E9ECEF" strokeWidth="1"/>
      </svg>
    )
  }
]

interface CatAvatarProps {
  avatarId?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

export default function CatAvatar({ avatarId, size = 'md', className = '' }: CatAvatarProps) {
  const avatar = CAT_AVATARS.find(cat => cat.id === avatarId) || CAT_AVATARS[0]
  
  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-1 border border-primary/20`}>
      {avatar.svg}
    </div>
  )
}