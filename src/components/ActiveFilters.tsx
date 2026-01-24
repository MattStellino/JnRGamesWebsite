'use client'

import FilterTag from './FilterTag'
import { FilterState } from '@/hooks/useFilters'
import { Category, ConsoleType, Console } from '@/types'

// Map URL values back to category names
const urlToCategoryName: Record<string, string> = {
  'consoles': 'Consoles',
  'accessories': 'Accessories',
  'controllers': 'Controllers',
  'games': 'Games',
}

interface ActiveFiltersProps {
  filters: FilterState
  categories: Category[]
  consoleTypes: ConsoleType[]
  consoles: Console[]
  onRemoveSearch: () => void
  onRemoveCategory: () => void
  onRemoveConsoleType: () => void
  onRemoveConsole: () => void
  onClearAll: () => void
}

export default function ActiveFilters({
  filters,
  categories,
  consoleTypes,
  consoles,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveConsoleType,
  onRemoveConsole,
  onClearAll,
}: ActiveFiltersProps) {
  // Get human-readable label for category
  const getCategoryLabel = (): string => {
    if (!filters.category) return ''
    const categoryName = urlToCategoryName[filters.category]
    if (categoryName) return categoryName
    // Try to find by matching category name
    const category = categories.find(
      c => c.name.toLowerCase() === filters.category.toLowerCase()
    )
    return category?.name || filters.category
  }

  // Get human-readable label for console type
  const getConsoleTypeLabel = (): string => {
    if (!filters.consoleType) return ''
    const consoleType = consoleTypes.find(
      ct => ct.id.toString() === filters.consoleType
    )
    return consoleType?.name || filters.consoleType
  }

  // Get human-readable label for console
  const getConsoleLabel = (): string => {
    if (!filters.console) return ''
    const console = consoles.find(c => c.id.toString() === filters.console)
    return console?.name || filters.console
  }

  // Count active filters
  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.consoleType,
    filters.console,
  ].filter(Boolean).length

  // Don't render if no filters active
  if (activeFilterCount === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Active Filters:</span>

      {filters.search && (
        <FilterTag
          type="search"
          label="Search"
          value={`"${filters.search}"`}
          onRemove={onRemoveSearch}
        />
      )}

      {filters.category && (
        <FilterTag
          type="category"
          label="Category"
          value={getCategoryLabel()}
          onRemove={onRemoveCategory}
        />
      )}

      {filters.consoleType && (
        <FilterTag
          type="consoleType"
          label="Console Type"
          value={getConsoleTypeLabel()}
          onRemove={onRemoveConsoleType}
        />
      )}

      {filters.console && (
        <FilterTag
          type="console"
          label="Console"
          value={getConsoleLabel()}
          onRemove={onRemoveConsole}
        />
      )}

      {activeFilterCount >= 2 && (
        <button
          onClick={onClearAll}
          className="ml-2 text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  )
}
