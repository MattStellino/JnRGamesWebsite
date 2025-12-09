import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test the exact query from items page
    const items = await prisma.item.findMany({
      where: {},
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { name: 'asc' }
      ],
      take: 12,
    })

    const newGameNames = [
      'Mario Superstar Baseball',
      'Super Smash Bros. Melee',
      'Pokemon Diamond',
      'Pokemon Y'
    ]

    const foundGames = items.filter(item => newGameNames.includes(item.name))

    return NextResponse.json({
      success: true,
      totalItems: items.length,
      newGamesFound: foundGames.length,
      newGames: foundGames.map(item => ({
        name: item.name,
        console: item.console?.name,
        createdAt: item.createdAt
      })),
      first12Items: items.map(item => ({
        name: item.name,
        console: item.console?.name,
        category: item.category.name
      }))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

