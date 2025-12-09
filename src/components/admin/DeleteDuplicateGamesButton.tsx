'use client'

import { useState } from 'react'
import { Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DeleteDuplicateGamesButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete duplicate games with "Complete in Box"? This will remove games that only show "Complete in Box" when there is also a "Game Only" version. This action cannot be undone!')) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/delete-duplicate-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        toast.success(`Deleted ${data.summary.deleted} duplicate games!`)
      } else {
        toast.error(data.message || 'Failed to delete duplicates')
        setResult(data)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete duplicate games')
      setResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Trash2 className="h-5 w-5 text-red-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Delete Duplicate Games</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Remove "Complete in Box" Duplicates</h3>
          <p className="text-sm text-gray-600 mb-4">
            This will find and delete games that only show "Complete in Box" pricing when there is also a "Game Only" version of the same game. 
            Only games with duplicate entries (same name and console) will be affected.
          </p>
          <p className="text-xs text-red-600 font-medium">
            ⚠️ This action cannot be undone!
          </p>
        </div>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Deleting Duplicates...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Duplicate Games
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
                  {result.success ? 'Deletion Successful' : 'Deletion Failed'}
                </h4>
                {result.summary && (
                  <div className="mt-2 text-sm text-gray-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Duplicate sets found: {result.summary.totalDuplicates}</li>
                      <li>Games deleted: {result.summary.deleted}</li>
                      {result.summary.failed > 0 && (
                        <li className="text-red-600">Failed: {result.summary.failed}</li>
                      )}
                    </ul>
                    {result.deletedItems && result.deletedItems.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Deleted games:</p>
                        <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                          {result.deletedItems.map((item: any) => (
                            <div key={item.id}>
                              - {item.name} ({item.console})
                            </div>
                          ))}
                        </div>
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

