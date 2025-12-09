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
    goodPrice: '',
    acceptablePrice: '',
    consoleOnlyPrice: '',
    consoleWithController: '',
    completeConsolePrice: '',
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
        goodPrice: item.goodPrice?.toString() || '',
        acceptablePrice: item.acceptablePrice?.toString() || '',
        consoleOnlyPrice: item.consoleOnlyPrice?.toString() || '',
        consoleWithController: item.consoleWithController?.toString() || '',
        completeConsolePrice: item.completeConsolePrice?.toString() || '',
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
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price) || 0,
          goodPrice: formData.goodPrice ? parseFloat(formData.goodPrice) : null,
          acceptablePrice: formData.acceptablePrice ? parseFloat(formData.acceptablePrice) : null,
          consoleOnlyPrice: formData.consoleOnlyPrice ? parseFloat(formData.consoleOnlyPrice) : null,
          consoleWithController: formData.consoleWithController ? parseFloat(formData.consoleWithController) : null,
          completeConsolePrice: formData.completeConsolePrice ? parseFloat(formData.completeConsolePrice) : null,
          imageUrl: formData.imageUrl || null,
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

          {/* Conditional Price Fields Based on Category */}
          {formData.categoryId && (() => {
            const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId)
            const categoryName = selectedCategory?.name || ''
            
            // Games - Show Complete in Box, Box and Game, Disc Only
            if (categoryName === 'Games') {
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Complete in Box Price *
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
                    <p className="text-xs text-gray-500 mt-1">Game with box, manual, and inserts</p>
                  </div>
                  <div>
                    <label htmlFor="goodPrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Box and Game Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="goodPrice"
                      value={formData.goodPrice}
                      onChange={(e) => setFormData({ ...formData, goodPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Optional"
                    />
                    <p className="text-xs text-gray-500 mt-1">Game with box, no manual</p>
                  </div>
                  <div>
                    <label htmlFor="acceptablePrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Disc Only Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="acceptablePrice"
                      value={formData.acceptablePrice}
                      onChange={(e) => setFormData({ ...formData, acceptablePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Optional"
                    />
                    <p className="text-xs text-gray-500 mt-1">Just the game disc/cartridge</p>
                  </div>
                </div>
              )
            }
            
            // Consoles - Show Complete Console, Console with Controller, Console Only
            if (categoryName === 'Consoles') {
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <label htmlFor="completeConsolePrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Complete Console Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="completeConsolePrice"
                      value={formData.completeConsolePrice || formData.price}
                      onChange={(e) => setFormData({ ...formData, completeConsolePrice: e.target.value, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Console with all cables, controllers, box</p>
                  </div>
                  <div>
                    <label htmlFor="consoleWithController" className="block text-sm font-medium text-gray-700 mb-2">
                      Console with Controller Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="consoleWithController"
                      value={formData.consoleWithController}
                      onChange={(e) => setFormData({ ...formData, consoleWithController: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Optional"
                    />
                    <p className="text-xs text-gray-500 mt-1">Console with controller, no box</p>
                  </div>
                  <div>
                    <label htmlFor="consoleOnlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Console Only Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="consoleOnlyPrice"
                      value={formData.consoleOnlyPrice}
                      onChange={(e) => setFormData({ ...formData, consoleOnlyPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Optional"
                    />
                    <p className="text-xs text-gray-500 mt-1">Just the console unit</p>
                  </div>
                </div>
              )
            }
            
            // Controllers, Accessories - Show Good Condition, Acceptable Condition
            if (['Controllers', 'Accessories'].includes(categoryName)) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Good Condition Price *
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
                    <p className="text-xs text-gray-500 mt-1">Excellent working condition</p>
                  </div>
                  <div>
                    <label htmlFor="acceptablePrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Acceptable Condition Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="acceptablePrice"
                      value={formData.acceptablePrice}
                      onChange={(e) => setFormData({ ...formData, acceptablePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Optional"
                    />
                    <p className="text-xs text-gray-500 mt-1">Working but with wear</p>
                  </div>
                </div>
              )
            }
            
            return null
          })()}

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
