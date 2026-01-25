'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useFilters, UseFiltersReturn, FilterState } from '@/hooks/useFilters'

const FilterContext = createContext<UseFiltersReturn | null>(null)

interface FilterProviderProps {
  children: ReactNode
  initialFilters?: Partial<FilterState>
}

export function FilterProvider({ children, initialFilters }: FilterProviderProps) {
  const filters = useFilters(initialFilters)

  return (
    <FilterContext.Provider value={filters}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilterContext(): UseFiltersReturn {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider')
  }
  return context
}
