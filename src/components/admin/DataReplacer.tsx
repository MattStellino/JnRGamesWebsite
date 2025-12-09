'use client'

import React, { useState } from 'react'
import { AlertTriangle, RefreshCw, Database, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReplaceResult {
  success: boolean
  message: string
  imported: number
  errors: string[]
}

export default function DataReplacer() {
  const [isReplacing, setIsReplacing] = useState(false)
  const [replaceResult, setReplaceResult] = useState<ReplaceResult | null>(null)
  const [confirmReplace, setConfirmReplace] = useState(false)

  const handleReplaceData = async () => {
    if (!confirmReplace) {
      toast.error('Please confirm that you want to replace all data')
      return
    }

    setIsReplacing(true)
    setReplaceResult(null)

    try {
      const response = await fetch('/api/admin/replace-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmReplace: true
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setReplaceResult(result)
        if (result.success) {
          toast.success(`Data replacement completed! ${result.imported} items imported.`)
          // Refresh the page to show new data
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else {
          toast.error('Data replacement completed with errors')
        }
      } else {
        toast.error(result.error || 'Data replacement failed')
      }
    } catch (error) {
      toast.error('Failed to replace data')
    } finally {
      setIsReplacing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Data Replacement</h2>
        <p className="text-gray-600">
          Replace all existing items with data from your CSV files. This will completely clear all current data and import from:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
          <li>Console Website CSV - Sheet1.csv</li>
          <li>Controller & Accesories Website CSV - Sheet1.csv</li>
          <li>Handheld Website CSV - Sheet1.csv</li>
        </ul>
      </div>

      {/* Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h3>
            <p className="text-sm text-red-700 mt-1">
              This will permanently delete all existing items, consoles, console types, and categories, 
              then replace them with data from your CSV files. Make sure you have a backup if needed.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={confirmReplace}
            onChange={(e) => setConfirmReplace(e.target.checked)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">
            I understand this will permanently delete all existing data and replace it with CSV data
          </span>
        </label>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={handleReplaceData}
          disabled={!confirmReplace || isReplacing}
          className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isReplacing ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Replacing Data...
            </>
          ) : (
            <>
              <Database className="h-5 w-5 mr-2" />
              Replace All Data
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {replaceResult && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Replacement Results</h3>
          
          <div className="flex items-center mb-4">
            {replaceResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className={`text-sm font-medium ${replaceResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {replaceResult.message}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Items Imported</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{replaceResult.imported}</p>
          </div>

          {/* Errors */}
          {replaceResult.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                {replaceResult.errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-700 mb-1">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">What this does:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Clears all existing items, consoles, console types, and categories</p>
          <p>• Reads data from your 3 CSV files in the project root</p>
          <p>• Creates appropriate console types (PlayStation, Xbox, Nintendo, Handheld, etc.)</p>
          <p>• Creates consoles based on item names</p>
          <p>• Creates categories (Consoles, Controllers, Accessories)</p>
          <p>• Creates items with different price points and conditions</p>
          <p>• Handles "Contact" and "N/A" prices appropriately</p>
        </div>
      </div>
    </div>
  )
}
