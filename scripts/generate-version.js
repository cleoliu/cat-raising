#!/usr/bin/env node

/**
 * 自動生成版本號腳本
 * 在建置時執行，根據 Git 信息或環境變數生成版本號
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function generateVersion() {
  try {
    // 優先使用環境變數中的版本號（適用於 CI/CD）
    if (process.env.APP_VERSION) {
      console.log(`📦 使用環境變數版本: ${process.env.APP_VERSION}`)
      return process.env.APP_VERSION
    }

    // 嘗試從 Git 獲取版本信息
    try {
      // 獲取最新的 Git commit hash (短版本)
      const gitHash = execSync('git rev-parse --short HEAD', { 
        encoding: 'utf-8', 
        stdio: ['pipe', 'pipe', 'ignore'] 
      }).trim()

      // 獲取當前時間戳
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')

      // 檢查是否有未提交的變更
      let isDirty = false
      try {
        const gitStatus = execSync('git status --porcelain', { 
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim()
        isDirty = gitStatus.length > 0
      } catch (e) {
        // 忽略錯誤
      }

      // 生成版本號：時間戳-git哈希[-dirty]
      const version = `${timestamp}-${gitHash}${isDirty ? '-dirty' : ''}`
      console.log(`📦 自動生成版本: ${version}`)
      return version
    } catch (gitError) {
      console.log('⚠️  無法獲取 Git 信息，使用時間戳版本')
      // 如果無法獲取 Git 信息，使用時間戳
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
      const version = `${timestamp}-nogit`
      console.log(`📦 時間戳版本: ${version}`)
      return version
    }
  } catch (error) {
    console.error('❌ 生成版本號失敗:', error.message)
    // 回退版本
    const fallbackVersion = `fallback-${Date.now()}`
    console.log(`📦 使用回退版本: ${fallbackVersion}`)
    return fallbackVersion
  }
}

function writeVersionFile(version) {
  const versionFilePath = path.join(__dirname, '..', 'src', 'lib', 'version.generated.ts')
  
  const content = `/**
 * 自動生成的版本文件
 * 請勿手動編輯此文件
 * 由 scripts/generate-version.js 在建置時生成
 */

export const GENERATED_VERSION = '${version}'
export const BUILD_TIME = '${new Date().toISOString()}'
export const BUILD_ENV = '${process.env.NODE_ENV || 'development'}'

// 運行時版本信息
export const VERSION_INFO = {
  version: GENERATED_VERSION,
  buildTime: BUILD_TIME,
  buildEnv: BUILD_ENV,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
  timestamp: Date.now()
}
`

  try {
    fs.writeFileSync(versionFilePath, content, 'utf-8')
    console.log(`✅ 版本文件已生成: ${versionFilePath}`)
  } catch (error) {
    console.error(`❌ 寫入版本文件失敗: ${error.message}`)
    process.exit(1)
  }
}

function main() {
  console.log('🚀 開始生成版本文件...')
  const version = generateVersion()
  writeVersionFile(version)
  console.log('✨ 版本生成完成！')
}

// 如果直接執行此腳本
if (require.main === module) {
  main()
}

module.exports = { generateVersion, writeVersionFile }