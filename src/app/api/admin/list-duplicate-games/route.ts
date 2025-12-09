import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find Games category
    const gamesCategory = await prisma.category.findUnique({
      where: { name: 'Games' }
    })

    if (!gamesCategory) {
      return NextResponse.json(
        { error: 'Games category not found' },
        { status: 404 }
      )
    }

    // Find all games
    const allGames = await prisma.item.findMany({
      where: {
        categoryId: gamesCategory.id
      },
      include: {
        console: true,
        category: true
      },
      orderBy: [
        { name: 'asc' },
        { consoleId: 'asc' }
      ]
    })

    // Group games by name (normalized) and console
    const gameGroups = new Map()
    
    for (const game of allGames) {
      const normalizedName = game.name.toLowerCase().trim().replace(/\s+/g, ' ')
      const key = `${normalizedName}_${game.consoleId}`
      if (!gameGroups.has(key)) {
        gameGroups.set(key, [])
      }
      gameGroups.get(key).push(game)
    }

    // Find all duplicates
    const duplicates = []
    for (const [key, games] of gameGroups) {
      if (games.length > 1) {
        const duplicateSet = games.map(game => {
          const isClassic = ['NES', 'SNES', 'Nintendo 64'].includes(game.console.name)
          const hasCompleteInBoxPrice = !isClassic && game.price > 0
          const hasGameOnlyPrice = game.goodPrice > 0 || game.acceptablePrice > 0
          const hasGameOnlyInDesc = game.description && game.description.toLowerCase().includes('game only')
          
          return {
            id: game.id,
            name: game.name,
            console: game.console.name,
            consoleId: game.consoleId,
            price: game.price,
            goodPrice: game.goodPrice,
            acceptablePrice: game.acceptablePrice,
            description: game.description,
            showsCompleteInBox: hasCompleteInBoxPrice && !hasGameOnlyPrice && !hasGameOnlyInDesc,
            showsGameOnly: isClassic || hasGameOnlyPrice || hasGameOnlyInDesc
          }
        })

        duplicates.push({
          name: games[0].name,
          console: games[0].console.name,
          count: games.length,
          items: duplicateSet
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalGames: allGames.length,
      uniqueGames: gameGroups.size,
      duplicates: duplicates,
      duplicateCount: duplicates.length
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to list duplicate games',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

