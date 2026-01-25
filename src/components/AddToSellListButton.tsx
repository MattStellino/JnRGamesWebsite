'use client'

import { Plus } from 'lucide-react'
import { useSellList, SellListItem } from '@/contexts/SellListContext'

interface AddToSellListButtonProps {
  item: Omit<SellListItem, 'quantity'>
  variant?: 'icon' | 'button' | 'inline'
  className?: string
}

export default function AddToSellListButton({
  item,
  variant = 'icon',
  className = '',
}: AddToSellListButtonProps) {
  const { addItem, items } = useSellList()

  // Find if this item is already in the list and get quantity
  const itemId = Number(item.id)
  const existingItem = items.find(i => Number(i.id) === itemId)
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
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${className}`}
      >
        <Plus className="h-5 w-5 mr-2" />
        {quantity > 0 ? `Add Another (${quantity})` : 'Add to Sell List'}
      </button>
    )
  }

  // Inline variant - small button with badge
  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`relative z-10 p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
          quantity > 0
            ? 'text-green-700 bg-green-100 hover:bg-green-200'
            : 'text-green-600 hover:text-green-800 hover:bg-green-50'
        } ${className}`}
        title={quantity > 0 ? `Add another (${quantity} in list)` : 'Add to Sell List'}
      >
        <Plus className="h-4 w-4" />
        {quantity > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">
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
          ? 'bg-green-100 text-green-600 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
      } ${className}`}
      title={quantity > 0 ? `Add another (${quantity} in list)` : 'Add to Sell List'}
    >
      <Plus className="h-5 w-5" />
      {quantity > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">
          {quantity}
        </span>
      )}
    </button>
  )
}
