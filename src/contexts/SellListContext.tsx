'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface SellListItem {
  id: number
  sellListKey?: string
  conditionLabel?: string
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
  removeItem: (sellListKey: string | number) => void
  decrementItem: (sellListKey: string | number) => void
  clearList: () => void
  getQuantity: (sellListKey: string | number) => number
  isInList: (sellListKey: string | number) => boolean
  totalValue: number
  itemCount: number
}

const SellListContext = createContext<SellListContextType | undefined>(undefined)

const STORAGE_KEY = 'jnr-sell-list'

function toConditionKey(conditionLabel?: string) {
  if (!conditionLabel) return ''
  return conditionLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function buildSellListKey(item: Partial<SellListItem>) {
  const itemId = Number(item.id)
  const conditionPart = toConditionKey(item.conditionLabel)
  if (conditionPart) return `${itemId}:${conditionPart}`
  return String(itemId)
}

function normalizeSellListKey(sellListKey: string | number) {
  return typeof sellListKey === 'string' && sellListKey.trim().length > 0
    ? sellListKey
    : String(Number(sellListKey))
}

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
          const merged = new Map<string, SellListItem>()

          for (const rawItem of parsed as SellListItem[]) {
            const itemId = Number(rawItem.id)
            const normalizedItem: SellListItem = {
              ...rawItem,
              id: itemId,
              price: Number(rawItem.price) || 0,
              quantity: Number(rawItem.quantity) || 1,
              sellListKey: normalizeSellListKey(rawItem.sellListKey || buildSellListKey(rawItem)),
            }

            const key = normalizedItem.sellListKey || String(normalizedItem.id)
            const existing = merged.get(key)
            if (existing) {
              existing.quantity += normalizedItem.quantity
            } else {
              merged.set(key, normalizedItem)
            }
          }

          setItems(Array.from(merged.values()))
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
    const itemKey = normalizeSellListKey(item.sellListKey || itemId)

    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(i => i.sellListKey === itemKey)

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
          sellListKey: itemKey,
          quantity: 1
        }]
      }
    })
  }

  // Decrement quantity or remove if quantity becomes 0
  const decrementItem = (sellListKey: string | number) => {
    const itemKey = normalizeSellListKey(sellListKey)
    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(i => i.sellListKey === itemKey)

      if (existingIndex !== -1) {
        const currentQty = currentItems[existingIndex].quantity
        if (currentQty <= 1) {
          // Remove item
          return currentItems.filter(i => i.sellListKey !== itemKey)
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
  const removeItem = (sellListKey: string | number) => {
    const itemKey = normalizeSellListKey(sellListKey)
    setItems(currentItems => currentItems.filter(i => i.sellListKey !== itemKey))
  }

  // Clear all items
  const clearList = () => {
    setItems([])
  }

  // Get quantity of a specific item
  const getQuantity = (sellListKey: string | number): number => {
    const itemKey = normalizeSellListKey(sellListKey)
    const item = items.find(i => i.sellListKey === itemKey)
    return item ? item.quantity : 0
  }

  // Check if item is in list
  const isInList = (sellListKey: string | number): boolean => {
    const itemKey = normalizeSellListKey(sellListKey)
    return items.some(i => i.sellListKey === itemKey)
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
