'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ItemCard from '@/components/ItemCard'
import CategoryFilter from '@/components/CategoryFilter'

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  const handleSearch = async (query: string, categoryId?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append('search', query)
      if (categoryId) params.append('categoryId', categoryId)

      const response = await fetch(`/api/items?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`)
      }
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }
      const data = await response.json()
      // API returns { items, pagination }, so extract items array
      setItems(data.items || [])
    } catch (error) {
      console.error('Search failed:', error)
      setItems([]) // Clear items on error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchTerm)
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
  }

  // Initial search if there's a query parameter
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      handleSearch(query)
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Items</h1>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for items..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <CategoryFilter 
          categories={categories} 
          onCategoryChange={(categoryId) => handleSearch(searchTerm, categoryId)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Searching...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No items found matching your search.' : 'Enter a search term to find items.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item: any) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
