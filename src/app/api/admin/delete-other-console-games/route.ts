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

    console.log('🗑️  Finding and deleting games under "Other" console type that have duplicates...')
    
    // Find "Other" console type
    const otherConsoleType = await prisma.consoleType.findUnique({
      where: { name: 'Other' },
      include: {
        consoles: {
          include: {
            items: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    if (!otherConsoleType) {
      return NextResponse.json({
        success: true,
        message: '"Other" console type not found.',
        deleted: 0
      })
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

    // Get all games under "Other" console type
    const otherGames = []
    for (const console of otherConsoleType.consoles) {
      for (const item of console.items) {
        if (item.categoryId === gamesCategory.id) {
          otherGames.push({
            ...item,
            console: console
          })
        }
      }
    }

    if (otherGames.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No games found under "Other" console type.',
        deleted: 0
      })
    }

    // Get all games to check for duplicates
    const allGames = await prisma.item.findMany({
      where: {
        categoryId: gamesCategory.id
      },
      include: {
        console: {
          include: {
            consoleType: true
          }
        }
      }
    })

    // Find duplicates - games under "Other" that have the same name under a different console type
    const toDelete = []
    const duplicates = []

    for (const otherGame of otherGames) {
      // Find games with same name but different console type (not "Other")
      const matchingGames = allGames.filter(game => 
        game.id !== otherGame.id &&
        game.name.toLowerCase().trim() === otherGame.name.toLowerCase().trim() &&
        game.console.consoleType.name !== 'Other'
      )

      if (matchingGames.length > 0) {
        toDelete.push(otherGame)
        duplicates.push({
          name: otherGame.name,
          otherConsole: otherGame.console.name,
          otherId: otherGame.id,
          correctVersions: matchingGames.map(g => ({
            id: g.id,
            consoleType: g.console.consoleType.name,
            console: g.console.name
          }))
        })
      }
    }

    if (toDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duplicate games under "Other" console type found to delete.',
        deleted: 0,
        duplicates: []
      })
    }

    // Delete the items
    let deleted = 0
    const deletedItems = []
    const errors = []

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
      message: `Successfully deleted ${deleted} games under "Other" console type.`,
      summary: {
        totalUnderOther: otherGames.length,
        duplicatesFound: duplicates.length,
        deleted: deleted,
        failed: errors.length
      },
      duplicates,
      deletedItems,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete games under "Other" console type',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

