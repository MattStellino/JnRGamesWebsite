'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Gamepad2 } from 'lucide-react'

interface Console {
  id: number
  name: string
  items: any[]
}

interface ConsoleType {
  id: number
  name: string
  consoles: Console[]
}

interface ConsoleTypeManagerProps {
  consoleTypes: ConsoleType[]
}

export default function ConsoleTypeManager({ consoleTypes: initialConsoleTypes }: ConsoleTypeManagerProps) {
  const [consoleTypes, setConsoleTypes] = useState(initialConsoleTypes)
  const [showConsoleTypeForm, setShowConsoleTypeForm] = useState(false)
  const [showConsoleForm, setShowConsoleForm] = useState(false)
  const [editingConsoleType, setEditingConsoleType] = useState<ConsoleType | null>(null)
  const [editingConsole, setEditingConsole] = useState<Console | null>(null)
  const [selectedConsoleType, setSelectedConsoleType] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateConsoleType = async (name: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/console-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (response.ok) {
        const newConsoleType = await response.json()
        setConsoleTypes([...consoleTypes, { ...newConsoleType, consoles: [] }])
        setShowConsoleTypeForm(false)
      }
    } catch (error) {
      console.error('Error creating console type:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConsole = async (name: string, consoleTypeId: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/consoles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, consoleTypeId })
      })

      if (response.ok) {
        const newConsole = await response.json()
        setConsoleTypes(consoleTypes.map(ct => 
          ct.id === consoleTypeId 
            ? { ...ct, consoles: [...ct.consoles, { ...newConsole, items: [] }] }
            : ct
        ))
        setShowConsoleForm(false)
        setSelectedConsoleType(null)
      }
    } catch (error) {
      console.error('Error creating console:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConsoleType = async (id: number) => {
    if (!confirm('Are you sure? This will delete all consoles and items in this console type.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/console-types/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setConsoleTypes(consoleTypes.filter(ct => ct.id !== id))
      }
    } catch (error) {
      console.error('Error deleting console type:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConsole = async (id: number, consoleTypeId: number) => {
    if (!confirm('Are you sure? This will delete all items for this console.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/consoles/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setConsoleTypes(consoleTypes.map(ct => 
          ct.id === consoleTypeId 
            ? { ...ct, consoles: ct.consoles.filter(c => c.id !== id) }
            : ct
        ))
      }
    } catch (error) {
      console.error('Error deleting console:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Console Types */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Console Types</h2>
          <button
            onClick={() => setShowConsoleTypeForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Console Type
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {consoleTypes.map((consoleType) => (
            <div key={consoleType.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Gamepad2 className="h-5 w-5 text-gray-500 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">{consoleType.name}</h3>
                  <span className="ml-2 text-sm text-gray-500">
                    ({consoleType.consoles.length} consoles)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedConsoleType(consoleType.id)
                      setShowConsoleForm(true)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteConsoleType(consoleType.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Consoles in this type */}
              <div className="ml-8 space-y-2">
                {consoleType.consoles.map((console) => (
                  <div key={console.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">{console.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({console.items.length} items)
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteConsole(console.id, consoleType.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Console Type Form Modal */}
      {showConsoleTypeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Console Type</h3>
            </div>
            <ConsoleTypeForm
              onSubmit={handleCreateConsoleType}
              onCancel={() => setShowConsoleTypeForm(false)}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Console Form Modal */}
      {showConsoleForm && selectedConsoleType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Console</h3>
            </div>
            <ConsoleForm
              consoleTypeId={selectedConsoleType}
              onSubmit={(name) => handleCreateConsole(name, selectedConsoleType)}
              onCancel={() => {
                setShowConsoleForm(false)
                setSelectedConsoleType(null)
              }}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Console Type Form Component
function ConsoleTypeForm({ onSubmit, onCancel, loading }: {
  onSubmit: (name: string) => void
  onCancel: () => void
  loading: boolean
}) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
      setName('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Console Type Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Nintendo, PlayStation, Xbox"
          required
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Console Type'}
        </button>
      </div>
    </form>
  )
}

// Console Form Component
function ConsoleForm({ consoleTypeId, onSubmit, onCancel, loading }: {
  consoleTypeId: number
  onSubmit: (name: string) => void
  onCancel: () => void
  loading: boolean
}) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
      setName('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Console Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Nintendo Switch, PlayStation 5, Xbox Series X"
          required
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Console'}
        </button>
      </div>
    </form>
  )
}


