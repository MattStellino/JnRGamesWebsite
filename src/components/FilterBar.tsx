'use client'

import { useState, useEffect, useCallback } from 'react'
import { useFilterContext } from '@/contexts/FilterContext'
import { ConsoleType, Console, Category } from '@/types'
import ActiveFilters from './ActiveFilters'

interface FilterBarProps {
  categories?: Category[]
  consoleTypes?: ConsoleType[]
}

// Map category names to URL-friendly values
const categoryNameToUrl: Record<string, string> = {
  'Consoles': 'consoles',
  'Accessories': 'accessories',
  'Controllers': 'controllers',
  'Games': 'games',
}

// Map URL values back to category names
const urlToCategoryName: Record<string, string> = {
  'consoles': 'Consoles',
  'accessories': 'Accessories',
  'controllers': 'Controllers',
  'games': 'Games',
}

export default function FilterBar({ categories = [], consoleTypes = [] }: FilterBarProps) {
  const {
    filters,
    setSearch,
    setCategory,
    setConsoleType,
    setConsole,
    clearSearch,
    clearCategory,
    clearConsoleType,
    clearConsole,
    clearAllFilters,
    applyFilters,
    hasActiveFilters,
  } = useFilterContext()

  // Local state for data
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [localConsoleTypes, setLocalConsoleTypes] = useState<ConsoleType[]>(consoleTypes)
  const [consoles, setConsoles] = useState<Console[]>([])
  const [loadingConsoles, setLoadingConsoles] = useState(false)

  // Fetch categories if not provided
  useEffect(() => {
    if (categories.length === 0) {
      fetch('/api/categories')
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          const contentType = res.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON')
          }
          return res.json()
        })
        .then(data => {
          if (Array.isArray(data)) {
            setLocalCategories(data)
          }
        })
        .catch(error => console.error('Error fetching categories:', error))
    } else {
      setLocalCategories(categories)
    }
  }, [categories])

  // Fetch console types if not provided
  useEffect(() => {
    if (consoleTypes.length === 0) {
      fetch('/api/console-types')
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          const contentType = res.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON')
          }
          return res.json()
        })
        .then(data => {
          if (Array.isArray(data)) {
            setLocalConsoleTypes(data)
          }
        })
        .catch(error => console.error('Error fetching console types:', error))
    } else {
      setLocalConsoleTypes(consoleTypes)
    }
  }, [consoleTypes])

  // Fetch consoles when console type changes
  const fetchConsoles = useCallback(async (consoleTypeId: string) => {
    if (!consoleTypeId) {
      setConsoles([])
      return
    }

    setLoadingConsoles(true)
    try {
      const res = await fetch(`/api/console-types/${consoleTypeId}/consoles`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setConsoles(data)
      }
    } catch (error) {
      console.error('Error fetching consoles:', error)
      setConsoles([])
    } finally {
      setLoadingConsoles(false)
    }
  }, [])

  // Load consoles when filter state has a console type
  useEffect(() => {
    if (filters.consoleType) {
      fetchConsoles(filters.consoleType)
    } else {
      setConsoles([])
    }
  }, [filters.consoleType, fetchConsoles])

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'all') {
      const newFilters = { ...filters, category: '' }
      setCategory('')
      applyFilters(newFilters)
    } else {
      const category = localCategories.find(c => c.id.toString() === categoryId)
      if (category) {
        const urlValue = categoryNameToUrl[category.name] || category.name.toLowerCase()
        const newFilters = { ...filters, category: urlValue }
        setCategory(urlValue)
        applyFilters(newFilters)
      }
    }
  }

  // Handle console type change
  const handleConsoleTypeChange = (consoleTypeId: string) => {
    setConsoleType(consoleTypeId)
    // Apply filter immediately with cleared specific console
    applyFilters({ ...filters, consoleType: consoleTypeId, console: '' })
  }

  // Handle specific console change
  const handleConsoleChange = (consoleId: string) => {
    setConsole(consoleId)
    applyFilters({ ...filters, console: consoleId })
  }

  // Get current category value for display
  const getCurrentCategoryValue = (): string => {
    if (!filters.category) return 'all'
    const categoryName = urlToCategoryName[filters.category]
    if (categoryName) {
      const category = localCategories.find(c => c.name === categoryName)
      return category ? category.id.toString() : 'all'
    }
    return 'all'
  }

  return (
    <div className="space-y-4">
      {/* Search and Category Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex-1">
          <div className="relative">
            <select
              value={getCurrentCategoryValue()}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {localCategories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Dropdown arrow */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Console Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Console Type Filter */}
        <div className="flex-1">
          <label htmlFor="consoleType" className="block text-sm font-medium text-gray-700 mb-1">
            Console Type
          </label>
          <select
            id="consoleType"
            value={filters.consoleType}
            onChange={(e) => handleConsoleTypeChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white transition-colors cursor-pointer"
          >
            <option value="">All Console Types</option>
            {localConsoleTypes.map((consoleType) => (
              <option key={consoleType.id} value={consoleType.id.toString()}>
                {consoleType.name}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Console Filter */}
        <div className="flex-1">
          <label htmlFor="console" className="block text-sm font-medium text-gray-700 mb-1">
            Specific Console
          </label>
          <select
            id="console"
            value={filters.console}
            onChange={(e) => handleConsoleChange(e.target.value)}
            disabled={!filters.consoleType}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white transition-colors cursor-pointer"
          >
            <option value="">
              {!filters.consoleType
                ? 'Select a console type first'
                : loadingConsoles
                  ? 'Loading consoles...'
                  : 'All Consoles'}
            </option>
            {consoles
              .filter((console) => console.name !== 'Wii')
              .map((console) => (
                <option key={console.id} value={console.id.toString()}>
                  {console.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          categories={localCategories}
          consoleTypes={localConsoleTypes}
          consoles={consoles}
          onRemoveSearch={clearSearch}
          onRemoveCategory={clearCategory}
          onRemoveConsoleType={clearConsoleType}
          onRemoveConsole={clearConsole}
          onClearAll={clearAllFilters}
        />
      )}
    </div>
  )
}
