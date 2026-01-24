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
  const existingItem = items.find(i => i.id === item.id)
  const quantity = existingItem?.quantity || 0
  const inList = quantity > 0

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Always add - this increments quantity if already in list
    addItem(item)
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${inList
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${className}`}
        aria-label={`Add ${item.name} to sell list`}
      >
        <Plus className="h-5 w-5 mr-2" />
        {inList ? `Add Another (${quantity} in list)` : 'Add to Sell List'}
      </button>
    )
  }

  // Inline variant - matches the green "See Price" link styling
  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`relative p-1.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${inList
          ? 'text-green-700 bg-green-100 hover:bg-green-200'
          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
          } ${className}`}
        aria-label={`Add ${item.name} to sell list${inList ? ` (${quantity} in list)` : ''}`}
        title={inList ? `Add another (${quantity} in list)` : 'Add to Sell List'}
      >
        <Plus className="h-4 w-4" />
        {inList && (
          <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {quantity > 9 ? '9+' : quantity}
          </span>
        )}
      </button>
    )
  }

  // Icon variant (for item cards - legacy overlay style)
  return (
    <button
      onClick={handleClick}
      className={`relative p-2 rounded-full transition-all duration-200 ${inList
        ? 'bg-green-100 text-green-600 hover:bg-green-200'
        : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
        } ${className}`}
      aria-label={`Add ${item.name} to sell list${inList ? ` (${quantity} in list)` : ''}`}
      title={inList ? `Add another (${quantity} in list)` : 'Add to Sell List'}
    >
      <Plus className="h-5 w-5" />
      {inList && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
          {quantity > 9 ? '9+' : quantity}
        </span>
      )}
    </button>
  )
}
