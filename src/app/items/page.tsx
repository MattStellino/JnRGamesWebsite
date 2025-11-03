import React, { Suspense } from 'react'
import ItemCard from '@/components/ItemCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import ConsoleFilter from '@/components/ConsoleFilter'
import Pagination from '@/components/Pagination'
import StructuredData from '@/components/StructuredData'

export const dynamic = 'force-dynamic'

async function getItems(search?: string, category?: string, consoleType?: string, console?: string, page?: string) {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (category) params.append('category', category)
  if (consoleType) params.append('consoleType', consoleType)
  if (console) params.append('console', console)
  if (page) params.append('page', page)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/items?${params}`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch items')
  }
  
  return response.json()
}

async function getCategories() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/categories`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  
  return response.json()
}

async function getConsoleTypes() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/console-types`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch console types')
  }
  
  return response.json()
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; consoleType?: string; console?: string; page?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const [itemsData, categories, consoleTypes] = await Promise.all([
    getItems(resolvedSearchParams.search, resolvedSearchParams.category, resolvedSearchParams.consoleType, resolvedSearchParams.console, resolvedSearchParams.page),
    getCategories(),
    getConsoleTypes()
  ])

  const { items, pagination } = itemsData

  return (
    <>
      <StructuredData type="ItemList" data={items} />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-50 via-white to-green-50" aria-labelledby="items-heading">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 id="items-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                What We <span className="text-green-600">Buy</span>
              </h1>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <SearchBar />
                  <CategoryFilter categories={categories} />
                </div>
                <ConsoleFilter consoleTypes={consoleTypes} />
              </div>
            </div>
          </div>
        </section>

        {/* Items Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Suspense fallback={
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-600 mt-4">Loading items...</p>
            </div>
          }>
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {items.map((item: any) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="mt-12">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    hasNextPage={pagination.hasNextPage}
                    hasPrevPage={pagination.hasPrevPage}
                  />
                </div>
              </>
            )}
          </Suspense>
        </div>
      </div>
    </>
  )
}