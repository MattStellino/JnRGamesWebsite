'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: number
  name: string
}

interface CategoryFilterProps {
  categories?: Category[]
  onCategoryChange?: (categoryId: string) => void
}

export default function CategoryFilter({ categories = [], onCategoryChange }: CategoryFilterProps) {
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (categories.length === 0) {
      // Fetch categories if not provided
      fetch('/api/categories')
        .then(async res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          const contentType = res.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON')
          }
          return res.json()
        })
        .then(data => {
          // Ensure data is an array
          if (Array.isArray(data)) {
            setLocalCategories(data)
          } else {
            console.error('Categories API returned non-array data:', data)
            setLocalCategories([])
          }
        })
        .catch(error => {
          console.error('Error fetching categories:', error)
          setLocalCategories([])
        })
    }
  }, [categories])

  const handleCategoryChange = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      if (categoryId === 'all') {
        params.delete('category')
      } else {
        // Map category IDs to category names for the API
        const category = localCategories.find(c => c.id.toString() === categoryId)
        if (category) {
          if (category.name === 'Consoles') {
            params.set('category', 'consoles')
          } else if (category.name === 'Accessories') {
            params.set('category', 'accessories')
          } else if (category.name === 'Handhelds') {
            params.set('category', 'handhelds')
          } else if (category.name === 'Controllers') {
            params.set('category', 'controllers')
          } else if (category.name === 'Games') {
            params.set('category', 'games')
          } else {
            params.set('category', 'games')
          }
        }
      }
      router.push(`/items?${params.toString()}`)
    }
  }

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    router.push(`/items?${params.toString()}`)
  }

  // Map URL category parameter back to category ID for display
  const urlCategory = searchParams.get('category')
  const currentCategory = urlCategory === 'consoles' 
    ? localCategories.find(c => c.name === 'Consoles')?.id.toString() || 'all'
    : urlCategory === 'accessories'
    ? localCategories.find(c => c.name === 'Accessories')?.id.toString() || 'all'
    : urlCategory === 'handhelds'
    ? localCategories.find(c => c.name === 'Handhelds')?.id.toString() || 'all'
    : urlCategory === 'controllers'
    ? localCategories.find(c => c.name === 'Controllers')?.id.toString() || 'all'
    : urlCategory === 'games'
    ? localCategories.find(c => c.name === 'Games')?.id.toString() || 'all'
    : 'all'

  return (
    <div className="flex-1">
      <div className="relative">
        <select
          value={currentCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white transition-colors appearance-none"
        >
          <option value="all">All Categories</option>
          {Array.isArray(localCategories) && localCategories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </select>
        
        {/* Clear button - X icon */}
        {currentCategory !== 'all' && (
          <button
            type="button"
            onClick={clearCategory}
            className="absolute inset-y-0 right-8 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Clear category filter"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        
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
  )
}
