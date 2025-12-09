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

    console.log('🎮 Adding games to database...')
    
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

    // Find consoles
    const nintendo3DS = await prisma.console.findUnique({
      where: { name: 'Nintendo 3DS' }
    })

    const nintendoDS = await prisma.console.findUnique({
      where: { name: 'Nintendo DS' }
    })

    const gamecube = await prisma.console.findUnique({
      where: { name: 'Nintendo GameCube' }
    })

    if (!nintendo3DS || !nintendoDS || !gamecube) {
      return NextResponse.json(
        { error: 'One or more consoles not found. Please ensure Nintendo 3DS, Nintendo DS, and Nintendo GameCube exist.' },
        { status: 404 }
      )
    }

    // Nintendo 3DS games
    const nintendo3DSGames = [
      { name: "The Legend of Zelda: Ocarina of Time 3D", cib: 15, boxAndGame: 10, cartridgeOnly: 8 },
      { name: "The Legend of Zelda: Majora's Mask 3D", cib: 15, boxAndGame: 10, cartridgeOnly: 8 },
      { name: "Pokemon Y", cib: 20, boxAndGame: 15, cartridgeOnly: 10 },
      { name: "Pokemon X", cib: 20, boxAndGame: 15, cartridgeOnly: 10 },
      { name: "Pokemon Sun", cib: 15, boxAndGame: 10, cartridgeOnly: 8 },
      { name: "Pokemon Moon", cib: 15, boxAndGame: 10, cartridgeOnly: 8 },
      { name: "Pokemon Ultra Sun", cib: 25, boxAndGame: 20, cartridgeOnly: 15 },
      { name: "Pokemon Ultra Moon", cib: 25, boxAndGame: 20, cartridgeOnly: 15 },
    ]

    // Nintendo DS games
    const nintendoDSGames = [
      { name: "Pokemon Diamond", cib: 28, boxAndGame: 20, cartridgeOnly: 14 },
      { name: "Pokemon Pearl", cib: 28, boxAndGame: 20, cartridgeOnly: 14 },
      { name: "Pokemon Platinum", cib: 140, boxAndGame: 110, cartridgeOnly: 70 },
      { name: "Pokemon White", cib: 60, boxAndGame: 50, cartridgeOnly: 35 },
      { name: "Pokemon Black", cib: 60, boxAndGame: 50, cartridgeOnly: 35 },
      { name: "Pokemon White 2", cib: 150, boxAndGame: 120, cartridgeOnly: 80 },
      { name: "Pokemon Black 2", cib: 150, boxAndGame: 120, cartridgeOnly: 80 },
    ]

    // GameCube games
    const gamecubeGames = [
      { name: "Super Smash Bros. Melee", cib: 40, boxAndGame: 30, discOnly: 20 },
      { name: "Super Mario Sunshine", cib: 30, boxAndGame: 24, discOnly: 15 },
      { name: "The Legend of Zelda: Wind Waker", cib: 50, boxAndGame: 43, discOnly: 35 },
      { name: "The Legend of Zelda: Collector's Edition", cib: 38, boxAndGame: 27, discOnly: 18 },
      { name: "The Legend of Zelda: Twilight Princess", cib: 130, boxAndGame: 115, discOnly: 80 },
      { name: "Luigi's Mansion", cib: 35, boxAndGame: 30, discOnly: 18 },
      { name: "Sims 2", cib: 15, boxAndGame: 10, discOnly: 6 },
      { name: "Mario Superstar Baseball", cib: 55, boxAndGame: 40, discOnly: 28 },
    ]

    let created = 0
    let skipped = 0
    const createdGames: string[] = []
    const skippedGames: string[] = []
    const errors: any[] = []

    // Add Nintendo 3DS games
    for (const game of nintendo3DSGames) {
      try {
        const existing = await prisma.item.findFirst({
          where: {
            name: game.name,
            consoleId: nintendo3DS.id,
            categoryId: gamesCategory.id
          }
        })

        if (existing) {
          skipped++
          skippedGames.push(game.name)
          continue
        }

        await prisma.item.create({
          data: {
            name: game.name,
            description: `Game for Nintendo 3DS - Multiple condition options available`,
            price: game.cib,
            goodPrice: game.boxAndGame,
            acceptablePrice: game.cartridgeOnly,
            categoryId: gamesCategory.id,
            consoleId: nintendo3DS.id
          }
        })
        created++
        createdGames.push(game.name)
      } catch (error) {
        errors.push({ game: game.name, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    // Add Nintendo DS games
    for (const game of nintendoDSGames) {
      try {
        const existing = await prisma.item.findFirst({
          where: {
            name: game.name,
            consoleId: nintendoDS.id,
            categoryId: gamesCategory.id
          }
        })

        if (existing) {
          skipped++
          skippedGames.push(game.name)
          continue
        }

        await prisma.item.create({
          data: {
            name: game.name,
            description: `Game for Nintendo DS - Multiple condition options available`,
            price: game.cib,
            goodPrice: game.boxAndGame,
            acceptablePrice: game.cartridgeOnly,
            categoryId: gamesCategory.id,
            consoleId: nintendoDS.id
          }
        })
        created++
        createdGames.push(game.name)
      } catch (error) {
        errors.push({ game: game.name, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    // Add GameCube games
    for (const game of gamecubeGames) {
      try {
        const existing = await prisma.item.findFirst({
          where: {
            name: game.name,
            consoleId: gamecube.id,
            categoryId: gamesCategory.id
          }
        })

        if (existing) {
          skipped++
          skippedGames.push(game.name)
          continue
        }

        await prisma.item.create({
          data: {
            name: game.name,
            description: `Game for Nintendo GameCube - Multiple condition options available`,
            price: game.cib,
            goodPrice: game.boxAndGame,
            acceptablePrice: game.discOnly,
            categoryId: gamesCategory.id,
            consoleId: gamecube.id
          }
        })
        created++
        createdGames.push(game.name)
      } catch (error) {
        errors.push({ game: game.name, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${created} games. ${skipped} already existed.`,
      summary: {
        created,
        skipped,
        errors: errors.length
      },
      createdGames,
      skippedGames: skippedGames.slice(0, 10), // Limit to first 10
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to add games',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

