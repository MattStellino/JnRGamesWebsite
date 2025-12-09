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

    // Find Nintendo console type
    const nintendoConsoleType = await prisma.consoleType.findUnique({
      where: { name: 'Nintendo' }
    })

    if (!nintendoConsoleType) {
      return NextResponse.json(
        { error: 'Nintendo console type not found' },
        { status: 404 }
      )
    }

    const consolesToCreate = [
      { name: 'Gameboy' },
      { name: 'Nintendo DS' },
      { name: 'Nintendo 3DS' }
    ]

    const created = []
    const existing = []
    const errors = []

    for (const consoleData of consolesToCreate) {
      try {
        // Check if console already exists
        const existingConsole = await prisma.console.findUnique({
          where: { name: consoleData.name }
        })

        if (existingConsole) {
          existing.push({
            name: consoleData.name,
            id: existingConsole.id
          })
        } else {
          const newConsole = await prisma.console.create({
            data: {
              name: consoleData.name,
              consoleTypeId: nintendoConsoleType.id
            }
          })
          created.push({
            name: newConsole.name,
            id: newConsole.id
          })
        }
      } catch (error) {
        errors.push({
          name: consoleData.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${consolesToCreate.length} consoles`,
      summary: {
        created: created.length,
        existing: existing.length,
        errors: errors.length
      },
      created,
      existing,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create consoles',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

