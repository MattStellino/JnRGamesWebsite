'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface SellListItem {
  id: number
  name: string
  price: number
  category: string
  consoleName?: string
  consoleType?: string
  imageUrl?: string | null
  quantity: number
}

interface SellListContextType {
  items: SellListItem[]
  addItem: (item: Omit<SellListItem, 'quantity'>) => void
  removeItem: (id: number) => void
  decrementItem: (id: number) => void
  clearList: () => void
  isInList: (id: number) => boolean
  getQuantity: (id: number) => number
  totalValue: number
  itemCount: number
}

const SellListContext = createContext<SellListContextType | null>(null)

const STORAGE_KEY = 'jnr-sell-list'

export function SellListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SellListItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            // Migrate old items without quantity
            const migratedItems = parsed.map((item: SellListItem) => ({
              ...item,
              quantity: item.quantity || 1
            }))
            setItems(migratedItems)
          }
        }
      } catch (error) {
        console.error('Error loading sell list from localStorage:', error)
      }
      setIsInitialized(true)
    }
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Error saving sell list to localStorage:', error)
      }
    }
  }, [items, isInitialized])

  const addItem = useCallback((item: Omit<SellListItem, 'quantity'>) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id)
      if (existingIndex >= 0) {
        // Increment quantity if already in list
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        }
        return updated
      }
      // Add new item with quantity 1
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const decrementItem = useCallback((id: number) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === id)
      if (existingIndex >= 0) {
        const currentQuantity = prev[existingIndex].quantity
        if (currentQuantity <= 1) {
          // Remove item if quantity would go to 0
          return prev.filter(item => item.id !== id)
        }
        // Decrement quantity
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQuantity - 1
        }
        return updated
      }
      return prev
    })
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearList = useCallback(() => {
    setItems([])
  }, [])

  const isInList = useCallback((id: number) => {
    return items.some(item => item.id === id)
  }, [items])

  const getQuantity = useCallback((id: number) => {
    const item = items.find(i => i.id === id)
    return item?.quantity || 0
  }, [items])

  // Calculate total value considering quantities
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  // Total item count is sum of all quantities
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <SellListContext.Provider value={{
      items,
      addItem,
      removeItem,
      decrementItem,
      clearList,
      isInList,
      getQuantity,
      totalValue,
      itemCount,
    }}>
      {children}
    </SellListContext.Provider>
  )
}

export function useSellList(): SellListContextType {
  const context = useContext(SellListContext)
  if (!context) {
    throw new Error('useSellList must be used within a SellListProvider')
  }
  return context
}
