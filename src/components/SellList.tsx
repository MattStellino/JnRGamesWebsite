'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, X, Trash2, ChevronRight } from 'lucide-react'
import { useSellList } from '@/contexts/SellListContext'

export default function SellList() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { items, addItem, removeItem, decrementItem, clearList, totalValue, itemCount } = useSellList()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sell List Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center text-gray-700 hover:text-red-600 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-xl px-4 py-3 group"
        aria-label={`Sell list with ${itemCount} items`}
        aria-expanded={isOpen}
      >
        <ShoppingBag className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">My Sell List</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close sell list"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Your sell list is empty</p>
              <p className="text-gray-400 text-sm">
                Add items you want to sell by clicking the + button
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/items/${item.id}`}
                          onClick={() => setIsOpen(false)}
                          className="text-gray-900 font-medium hover:text-green-600 transition-colors line-clamp-1"
                        >
                          {item.name} {item.quantity > 1 && <span className="text-gray-500">({item.quantity})</span>}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          {item.consoleName && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {item.consoleName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                            onClick={() => addItem({ id: item.id, name: item.name, price: item.price, category: item.category, consoleName: item.consoleName, consoleType: item.consoleType, imageUrl: item.imageUrl })}
                            className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <span className="text-green-600 font-semibold whitespace-nowrap min-w-[60px] text-right">
                          ${((Number(item.price) || 0) * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Remove ${item.name} from sell list`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 font-medium">Estimated Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${totalValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearList}
                    className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Clear all items from sell list"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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
