import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🗑️  Finding and deleting duplicate games with "Complete in Box"...')
    
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
      orderBy: {
        name: 'asc'
      }
    })

    // Group games by name (case-insensitive, normalized) and console
    const gameGroups = new Map()
    
    for (const game of allGames) {
      // Normalize name: lowercase, trim, remove extra spaces
      const normalizedName = game.name.toLowerCase().trim().replace(/\s+/g, ' ')
      const key = `${normalizedName}_${game.consoleId}`
      if (!gameGroups.has(key)) {
        gameGroups.set(key, [])
      }
      gameGroups.get(key).push(game)
    }

    // Find duplicates to delete
    const toDelete: any[] = []
    const duplicates: any[] = []

    for (const [key, games] of Array.from(gameGroups.entries())) {
      if (games.length > 1) {
        // Check which games show "Complete in Box" only vs "Game Only"
        const completeInBoxOnly: any[] = []
        const hasGameOnly: any[] = []

        games.forEach((game: any) => {
          const isClassicNintendo = ['NES', 'SNES', 'Nintendo 64'].includes(game.console.name)
          
          // For modern systems: Complete in Box only if price exists but no goodPrice/acceptablePrice
          // For classic: they always show "Game Only"
          const hasCompleteInBoxPrice = !isClassicNintendo && game.price > 0
          const hasGameOnlyPrice = game.goodPrice > 0 || game.acceptablePrice > 0
          const hasGameOnlyInDesc = game.description && game.description.toLowerCase().includes('game only')
          
          const showsOnlyCompleteInBox = hasCompleteInBoxPrice && !hasGameOnlyPrice && !hasGameOnlyInDesc
          const showsGameOnly = isClassicNintendo || hasGameOnlyPrice || hasGameOnlyInDesc
          
          if (showsOnlyCompleteInBox && !showsGameOnly) {
            completeInBoxOnly.push(game)
          } else if (showsGameOnly) {
            hasGameOnly.push(game)
          }
        })

        // Only delete if we have both types and at least one "Game Only" to keep
        if (completeInBoxOnly.length > 0 && hasGameOnly.length > 0) {
          toDelete.push(...completeInBoxOnly)
          duplicates.push({
            name: games[0].name,
            console: games[0].console.name,
            completeInBox: completeInBoxOnly,
            gameOnly: hasGameOnly
          })
        }
      }
    }

    if (toDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duplicate games with "Complete in Box" found to delete.',
        deleted: 0,
        duplicates: []
      })
    }

    // Delete the items
    let deleted = 0
    const deletedItems: any[] = []
    const errors: any[] = []

    for (const item of toDelete) {
      try {
        await prisma.item.delete({
          where: { id: item.id }
        })
        deleted++
        deletedItems.push({
          id: item.id,
          name: item.name,
          console: item.console.name
        })
      } catch (error) {
        errors.push({
          id: item.id,
          name: item.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleted} duplicate games.`,
      summary: {
        totalDuplicates: duplicates.length,
        deleted: deleted,
        failed: errors.length
      },
      deletedItems,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete duplicate games',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

