import { NextRequest, NextResponse } from 'next/server'
import { searchGames } from '@/lib/rawg'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const consoleName = searchParams.get('console') || undefined
    const page = parseInt(searchParams.get('page') || '1')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const results = await searchGames(query, consoleName, page, 12)

    if (!results) {
      return NextResponse.json(
        { error: 'Failed to search games. Make sure RAWG_API_KEY is configured.' },
        { status: 500 }
      )
    }

    // Transform results to a simpler format
    const games = results.results.map((game) => ({
      id: game.id,
      name: game.name,
      imageUrl: game.background_image,
      released: game.released,
      platforms: game.platforms?.map((p) => p.platform.name) || [],
    }))

    return NextResponse.json({
      games,
      total: results.count,
      hasMore: results.next !== null,
    })
  } catch (error) {
    console.error('Error in image search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
