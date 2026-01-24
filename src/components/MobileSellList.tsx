'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, X, Trash2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useSellList } from '@/contexts/SellListContext'

interface MobileSellListProps {
  onNavigate?: () => void
}

export default function MobileSellList({ onNavigate }: MobileSellListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { items, addItem, removeItem, decrementItem, clearList, totalValue, itemCount } = useSellList()

  return (
    <div className="border-t border-gray-200 mt-2 pt-2">
      {/* Sell List Header Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-6 py-4 text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300"
      >
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 mr-4 relative">
            <ShoppingBag className="h-5 w-5 text-red-600" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <div className="text-left">
            <span className="font-semibold block">My Sell List</span>
            {itemCount > 0 && (
              <span className="text-sm text-green-600 font-medium">
                ${totalValue.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {items.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Your sell list is empty</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-2">
                        <Link
                          href={`/items/${item.id}`}
                          onClick={onNavigate}
                          className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-1"
                        >
                          {item.name} {item.quantity > 1 && <span className="text-gray-500">({item.quantity})</span>}
                        </Link>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => decrementItem(item.id)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium text-gray-700 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addItem(item)}
                          className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <span className="text-green-600 font-semibold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total and Actions */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 font-medium">Total:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${totalValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearList}
                    className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                  <Link
                    href="/contact"
                    onClick={onNavigate}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Get Quote
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
