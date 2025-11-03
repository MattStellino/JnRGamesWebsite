'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Category {
  id: number
  name: string
}

interface Console {
  id: number
  name: string
  consoleType?: {
    id: number
    name: string
  }
}

interface ConsoleType {
  id: number
  name: string
  consoles?: Console[]
}

interface Item {
  id: number
  name: string
  description?: string | null
  price: number
  acceptablePrice?: number | null
  goodPrice?: number | null
  consoleOnlyPrice?: number | null
  consoleWithController?: number | null
  completeConsolePrice?: number | null
  imageUrl?: string | null
  categoryId: number
  consoleId: number
  category: Category
  console?: Console
}

interface ItemFormData {
  id: number
  name: string
  description?: string | null
  price: number
  acceptablePrice?: number | null
  goodPrice?: number | null
  consoleOnlyPrice?: number | null
  consoleWithController?: number | null
  completeConsolePrice?: number | null
  imageUrl?: string | null
  categoryId: number
  consoleId: number
}

interface ItemFormProps {
  item?: ItemFormData | null
  categories: Category[]
  consoleTypes: ConsoleType[]
  onSubmit: (item: ItemFormData) => void
  onCancel: () => void
}

export default function ItemForm({ item, categories, consoleTypes, onSubmit, onCancel }: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    consoleId: '',
  })
  const [selectedConsoleType, setSelectedConsoleType] = useState<string>('')
  const [availableConsoles, setAvailableConsoles] = useState<Console[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        imageUrl: item.imageUrl || '',
        categoryId: item.categoryId.toString(),
        consoleId: item.consoleId.toString(),
      })
      
      // Set console type if item has a console
      const consoleType = consoleTypes.find(ct => 
        ct.consoles?.some(c => c.id === item.consoleId)
      )
      if (consoleType) {
        setSelectedConsoleType(consoleType.id.toString())
        setAvailableConsoles(consoleType.consoles || [])
      }
    }
  }, [item, consoleTypes])

  const handleConsoleTypeChange = async (consoleTypeId: string) => {
    try {
      setSelectedConsoleType(consoleTypeId)
      setFormData({ ...formData, consoleId: '' }) // Reset console selection
      
      if (consoleTypeId) {
        // First try to get from pre-loaded data
        const selectedType = consoleTypes.find(ct => ct.id.toString() === consoleTypeId)
        if (selectedType && selectedType.consoles && selectedType.consoles.length > 0) {
          setAvailableConsoles(selectedType.consoles)
        } else {
          // If no pre-loaded data, fetch from API
          try {
            const response = await fetch(`/api/console-types/${consoleTypeId}/consoles`)
            if (response.ok) {
              const consoles = await response.json()
              setAvailableConsoles(consoles)
            } else {
              console.error('Failed to fetch consoles:', response.statusText)
              setAvailableConsoles([])
            }
          } catch (fetchError) {
            console.error('Network error fetching consoles:', fetchError)
            setAvailableConsoles([])
          }
        }
      } else {
        setAvailableConsoles([])
      }
    } catch (error) {
      console.error('Error in handleConsoleTypeChange:', error)
      setAvailableConsoles([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = item ? `/api/items/${item.id}` : '/api/items'
      const method = item ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          categoryId: parseInt(formData.categoryId),
          consoleId: parseInt(formData.consoleId),
        }),
      })

      if (response.ok) {
        const savedItem = await response.json()
        onSubmit(savedItem)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save item')
      }
    } catch (error) {
      console.error('Error saving item:', error)
      // Error handling will be done by parent component
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter item description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="consoleType" className="block text-sm font-medium text-gray-700 mb-2">
                Console Type *
              </label>
              <select
                id="consoleType"
                value={selectedConsoleType}
                onChange={(e) => handleConsoleTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              >
                <option value="">Select a console type</option>
                {consoleTypes.map((consoleType) => (
                  <option key={consoleType.id} value={consoleType.id}>
                    {consoleType.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="consoleId" className="block text-sm font-medium text-gray-700 mb-2">
                Specific Console *
              </label>
              <select
                id="consoleId"
                value={formData.consoleId}
                onChange={(e) => setFormData({ ...formData, consoleId: e.target.value })}
                disabled={!selectedConsoleType}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">Select a console</option>
                {availableConsoles.map((console) => (
                  <option key={console.id} value={console.id}>
                    {console.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Preview
              </label>
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
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
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
