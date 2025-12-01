'use client'

import React from 'react'
import Image from 'next/image'

// 新的貓咪圖標選項 - 使用 Gemini 生成的可愛圖示
export const CAT_AVATARS = [
  { id: 'cat-1', name: '白色小貓', image: '/cats/cat-0.png' },
  { id: 'cat-2', name: '暹羅貓', image: '/cats/cat-1.png' },
  { id: 'cat-3', name: '棕色貓咪', image: '/cats/cat-2.png' },
  { id: 'cat-4', name: '深色貓咪', image: '/cats/cat-3.png' },
  { id: 'cat-5', name: '橘色小貓', image: '/cats/cat-4.png' },
  { id: 'cat-6', name: '灰色貓咪', image: '/cats/cat-5.png' },
  { id: 'cat-7', name: '條紋灰貓', image: '/cats/cat-6.png' },
  { id: 'cat-8', name: '橘色條紋貓', image: '/cats/cat-7.png' },
  { id: 'cat-9', name: '棕色條紋貓', image: '/cats/cat-8.png' },
  { id: 'cat-10', name: '虎斑貓', image: '/cats/cat-9.png' },
  { id: 'cat-11', name: '波斯貓', image: '/cats/cat-10.png' },
  { id: 'cat-12', name: '吉娃娃貓', image: '/cats/cat-11.png' },
  { id: 'cat-13', name: '三花貓', image: '/cats/cat-12.png' },
  { id: 'cat-14', name: '黑白貓', image: '/cats/cat-13.png' },
  { id: 'cat-15', name: '黑色貓咪', image: '/cats/cat-14.png' },
  { id: 'cat-16', name: '玉米貓', image: '/cats/cat-15.png' }
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

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64
}

export default function CatAvatar({ avatarId, size = 'md', className = '' }: CatAvatarProps) {
  const avatar = CAT_AVATARS.find(cat => cat.id === avatarId) || CAT_AVATARS[0]
  const imageSize = imageSizes[size]
  
  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`} style={{ pointerEvents: 'none' }}>
      <Image
        src={avatar.image}
        alt={avatar.name}
        width={imageSize}
        height={imageSize}
        className="w-full h-full object-contain"
        priority={false}
        unoptimized={true}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  )
}