'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Gamepad2, Loader2 } from 'lucide-react'

interface AutoImageProps {
  itemId: number
  itemName: string
  initialImageUrl?: string | null
  className?: string
}

export default function AutoImage({
  itemId,
  itemName,
  initialImageUrl,
  className = '',
}: AutoImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null)
  const [isLoading, setIsLoading] = useState(!initialImageUrl)
  const [error, setError] = useState(false)

  useEffect(() => {
    // If we already have an image, don't fetch
    if (initialImageUrl) {
      setImageUrl(initialImageUrl)
      setIsLoading(false)
      return
    }

    // Fetch the image
    const fetchImage = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/items/${itemId}/image`)
        const data = await response.json()

        if (data.imageUrl) {
          setImageUrl(data.imageUrl)
        }
      } catch (err) {
        console.error('Failed to fetch image:', err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImage()
  }, [itemId, initialImageUrl])

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-gray-400 mx-auto animate-spin" />
          <p className="text-gray-500 mt-2 text-sm">Loading image...</p>
        </div>
      </div>
    )
  }

  // Image found
  if (imageUrl && !error) {
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <Image
          src={imageUrl}
          alt={itemName}
          fill
          className="object-contain"
          priority
          unoptimized={imageUrl.includes('wikimedia.org') || imageUrl.includes('rawg.io')}
          onError={() => setError(true)}
        />
      </div>
    )
  }

  // No image / error
  return (
    <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No image available</p>
      </div>
    </div>
  )
}
