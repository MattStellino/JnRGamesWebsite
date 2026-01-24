'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useFilters, UseFiltersReturn } from '@/hooks/useFilters'

const FilterContext = createContext<UseFiltersReturn | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const filters = useFilters()

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
