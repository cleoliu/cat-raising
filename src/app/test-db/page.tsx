'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDbPage() {
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [error, setError] = useState<string>('')
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const checkTable = async () => {
      try {
        // Test if food_calculation_cats table exists by trying to query it
        const { data, error: queryError } = await supabase
          .from('food_calculation_cats')
          .select('id')
          .limit(1)

        if (queryError) {
          console.error('Table check error:', queryError)
          setTableExists(false)
          setError(queryError.message)
        } else {
          setTableExists(true)
          setTestResult(`Table exists and returned ${data?.length || 0} records`)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setTableExists(false)
        setError('Unexpected error occurred')
      }
    }

    checkTable()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold mb-4">Database Structure Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">food_calculation_cats Table Status:</h2>
            {tableExists === null && <p className="text-gray-500">Checking...</p>}
            {tableExists === true && (
              <div className="text-green-600">
                <p>✅ Table exists</p>
                <p className="text-sm">{testResult}</p>
              </div>
            )}
            {tableExists === false && (
              <div className="text-red-600">
                <p>❌ Table does not exist or access denied</p>
                <p className="text-sm">Error: {error}</p>
              </div>
            )}
          </div>

          {tableExists === false && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Action Required:</strong> You need to run the migration SQL:
                    <code className="block mt-2 bg-gray-100 p-2 text-xs">
                      migration/migration-multiple-cats.sql
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}