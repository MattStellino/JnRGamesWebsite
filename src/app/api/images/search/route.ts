import { NextRequest, NextResponse } from 'next/server'
import { getCoverImageUrl, searchGames } from '@/lib/igdb'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rawQuery = searchParams.get('q') || ''
    const query = rawQuery.trim()
    const rawConsoleName = searchParams.get('console') || undefined
    const consoleName = rawConsoleName?.trim().slice(0, 60) || undefined
    const parsedPage = parseInt(searchParams.get('page') || '1', 10)
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 50) : 1

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    if (query.length > 120) {
      return NextResponse.json(
        { error: 'Search query is too long' },
        { status: 400 }
      )
    }

    const results = await searchGames(query, consoleName, page, 12)

    if (!results) {
      return NextResponse.json(
        { error: 'Failed to search games. Make sure TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are configured.' },
        { status: 500 }
      )
    }

    // Transform results to a simpler format
    const games = results.map((game) => ({
      id: game.id,
      name: game.name,
      imageUrl: getCoverImageUrl(game.cover?.image_id),
      released: game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString().slice(0, 10)
        : null,
      platforms: game.platforms?.map((p) => p.name) || [],
    }))

    return NextResponse.json({
      games,
      total: games.length,
      hasMore: games.length === 12,
    })
  } catch (error) {
    console.error('Error in image search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
