'use client'

import { useState, useEffect, useRef } from 'react'
import { Edit, Trash2, Search, Filter, SortAsc, SortDesc, X, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import ItemForm from './ItemForm'
import ConfirmModal from './ConfirmModal'
import AdminPagination from './AdminPagination'

interface Category {
  id: number
  name: string
}

interface Console {
  id: number
  name: string
  consoleTypeId: number
}

interface ConsoleType {
  id: number
  name: string
  consoles: Console[]
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
  category: Category
  consoleId: number
  console?: Console
  createdAt: string
  updatedAt: string
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

interface ItemTableProps {
  initialItems: Item[]
  categories: Category[]
  consoleTypes: ConsoleType[]
}

// Helper function to format dates consistently (avoiding hydration errors)
function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

export default function ItemTable({ initialItems, categories, consoleTypes }: ItemTableProps) {
  const [items, setItems] = useState(initialItems)
  const [filteredItems, setFilteredItems] = useState(initialItems)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedConsoleType, setSelectedConsoleType] = useState('')
  const [selectedConsole, setSelectedConsole] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemFormData | null>(null)
  const [deleteItem, setDeleteItem] = useState<Item | null>(null)
  const [bulkDeleteItems, setBulkDeleteItems] = useState<Item[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)

  // Ref to scroll to the form when opening create/edit
  const formContainerRef = useRef<HTMLDivElement | null>(null)

  // Filter and sort items
  const filterAndSortItems = () => {
    let filtered = items

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoryId === parseInt(selectedCategory))
    }

    // Console type filter
    if (selectedConsoleType) {
      filtered = filtered.filter(item => 
        item.console?.consoleTypeId === parseInt(selectedConsoleType)
      )
    }

    // Console filter
    if (selectedConsole) {
      filtered = filtered.filter(item => item.consoleId === parseInt(selectedConsole))
    }

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'category':
          aValue = a.category.name.toLowerCase()
          bValue = b.category.name.toLowerCase()
          break
        case 'created':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredItems(filtered)
    // Don't reset page here - only reset when filters actually change
  }

  // Initialize filtered items on mount
  useEffect(() => {
    setFilteredItems(initialItems)
  }, [initialItems])

  // Trigger filtering when items change
  useEffect(() => {
    if (items.length > 0) {
      filterAndSortItems()
    }
  }, [items, searchTerm, selectedCategory, selectedConsoleType, selectedConsole, sortBy, sortOrder])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when search changes
  }

  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleConsoleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedConsoleType(e.target.value)
    setSelectedConsole('') // Reset console when console type changes
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleConsoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedConsole(e.target.value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    // Don't reset page when sorting - user might want to stay on current page
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedConsoleType('')
    setSelectedConsole('')
    setSortBy('name')
    setSortOrder('asc')
    setCurrentPage(1)
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredItems.slice(startIndex, endIndex)

  // Adjust page if current page is out of bounds (e.g., after deletion)
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of table when page changes
    const tableElement = document.getElementById('items-table')
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleEdit = (item: Item) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      acceptablePrice: item.acceptablePrice,
      goodPrice: item.goodPrice,
      consoleOnlyPrice: item.consoleOnlyPrice,
      consoleWithController: item.consoleWithController,
      completeConsolePrice: item.completeConsolePrice,
      imageUrl: item.imageUrl,
      categoryId: item.categoryId,
      consoleId: item.consoleId
    })
    setShowForm(true)
  }

  // When the form opens, scroll it into view smoothly
  useEffect(() => {
    if (showForm && formContainerRef.current) {
      // Defer to next tick to ensure the form is mounted
      setTimeout(() => {
        formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }, [showForm])

  const handleDelete = async (item: Item) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setItems(items.filter(i => i.id !== item.id))
        setSelectedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(item.id)
          return newSet
        })
        toast.success('Item deleted successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete item')
      }
    } catch (error) {
      toast.error('An error occurred while deleting the item')
    } finally {
      setLoading(false)
      setDeleteItem(null)
    }
  }

  const handleBulkDelete = async () => {
    if (bulkDeleteItems.length === 0) return

    setLoading(true)
    try {
      // Delete all selected items
      const deletePromises = bulkDeleteItems.map(item =>
        fetch(`/api/items/${item.id}`, { method: 'DELETE' })
      )

      const results = await Promise.allSettled(deletePromises)
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.ok).length
      const failed = results.length - successful

      // Remove deleted items from state
      const deletedIds = new Set(bulkDeleteItems.map(item => item.id))
      setItems(items.filter(i => !deletedIds.has(i.id)))
      setSelectedItems(new Set())

      if (successful > 0) {
        toast.success(`Successfully deleted ${successful} item(s)${failed > 0 ? ` (${failed} failed)` : ''}`)
      } else {
        toast.error('Failed to delete items')
      }
    } catch (error) {
      toast.error('An error occurred while deleting items')
    } finally {
      setLoading(false)
      setBulkDeleteItems([])
    }
  }

  const handleSelectItem = (itemId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === currentItems.length) {
      // Deselect all
      setSelectedItems(new Set())
    } else {
      // Select all on current page
      setSelectedItems(new Set(currentItems.map(item => item.id)))
    }
  }

  const handleSelectAllFiltered = () => {
    if (selectedItems.size === filteredItems.length) {
      // Deselect all
      setSelectedItems(new Set())
    } else {
      // Select all filtered items
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    }
  }

  const handleFormSubmit = (item: ItemFormData) => {
    if (editingItem) {
      // Update existing item
      setItems(items.map(i => i.id === item.id ? {
        ...i,
        ...item,
        category: i.category,
        console: i.console
      } : i))
      toast.success('Item updated successfully')
    } else {
      // Add new item - convert to full Item type
      const newItem: Item = {
        ...item,
        category: categories.find(c => c.id === item.categoryId)!,
        console: consoleTypes
          .flatMap(ct => ct.consoles)
          .find(c => c.id === item.consoleId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setItems([...items, newItem])
      toast.success('Item created successfully')
    }
    setShowForm(false)
    setEditingItem(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600">Manage your gaming items and prices</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          Add Item
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters & Search</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {showFilters ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search items by name or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        {/* Collapsible Filters */}
        {showFilters && (
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={selectedCategory}
                  onChange={handleCategoryFilter}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-black text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Console Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={selectedConsoleType}
                  onChange={handleConsoleTypeFilter}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-black text-sm"
                >
                  <option value="">All Console Types</option>
                  {consoleTypes.map((consoleType) => (
                    <option key={consoleType.id} value={consoleType.id}>
                      {consoleType.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Console Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={selectedConsole}
                  onChange={handleConsoleFilter}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-black text-sm"
                  disabled={!selectedConsoleType}
                >
                  <option value="">All Consoles</option>
                  {selectedConsoleType && consoleTypes
                    .find(ct => ct.id === parseInt(selectedConsoleType))
                    ?.consoles.map((console) => (
                      <option key={console.id} value={console.id}>
                        {console.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex space-x-2">
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'price', label: 'Price' },
                  { key: 'category', label: 'Category' },
                  { key: 'created', label: 'Date Created' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleSort(option.key)}
                    className={`flex items-center px-3 py-1 text-sm rounded-lg transition-colors ${
                      sortBy === option.key
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.key && (
                      sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4 ml-1" />
                      ) : (
                        <SortDesc className="h-4 w-4 ml-1" />
                      )
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar - Sticky at top when items selected */}
      {selectedItems.size > 0 && (
        <div className="sticky top-0 z-10 bg-blue-600 border border-blue-700 rounded-lg p-4 mb-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-white">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedItems(new Set())}
              className="text-sm text-blue-100 hover:text-white underline"
            >
              Clear selection
            </button>
          </div>
          <button
            onClick={() => {
              const itemsToDelete = filteredItems.filter(item => selectedItems.has(item.id))
              setBulkDeleteItems(itemsToDelete)
            }}
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-md"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Delete Selected ({selectedItems.size})
          </button>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden" id="items-table">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={currentItems.length > 0 && selectedItems.size === currentItems.length && currentItems.every(item => selectedItems.has(item.id))}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="Select all on this page"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Console
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${selectedItems.has(item.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.imageUrl && (
                        <img
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                          src={item.imageUrl}
                          alt={item.name}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.console?.name || 'N/A'}
                    </div>
                    {item.console && (
                      <div className="text-xs text-gray-500">
                        {consoleTypes.find(ct => ct.id === item.console?.consoleTypeId)?.name || 'Unknown Type'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {currentItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">
              {searchTerm || selectedCategory || selectedConsoleType || selectedConsole 
                ? 'No items match your filters' 
                : 'No items found'}
            </p>
            {(searchTerm || selectedCategory || selectedConsoleType || selectedConsole) && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            {/* Pagination controls */}
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredItems.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* Forms and Modals */}
      <div ref={formContainerRef}>
        {showForm && (
          <ItemForm
            item={editingItem}
            categories={categories}
            consoleTypes={consoleTypes}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingItem(null)
            }}
          />
        )}
      </div>

      {deleteItem && (
        <ConfirmModal
          title="Delete Item"
          message={`Are you sure you want to delete "${deleteItem.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deleteItem)}
          onCancel={() => setDeleteItem(null)}
          loading={loading}
        />
      )}

      {bulkDeleteItems.length > 0 && (
        <ConfirmModal
          title="Delete Multiple Items"
          message={`Are you sure you want to delete ${bulkDeleteItems.length} item${bulkDeleteItems.length !== 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteItems([])}
          loading={loading}
        />
      )}
    </div>
  )
}
