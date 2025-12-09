import React, { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { sanitizeInput } from '@/lib/security'
import ItemCard from '@/components/ItemCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import ConsoleFilter from '@/components/ConsoleFilter'
import Pagination from '@/components/Pagination'
import StructuredData from '@/components/StructuredData'

export const dynamic = 'force-dynamic'

async function getItems(search?: string, category?: string, consoleType?: string, console?: string, page?: string) {
  try {
    // Verify database connection
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    const pageNum = parseInt(page || '1')
    const limit = 12
    const skip = (pageNum - 1) * limit

    // Sanitize search input
    const sanitizedSearch = search ? sanitizeInput(search) : null

    const where: any = {}

    // Handle category name filtering
    if (category) {
      if (category === 'consoles') {
        where.category = { name: 'Consoles' }
      } else if (category === 'accessories') {
        where.category = { name: 'Accessories' }
      } else if (category === 'controllers') {
        where.category = { name: 'Controllers' }
      } else if (category === 'games') {
        where.category = { name: 'Games' }
      } else {
        where.category = {
          name: { contains: category, mode: 'insensitive' }
        }
      }
    }

    // Handle console type and specific console filtering
    // If a specific console is selected, use consoleId (more specific)
    // Otherwise, if consoleType is selected, filter by consoleType
    if (console && console !== 'all') {
      // Specific console selected - use consoleId
      where.consoleId = parseInt(console)
    } else if (consoleType) {
      // Only consoleType selected - filter by consoleType
      const consoleTypeId = parseInt(consoleType)
      if (!isNaN(consoleTypeId)) {
        where.console = {
          consoleType: { id: consoleTypeId }
        }
      } else {
        where.console = {
          consoleType: {
            name: { contains: consoleType, mode: 'insensitive' }
          }
        }
      }
    } else if (console === 'all') {
      // Show all consoles (only if no consoleType filter)
      where.console = { isNot: null }
    }

    // Handle search
    if (sanitizedSearch) {
      where.OR = [
        { name: { contains: sanitizedSearch, mode: 'insensitive' } },
        { description: { contains: sanitizedSearch, mode: 'insensitive' } },
        { 
          console: {
            name: { contains: sanitizedSearch, mode: 'insensitive' }
          }
        },
        { 
          console: {
            consoleType: {
              name: { contains: sanitizedSearch, mode: 'insensitive' }
            }
          }
        },
        { 
          category: {
            name: { contains: sanitizedSearch, mode: 'insensitive' }
          }
        }
      ]
    }

    // Get total count for pagination
    const totalItems = await prisma.item.count({ where })

    // Get paginated items
    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }, // Show newest items first
        { name: 'asc' }, // Then sort alphabetically for items created at the same time
      ],
      skip,
      take: limit,
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    return {
      items,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      }
    }
  } catch {
    return {
      items: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 12,
        hasNextPage: false,
        hasPrevPage: false,
      }
    }
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return categories
  } catch {
    return []
  }
}

async function getConsoleTypes() {
  try {
    const consoleTypes = await prisma.consoleType.findMany({
      include: {
        consoles: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })
    return consoleTypes
  } catch {
    return []
  }
}

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; consoleType?: string; console?: string; page?: string }>
}) {
  try {
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
  } catch {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Items</h1>
            <p className="text-gray-600 mb-6">
              We're having trouble loading items. Please try again later.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }
}