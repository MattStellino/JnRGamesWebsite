import Image from 'next/image'
import Link from 'next/link'
import { Item } from '@/types'

interface ItemCardProps {
  item: Item & {
    category: {
      id: number
      name: string
    }
    console?: {
      id: number
      name: string
      consoleType?: {
        id: number
        name: string
      }
    }
  }
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <article 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 flex flex-col h-full"
      role="article"
      aria-labelledby={`item-title-${item.id}`}
    >
      {item.imageUrl && (
        <div className="aspect-square relative flex-shrink-0">
          <Image
            src={item.imageUrl}
            alt={`${item.name} - Gaming item for sale`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>
      )}
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 
            id={`item-title-${item.id}`}
            className="text-lg font-semibold text-gray-900 line-clamp-2"
          >
            {item.name}
          </h3>
          <span 
            className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0 ml-2"
            aria-label={`Category: ${item.category.name}`}
          >
            {item.category.name}
          </span>
        </div>
        
        {item.console && (
          <div className="mb-2">
            <span 
              className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded"
              aria-label={`Console: ${item.console.consoleType?.name} ${item.console.name}`}
            >
              {item.console.consoleType?.name} - {item.console.name}
            </span>
          </div>
        )}
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">
            {item.description}
          </p>
        )}
        
        <div className="flex justify-between items-center mt-auto">
          <span 
            className="text-xl font-bold text-green-600"
            aria-label={`Price: $${item.price.toFixed(2)}`}
          >
            ${item.price.toFixed(2)}
          </span>
          <Link
            href={`/items/${item.id}`}
            className="text-green-600 hover:text-green-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg px-3 py-1 hover:bg-green-50 transition-all duration-200 flex-shrink-0"
            aria-label={`View details and price for ${item.name}`}
          >
            See Price →
          </Link>
        </div>
      </div>
    </article>
  )
}
