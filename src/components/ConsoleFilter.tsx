'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConsoleType, Console } from '@/types'

interface ConsoleFilterProps {
  consoleTypes?: ConsoleType[]
  onConsoleChange?: (consoleId: string) => void
}

export default function ConsoleFilter({ consoleTypes = [], onConsoleChange }: ConsoleFilterProps) {
  const [localConsoleTypes, setLocalConsoleTypes] = useState<ConsoleType[]>(consoleTypes)
  const [selectedConsoleType, setSelectedConsoleType] = useState<string>('')
  const [selectedConsole, setSelectedConsole] = useState<string>('')
  const [consoles, setConsoles] = useState<Console[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract stable values from searchParams to avoid dependency issues
  const consoleTypeParam = useMemo(() => searchParams.get('consoleType'), [searchParams])
  const consoleParam = useMemo(() => searchParams.get('console'), [searchParams])

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

  useEffect(() => {
    // Set initial values from URL params
    if (consoleTypeParam) {
      setSelectedConsoleType(consoleTypeParam)
      // Fetch consoles for this type
      console.log(`Initial load: Fetching consoles for console type: ${consoleTypeParam}`)
      fetch(`/api/console-types/${consoleTypeParam}/consoles`)
        .then(async res => {
          console.log(`Initial load response status: ${res.status}`)
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
          console.log('Initial load received data:', data)
          if (Array.isArray(data)) {
            setConsoles(data)
            console.log(`✅ Initial load: Loaded ${data.length} consoles`)
            if (consoleParam && consoleParam !== 'all') {
              setSelectedConsole(consoleParam)
            } else {
              setSelectedConsole('')
            }
          } else {
            console.error('❌ Initial load: Non-array data:', data)
            setConsoles([])
            setSelectedConsole('')
          }
        })
        .catch(error => {
          console.error('❌ Initial load error fetching consoles:', error)
          setConsoles([])
          setSelectedConsole('')
        })
    } else {
      setSelectedConsoleType('')
      setConsoles([])
      setSelectedConsole('')
    }
  }, [consoleTypeParam, consoleParam])

  const handleConsoleTypeChange = (consoleTypeId: string) => {
    setSelectedConsoleType(consoleTypeId)
    setSelectedConsole('') // Reset console selection
    setConsoles([]) // Clear consoles while loading
    
    if (consoleTypeId) {
      // Fetch consoles for selected type
      console.log(`Fetching consoles for console type: ${consoleTypeId}`)
      fetch(`/api/console-types/${consoleTypeId}/consoles`)
        .then(async res => {
          console.log(`Response status: ${res.status}`)
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
          console.log('Received data:', data)
          // Ensure data is an array
          if (Array.isArray(data)) {
            setConsoles(data)
            console.log(`✅ Loaded ${data.length} consoles for console type ${consoleTypeId}`)
          } else {
            console.error('❌ Consoles API returned non-array data:', data)
            setConsoles([])
          }
        })
        .catch(error => {
          console.error('❌ Error fetching consoles:', error)
          setConsoles([])
        })
    } else {
      setConsoles([])
    }

    updateURL(consoleTypeId, '')
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
    const params = new URLSearchParams(searchParams.toString())
    
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
    
    router.push(`/items?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedConsoleType('')
    setSelectedConsole('')
    setConsoles([])
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete('consoleType')
    params.delete('console')
    params.delete('category')
    router.push(`/items?${params.toString()}`)
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 bg-white transition-colors"
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
