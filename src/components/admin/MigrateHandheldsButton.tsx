'use client'

import { useState } from 'react'
import { Gamepad2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MigrateHandheldsButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleMigration = async () => {
    if (!confirm('Are you sure you want to migrate all handheld items to Nintendo console type? This will update the production database.')) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/migrate-handhelds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        toast.success(`Migration completed! Updated ${data.summary.updated} consoles.`)
      } else {
        toast.error(data.message || 'Migration failed')
        setResult(data)
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('Failed to run migration')
      setResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Gamepad2 className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Database Migration</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Migrate Handhelds to Nintendo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Move all handheld gaming devices from "Other" console type to "Nintendo" console type. 
            This migration is safe to run multiple times and will only update consoles that aren't already under Nintendo.
          </p>
        </div>

        <button
          onClick={handleMigration}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Migration...
            </>
          ) : (
            <>
              <Gamepad2 className="h-4 w-4 mr-2" />
              Run Migration
            </>
          )}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              )}
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? 'Migration Successful' : 'Migration Failed'}
                </h4>
                {result.summary && (
                  <div className="mt-2 text-sm text-gray-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Total handheld items: {result.summary.totalHandheldItems}</li>
                      <li>Consoles updated: {result.summary.updated}</li>
                      <li>Consoles skipped (already correct): {result.summary.skipped}</li>
                      <li>Items now under Nintendo: {result.summary.itemsUnderNintendo}</li>
                      {result.summary.itemsUnderOther > 0 && (
                        <li className="text-red-600">Items still under Other: {result.summary.itemsUnderOther}</li>
                      )}
                    </ul>
                    {result.updatedConsoles && result.updatedConsoles.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Updated consoles:</p>
                        <p className="text-xs text-gray-600">{result.updatedConsoles.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
                {result.error && (
                  <p className="mt-2 text-sm text-red-700">{result.message || result.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

