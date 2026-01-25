'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export interface FilterState {
  search: string
  category: string
  consoleType: string
  console: string
}

export interface UseFiltersReturn {
  filters: FilterState
  setSearch: (value: string) => void
  setCategory: (value: string) => void
  setConsoleType: (value: string) => void
  setConsole: (value: string) => void
  clearSearch: () => void
  clearCategory: () => void
  clearConsoleType: () => void
  clearConsole: () => void
  clearConsoleFilters: () => void
  clearAllFilters: () => void
  applyFilters: (newFilters?: Partial<FilterState>) => void
  hasActiveFilters: boolean
  hasConsoleFilters: boolean
}

export function useFilters(initialFilters?: Partial<FilterState>): UseFiltersReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize state from initial filters (server-provided) or URL params
  const [filters, setFilters] = useState<FilterState>(() => ({
    search: initialFilters?.search || searchParams.get('search') || '',
    category: initialFilters?.category || searchParams.get('category') || '',
    consoleType: initialFilters?.consoleType || searchParams.get('consoleType') || '',
    console: initialFilters?.console || searchParams.get('console') || '',
  }))

  // Sync state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newFilters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      consoleType: searchParams.get('consoleType') || '',
      console: searchParams.get('console') || '',
    }
    // Only update if actually changed to avoid unnecessary re-renders
    setFilters(prev => {
      if (prev.search !== newFilters.search ||
          prev.category !== newFilters.category ||
          prev.consoleType !== newFilters.consoleType ||
          prev.console !== newFilters.console) {
        return newFilters
      }
      return prev
    })
  }, [searchParams])

  // Build URL from filter state
  const buildUrl = useCallback((newFilters: FilterState): string => {
    const params = new URLSearchParams()

    if (newFilters.search) {
      params.set('search', newFilters.search)
    }
    if (newFilters.category) {
      params.set('category', newFilters.category)
    }
    if (newFilters.consoleType) {
      params.set('consoleType', newFilters.consoleType)
    }
    if (newFilters.console) {
      params.set('console', newFilters.console)
    }

    const queryString = params.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  }, [pathname])

  // Navigate with new filters
  const applyFilters = useCallback((newFilters?: Partial<FilterState>) => {
    const updatedFilters = newFilters
      ? { ...filters, ...newFilters }
      : filters

    // Reset to page 1 when filters change
    router.push(buildUrl(updatedFilters))
  }, [filters, buildUrl, router])

  // Individual setters (update local state only)
  const setSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }, [])

  const setCategory = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, category: value }))
  }, [])

  const setConsoleType = useCallback((value: string) => {
    // When console type changes, reset specific console
    setFilters(prev => ({ ...prev, consoleType: value, console: '' }))
  }, [])

  const setConsole = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, console: value }))
  }, [])

  // Clear functions that immediately apply changes
  const clearSearch = useCallback(() => {
    const newFilters = { ...filters, search: '' }
    setFilters(newFilters)
    router.push(buildUrl(newFilters))
  }, [filters, buildUrl, router])

  const clearCategory = useCallback(() => {
    const newFilters = { ...filters, category: '' }
    setFilters(newFilters)
    router.push(buildUrl(newFilters))
  }, [filters, buildUrl, router])

  const clearConsoleType = useCallback(() => {
    // When clearing console type, also clear specific console
    const newFilters = { ...filters, consoleType: '', console: '' }
    setFilters(newFilters)
    router.push(buildUrl(newFilters))
  }, [filters, buildUrl, router])

  const clearConsole = useCallback(() => {
    const newFilters = { ...filters, console: '' }
    setFilters(newFilters)
    router.push(buildUrl(newFilters))
  }, [filters, buildUrl, router])

  const clearConsoleFilters = useCallback(() => {
    const newFilters = { ...filters, consoleType: '', console: '' }
    setFilters(newFilters)
    router.push(buildUrl(newFilters))
  }, [filters, buildUrl, router])

  const clearAllFilters = useCallback(() => {
    const newFilters: FilterState = { search: '', category: '', consoleType: '', console: '' }
    setFilters(newFilters)
    router.push(pathname)
  }, [pathname, router])

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return !!(filters.search || filters.category || filters.consoleType || filters.console)
  }, [filters])

  const hasConsoleFilters = useMemo(() => {
    return !!(filters.consoleType || filters.console)
  }, [filters])

  return {
    filters,
    setSearch,
    setCategory,
    setConsoleType,
    setConsole,
    clearSearch,
    clearCategory,
    clearConsoleType,
    clearConsole,
    clearConsoleFilters,
    clearAllFilters,
    applyFilters,
    hasActiveFilters,
    hasConsoleFilters,
  }
}
