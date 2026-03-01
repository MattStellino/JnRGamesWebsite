import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchItemImage } from '@/lib/image-fetcher'

function isLegacyRawgImage(url: string | null | undefined) {
  if (!url) return false
  return /rawg\.io/i.test(url)
}

// GET - Fetch and return image URL for an item (also saves to DB)
// Use ?refresh=true to force re-fetch even if image exists
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const itemId = parseInt(resolvedParams.id)
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'
    const debug = searchParams.get('debug') === '1'

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

    // If item already has an image and not forcing refresh, return it
    if (item.imageUrl && !forceRefresh) {
      return NextResponse.json({ imageUrl: item.imageUrl, cached: true })
    }

    // Fetch the appropriate image
    const result = await fetchItemImage(item)
    const imageUrl = result.imageUrl

    if (!imageUrl) {
      // If we're forcing refresh of a legacy RAWG game image and IGDB has no match,
      // clear the stale URL so the UI doesn't keep showing old provider art.
      if (
        forceRefresh &&
        item.category.name === 'Games' &&
        isLegacyRawgImage(item.imageUrl)
      ) {
        await prisma.item.update({
          where: { id: itemId },
          data: { imageUrl: null },
        })
      }

      return NextResponse.json({
        imageUrl: null,
        message: 'No image found',
        ...(debug ? { reason: result.reason || 'unknown' } : {}),
      })
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
