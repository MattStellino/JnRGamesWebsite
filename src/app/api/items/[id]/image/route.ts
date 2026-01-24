import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchItemImage } from '@/lib/image-fetcher'

// GET - Fetch and return image URL for an item (also saves to DB)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const itemId = parseInt(resolvedParams.id)

    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 })
    }

    // Fetch the item with relations
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        category: true,
        console: {
          include: {
            consoleType: true,
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // If item already has an image, return it
    if (item.imageUrl) {
      return NextResponse.json({ imageUrl: item.imageUrl, cached: true })
    }

    // Fetch the appropriate image
    const imageUrl = await fetchItemImage(item)

    if (!imageUrl) {
      return NextResponse.json({ imageUrl: null, message: 'No image found' })
    }

    // Save the image URL to the database
    await prisma.item.update({
      where: { id: itemId },
      data: { imageUrl },
    })

    return NextResponse.json({ imageUrl, cached: false })
  } catch (error) {
    console.error('Error fetching item image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}
