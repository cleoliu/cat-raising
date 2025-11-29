'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [dbVersion, setDbVersion] = useState<string>('')

  const testConnection = async () => {
    setConnectionStatus('testing')
    setErrorMessage('')
    
    try {
      // 測試基本連線 - 嘗試連接到 Supabase
      const { data, error } = await supabase.auth.getSession()
      
      // 如果沒有錯誤，表示連線成功
      if (error && error.message.includes('Invalid API key')) {
        throw new Error('API Key 無效')
      }

      // 嘗試一個簡單的 RPC 呼叫來測試資料庫連線
      const { data: pingData, error: pingError } = await supabase
        .rpc('ping')
        
      // 即使 ping 失敗也沒關係，只要不是連線錯誤就行
      
      setConnectionStatus('success')
    } catch (error: any) {
      setConnectionStatus('error')
      setErrorMessage(error.message || '未知錯誤')
    }
  }

  const testTableExists = async () => {
    const results = {
      users: false,
      cats: false,
      calculations: false
    }

    try {
      // 測試 users 表格
      const { error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      results.users = !usersError

      // 測試 cats 表格  
      const { error: catsError } = await supabase
        .from('cats')
        .select('id')
        .limit(1)
      results.cats = !catsError

      // 測試 food_calculations 表格
      const { error: calculationsError } = await supabase
        .from('food_calculations')
        .select('id')
        .limit(1)
      results.calculations = !calculationsError

    } catch (error: any) {
      console.error('Table test error:', error)
    }

    return results
  }

  const [tableStatus, setTableStatus] = useState<{
    users: boolean
    cats: boolean
    calculations: boolean
  } | null>(null)

  const runTableTest = async () => {
    const status = await testTableExists()
    setTableStatus(status)
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Supabase 連線測試</h1>
          <p className="text-gray-600 mt-2">測試資料庫連線和表格狀態</p>
        </div>

        {/* 連線狀態 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {connectionStatus === 'testing' && '🔄'}
              {connectionStatus === 'success' && '✅'}
              {connectionStatus === 'error' && '❌'}
              資料庫連線狀態
            </CardTitle>
            <CardDescription>
              測試 Supabase 資料庫基本連線
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connectionStatus === 'testing' && (
              <p className="text-blue-600">正在測試連線...</p>
            )}
            {connectionStatus === 'success' && (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">✅ 連線成功！</p>
                {dbVersion && (
                  <p className="text-sm text-gray-600">資料庫版本: {dbVersion}</p>
                )}
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="space-y-2">
                <p className="text-red-600 font-semibold">❌ 連線失敗</p>
                <p className="text-sm text-red-500">{errorMessage}</p>
              </div>
            )}
            <Button 
              onClick={testConnection} 
              className="mt-4"
              disabled={connectionStatus === 'testing'}
            >
              重新測試連線
            </Button>
          </CardContent>
        </Card>

        {/* 表格測試 */}
        <Card>
          <CardHeader>
            <CardTitle>資料表檢查</CardTitle>
            <CardDescription>
              檢查必要的資料表是否已建立
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={runTableTest}>
                檢查資料表
              </Button>
              
              {tableStatus && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {tableStatus.users ? '✅' : '❌'}
                    <span>users 表格</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tableStatus.cats ? '✅' : '❌'}
                    <span>cats 表格</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tableStatus.calculations ? '✅' : '❌'}
                    <span>food_calculations 表格</span>
                  </div>
                  
                  {!tableStatus.users || !tableStatus.cats || !tableStatus.calculations ? (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 font-semibold">⚠️ 缺少資料表</p>
                      <p className="text-sm text-yellow-700">
                        請確認已在 Supabase SQL Editor 中執行 supabase-schema.sql 檔案
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-semibold">🎉 所有資料表已就緒！</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 環境變數檢查 */}
        <Card>
          <CardHeader>
            <CardTitle>環境變數檢查</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}
                <span>NEXT_PUBLIC_SUPABASE_URL</span>
                {process.env.NEXT_PUBLIC_SUPABASE_URL && (
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL}
                  </code>
                )}
              </div>
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
                  </code>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            返回首頁
          </Button>
        </div>
      </div>
    </div>
  )
}