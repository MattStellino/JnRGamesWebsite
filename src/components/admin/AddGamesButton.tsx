'use client'

import { useState } from 'react'
import { Gamepad2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddGamesButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAddGames = async () => {
    if (!confirm('Add 23 games (Nintendo 3DS, Nintendo DS, and GameCube)? This will add games that don\'t already exist.')) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/add-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        toast.success(`Added ${data.summary.created} games!`)
      } else {
        toast.error(data.message || 'Failed to add games')
        setResult(data)
      }
    } catch (error) {
      console.error('Add games error:', error)
      toast.error('Failed to add games')
      setResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Gamepad2 className="h-5 w-5 text-green-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Add Games</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Add Nintendo 3DS, DS, and GameCube Games</h3>
          <p className="text-sm text-gray-600 mb-4">
            This will add 23 games:
            <ul className="list-disc list-inside mt-2 text-xs text-gray-500">
              <li>8 Nintendo 3DS games (Zelda, Pokemon)</li>
              <li>7 Nintendo DS games (Pokemon series)</li>
              <li>8 GameCube games (Zelda, Mario, Smash Bros, etc.)</li>
            </ul>
            Games that already exist will be skipped.
          </p>
        </div>

        <button
          onClick={handleAddGames}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding Games...
            </>
          ) : (
            <>
              <Gamepad2 className="h-4 w-4 mr-2" />
              Add Games
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
                  {result.success ? 'Games Added Successfully' : 'Failed to Add Games'}
                </h4>
                {result.summary && (
                  <div className="mt-2 text-sm text-gray-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Games created: {result.summary.created}</li>
                      <li>Games skipped (already exist): {result.summary.skipped}</li>
                      {result.summary.errors > 0 && (
                        <li className="text-red-600">Errors: {result.summary.errors}</li>
                      )}
                    </ul>
                    {result.createdGames && result.createdGames.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-xs">Created games:</p>
                        <p className="text-xs text-gray-600">{result.createdGames.join(', ')}</p>
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

