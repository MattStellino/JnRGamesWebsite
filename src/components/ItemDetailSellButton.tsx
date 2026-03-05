'use client'

import AddToSellListButton from './AddToSellListButton'
import { SellListItem } from '@/contexts/SellListContext'

interface ItemDetailSellButtonProps {
  item: {
    id: number
    name: string
    price: number
    imageUrl?: string | null
    category: {
      name: string
    }
    console?: {
      name: string
      consoleType?: {
        name: string
      }
    } | null
  }
  conditionLabel: string
  conditionPrice: number
  variant?: 'icon' | 'button' | 'inline'
  className?: string
}

function toConditionKey(conditionLabel: string) {
  return conditionLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'standard'
}

export default function ItemDetailSellButton({
  item,
  conditionLabel,
  conditionPrice,
  variant = 'inline',
  className = '',
}: ItemDetailSellButtonProps) {
  const sellListItem: Omit<SellListItem, 'quantity'> = {
    id: Number(item.id),
    name: item.name,
    sellListKey: `${Number(item.id)}:${toConditionKey(conditionLabel)}`,
    conditionLabel,
    price: Number(conditionPrice) || 0,
    category: item.category.name,
    consoleName: item.console?.name,
    consoleType: item.console?.consoleType?.name,
    imageUrl: item.imageUrl,
  }

  return (
    <AddToSellListButton
      item={sellListItem}
      variant={variant}
      label={`Add ${conditionLabel}`}
      className={className}
    />
  )
}
