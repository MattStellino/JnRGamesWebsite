'use client'

import { useState } from 'react'
import { Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DeleteWiiConsoleButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the console named "Wii"? This action cannot be undone!')) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/delete-console?name=Wii', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        toast.success(`Successfully deleted console "${data.deletedConsole.name}"`)
      } else {
        toast.error(data.message || data.error || 'Failed to delete console')
        setResult(data)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete console')
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
          <h2 className="text-lg font-semibold text-gray-900">Delete "Wii" Console</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Remove Console Named "Wii"</h3>
          <p className="text-sm text-gray-600 mb-4">
            This will delete the console named exactly "Wii" if it exists. 
            If the console has items associated with it, those items must be deleted or reassigned first.
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
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete "Wii" Console
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
                  {result.success ? 'Console Deleted Successfully' : 'Deletion Failed'}
                </h4>
                {result.success && result.deletedConsole && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p>Deleted: "{result.deletedConsole.name}" (ID: {result.deletedConsole.id})</p>
                    <p className="text-xs text-gray-600">Console Type: {result.deletedConsole.consoleType}</p>
                  </div>
                )}
                {result.error && (
                  <p className="mt-2 text-sm text-red-700">{result.message || result.error}</p>
                )}
                {result.items && result.items.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-700">Items that need to be handled first:</p>
                    <ul className="text-xs text-gray-600 list-disc list-inside mt-1">
                      {result.items.map((item: any) => (
                        <li key={item.id}>"{item.name}" ({item.category})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

