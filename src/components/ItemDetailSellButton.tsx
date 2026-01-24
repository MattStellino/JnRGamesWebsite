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
}

export default function ItemDetailSellButton({ item }: ItemDetailSellButtonProps) {
  const sellListItem: Omit<SellListItem, 'quantity'> = {
    id: item.id,
    name: item.name,
    price: item.price,
    category: item.category.name,
    consoleName: item.console?.name,
    consoleType: item.console?.consoleType?.name,
    imageUrl: item.imageUrl,
  }

  return (
    <AddToSellListButton item={sellListItem} variant="button" />
  )
}
