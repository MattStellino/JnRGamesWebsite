'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  getQuantity: (id: number) => number
  isInList: (id: number) => boolean
  totalValue: number
  itemCount: number
}

const SellListContext = createContext<SellListContextType | undefined>(undefined)

const STORAGE_KEY = 'jnr-sell-list'

export function SellListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SellListItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed.map((item: SellListItem) => ({
            ...item,
            quantity: item.quantity || 1
          })))
        }
      } catch (e) {
        console.error('Failed to parse sell list', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isLoaded])

  // Add item or increment quantity
  const addItem = (item: Omit<SellListItem, 'quantity'>) => {
    // Ensure id and price are proper numbers
    const itemId = Number(item.id)
    const itemPrice = Number(item.price) || 0

    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(i => Number(i.id) === itemId)

      if (existingIndex !== -1) {
        // Item exists - increment quantity
        const newItems = [...currentItems]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1
        }
        return newItems
      } else {
        // New item - add with quantity 1
        return [...currentItems, {
          ...item,
          id: itemId,
          price: itemPrice,
          quantity: 1
        }]
      }
    })
  }

  // Decrement quantity or remove if quantity becomes 0
  const decrementItem = (id: number) => {
    const numId = Number(id)
    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(i => Number(i.id) === numId)

      if (existingIndex !== -1) {
        const currentQty = currentItems[existingIndex].quantity
        if (currentQty <= 1) {
          // Remove item
          return currentItems.filter(i => Number(i.id) !== numId)
        } else {
          // Decrement
          const newItems = [...currentItems]
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: currentQty - 1
          }
          return newItems
        }
      }
      return currentItems
    })
  }

  // Remove item completely
  const removeItem = (id: number) => {
    const numId = Number(id)
    setItems(currentItems => currentItems.filter(i => Number(i.id) !== numId))
  }

  // Clear all items
  const clearList = () => {
    setItems([])
  }

  // Get quantity of a specific item
  const getQuantity = (id: number): number => {
    const numId = Number(id)
    const item = items.find(i => Number(i.id) === numId)
    return item ? item.quantity : 0
  }

  // Check if item is in list
  const isInList = (id: number): boolean => {
    const numId = Number(id)
    return items.some(i => Number(i.id) === numId)
  }

  // Calculate totals
  const totalValue = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * item.quantity), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <SellListContext.Provider value={{
      items,
      addItem,
      removeItem,
      decrementItem,
      clearList,
      getQuantity,
      isInList,
      totalValue,
      itemCount,
    }}>
      {children}
    </SellListContext.Provider>
  )
}

export function useSellList() {
  const context = useContext(SellListContext)
  if (!context) {
    throw new Error('useSellList must be used within a SellListProvider')
  }
  return context
}
