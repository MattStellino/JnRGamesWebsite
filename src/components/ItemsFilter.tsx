'use client'

import { Suspense } from 'react'
import { FilterProvider } from '@/contexts/FilterContext'
import FilterBar from './FilterBar'
import { ConsoleType, Category } from '@/types'

interface InitialFilters {
  search?: string
  category?: string
  consoleType?: string
  console?: string
}

interface ItemsFilterProps {
  categories?: Category[]
  consoleTypes?: ConsoleType[]
  initialFilters?: InitialFilters
}

// Inner component that uses useSearchParams (needs Suspense boundary)
function ItemsFilterInner({ categories, consoleTypes, initialFilters }: ItemsFilterProps) {
  return (
    <FilterProvider initialFilters={initialFilters}>
      <FilterBar categories={categories} consoleTypes={consoleTypes} />
    </FilterProvider>
  )
}

// Outer component with Suspense boundary
export default function ItemsFilter({ categories = [], consoleTypes = [], initialFilters }: ItemsFilterProps) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-16 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="flex-1 h-16 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    }>
      <ItemsFilterInner categories={categories} consoleTypes={consoleTypes} initialFilters={initialFilters} />
    </Suspense>
  )
}
