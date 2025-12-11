'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ConsoleType, Console } from '@/types'

interface ConsoleFilterProps {
  consoleTypes?: ConsoleType[]
  onConsoleChange?: (consoleId: string) => void
  initialConsoleType?: string
  initialConsole?: string
}

export default function ConsoleFilter({ 
  consoleTypes = [], 
  onConsoleChange,
  initialConsoleType = '',
  initialConsole = ''
}: ConsoleFilterProps) {
  const [localConsoleTypes, setLocalConsoleTypes] = useState<ConsoleType[]>(consoleTypes)
  const [selectedConsoleType, setSelectedConsoleType] = useState<string>(initialConsoleType)
  const [selectedConsole, setSelectedConsole] = useState<string>(initialConsole)
  const [consoles, setConsoles] = useState<Console[]>([])
  const router = useRouter()
  const pathname = usePathname()

  // Update localConsoleTypes when consoleTypes prop changes
  useEffect(() => {
    if (consoleTypes.length > 0) {
      setLocalConsoleTypes(consoleTypes)
    }
  }, [consoleTypes])

  // Sync state when props change (e.g., after navigation)
  useEffect(() => {
    setSelectedConsoleType(initialConsoleType)
    setSelectedConsole(initialConsole)
  }, [initialConsoleType, initialConsole])

  // Get current URL search params safely (client-side only)
  const getSearchParams = useCallback(() => {
    if (typeof window === 'undefined') return new URLSearchParams()
    return new URLSearchParams(window.location.search)
  }, [])

  useEffect(() => {
    if (consoleTypes.length === 0) {
      // Fetch console types if not provided
      fetch('/api/console-types')
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
            setLocalConsoleTypes(data)
          } else {
            console.error('Console types API returned non-array data:', data)
            setLocalConsoleTypes([])
          }
        })
        .catch(error => {
          console.error('Error fetching console types:', error)
          setLocalConsoleTypes([])
        })
    }
  }, [consoleTypes])

  // Load consoles when initialConsoleType is provided (from server props)
  useEffect(() => {
    if (initialConsoleType) {
      fetch(`/api/console-types/${initialConsoleType}/consoles`)
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
          if (Array.isArray(data)) {
            setConsoles(data)
          } else {
            setConsoles([])
          }
        })
        .catch(error => {
          console.error('Error fetching consoles:', error)
          setConsoles([])
        })
    }
  }, [initialConsoleType])

  const handleConsoleTypeChange = (consoleTypeId: string) => {
    setSelectedConsoleType(consoleTypeId)
    setSelectedConsole('') // Reset console selection
    setConsoles([]) // Clear consoles while loading
    
    if (consoleTypeId) {
      // Fetch consoles for selected type
      fetch(`/api/console-types/${consoleTypeId}/consoles`)
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text()
            console.error(`HTTP error! status: ${res.status}, body: ${errorText}`)
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          const contentType = res.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text()
            console.error('Response is not JSON:', text)
            throw new Error('Response is not JSON')
          }
          return res.json()
        })
        .then(data => {
          // Ensure data is an array
          if (Array.isArray(data)) {
            setConsoles(data)
          } else {
            console.error('Consoles API returned non-array data:', data)
            setConsoles([])
          }
        })
        .catch(error => {
          console.error('Error fetching consoles:', error)
          setConsoles([])
        })
    } else {
      setConsoles([])
    }

    // Use setTimeout to delay navigation and allow dropdown to close naturally
    setTimeout(() => {
      updateURL(consoleTypeId, '')
    }, 0)
  }

  const handleConsoleChange = (consoleId: string) => {
    setSelectedConsole(consoleId)
    
    if (onConsoleChange) {
      onConsoleChange(consoleId)
    } else {
      updateURL(selectedConsoleType, consoleId)
    }
  }

  const updateURL = (consoleTypeId: string, consoleId: string) => {
    const params = getSearchParams()
    
    if (consoleTypeId) {
      params.set('consoleType', consoleTypeId)
    } else {
      params.delete('consoleType')
    }
    
    if (consoleId && consoleId !== 'all') {
      params.set('console', consoleId)
    } else {
      params.delete('console')
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedConsoleType('')
    setSelectedConsole('')
    setConsoles([])
    
    const params = getSearchParams()
    params.delete('consoleType')
    params.delete('console')
    params.delete('category')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Console Type Filter */}
        <div className="flex-1">
          <label htmlFor="consoleType" className="block text-sm font-medium text-gray-700 mb-1">
            Console Type
          </label>
          <select
            id="consoleType"
            value={selectedConsoleType}
            onChange={(e) => handleConsoleTypeChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white transition-colors cursor-pointer"
          >
            <option value="">All Console Types</option>
            {Array.isArray(localConsoleTypes) && localConsoleTypes.map((consoleType) => (
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
            value={selectedConsole}
            onChange={(e) => handleConsoleChange(e.target.value)}
            disabled={!selectedConsoleType}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white transition-colors cursor-pointer"
          >
            <option value="">
              {!selectedConsoleType 
                ? 'Select a console type first' 
                : consoles.length === 0 
                  ? 'Loading consoles...' 
                  : 'All Consoles'}
            </option>
            {consoles
              .filter((console) => console.name !== 'Wii') // Filter out "Wii" console
              .map((console) => (
                <option key={console.id} value={console.id.toString()}>
                  {console.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button - More prominent */}
      {(selectedConsoleType || selectedConsole) && (
        <div className="flex justify-center sm:justify-start">
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
