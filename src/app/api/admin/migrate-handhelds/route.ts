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

    console.log('🔄 Starting handheld migration to Nintendo console type...')
    
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

    // Find Handhelds category
    const handheldsCategory = await prisma.category.findUnique({
      where: { name: 'Handhelds' }
    })

    if (!handheldsCategory) {
      return NextResponse.json(
        { error: 'Handhelds category not found' },
        { status: 404 }
      )
    }

    // Find all items in Handhelds category
    const handheldItems = await prisma.item.findMany({
      where: {
        categoryId: handheldsCategory.id
      },
      include: {
        console: {
          include: {
            consoleType: true
          }
        }
      }
    })

    if (handheldItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No handheld items to migrate',
        updated: 0,
        skipped: 0
      })
    }

    // Get unique consoles
    const uniqueConsoles = new Map()
    for (const item of handheldItems) {
      const itemConsole = item.console
      if (!uniqueConsoles.has(itemConsole.id)) {
        uniqueConsoles.set(itemConsole.id, itemConsole)
      }
    }

    let updated = 0
    let skipped = 0
    const updatedConsoles: string[] = []
    const skippedConsoles: string[] = []

    // Update each console to be under Nintendo
    for (const [consoleId, itemConsole] of uniqueConsoles) {
      const currentConsoleType = itemConsole.consoleType

      // Skip if already under Nintendo
      if (currentConsoleType.id === nintendoConsoleType.id) {
        skippedConsoles.push(itemConsole.name)
        skipped++
        continue
      }

      // Update the console to be under Nintendo
      await prisma.console.update({
        where: { id: consoleId },
        data: { consoleTypeId: nintendoConsoleType.id }
      })

      updatedConsoles.push(itemConsole.name)
      updated++
    }

    // Verify the migration
    const verifyItems = await prisma.item.findMany({
      where: {
        categoryId: handheldsCategory.id
      },
      include: {
        console: {
          include: {
            consoleType: true
          }
        }
      }
    })

    const itemsUnderNintendo = verifyItems.filter(item => 
      item.console.consoleType.id === nintendoConsoleType.id
    ).length

    return NextResponse.json({
      success: true,
      message: `Migration completed successfully!`,
      summary: {
        totalHandheldItems: handheldItems.length,
        uniqueConsoles: uniqueConsoles.size,
        updated: updated,
        skipped: skipped,
        itemsUnderNintendo: itemsUnderNintendo,
        itemsUnderOther: handheldItems.length - itemsUnderNintendo
      },
      updatedConsoles,
      skippedConsoles
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

