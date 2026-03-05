'use client'

import { Plus } from 'lucide-react'
import { useSellList, SellListItem } from '@/contexts/SellListContext'

interface AddToSellListButtonProps {
  item: Omit<SellListItem, 'quantity'>
  variant?: 'icon' | 'button' | 'inline'
  label?: string
  className?: string
}

export default function AddToSellListButton({
  item,
  variant = 'icon',
  label = 'Add to Sell List',
  className = '',
}: AddToSellListButtonProps) {
  const { addItem, items } = useSellList()

  // Track quantity for this exact sell-list entry (item + condition)
  const itemKey = item.sellListKey || String(Number(item.id))
  const existingItem = items.find(i => i.sellListKey === itemKey)
  const quantity = existingItem ? existingItem.quantity : 0

  const handleClick = () => {
    addItem(item)
  }

  // Button variant - full button with text
  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          quantity > 0
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-red-600 text-white hover:bg-red-700'
        } ${className}`}
      >
        <Plus className="h-5 w-5 mr-2" />
        {quantity > 0 ? `Add Another (${quantity})` : label}
      </button>
    )
  }

  // Inline variant - small button with badge
  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`relative z-20 h-10 w-10 inline-flex items-center justify-center pointer-events-auto rounded-lg transition-all duration-200 cursor-pointer ${
          quantity > 0
            ? 'text-red-700 hover:text-red-800 hover:bg-red-50'
            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
        } ${className}`}
        title={quantity > 0 ? `Add another (${quantity} in list)` : 'Add to Sell List'}
        aria-label={quantity > 0 ? `Add another (${quantity} in list)` : 'Add to Sell List'}
      >
        <Plus className="h-6 w-6" />
        {quantity > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">
            {quantity}
          </span>
        )}
      </button>
    )
  }

  // Icon variant - circular button with badge
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative z-10 p-2 rounded-full transition-all duration-200 cursor-pointer ${
        quantity > 0
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
      } ${className}`}
      title={quantity > 0 ? `Add another (${quantity} in list)` : 'Add to Sell List'}
    >
      <Plus className="h-5 w-5" />
      {quantity > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">
          {quantity}
        </span>
      )}
    </button>
  )
}
