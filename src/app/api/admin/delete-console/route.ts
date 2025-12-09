import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const consoleName = searchParams.get('name')

    if (!consoleName) {
      return NextResponse.json(
        { error: 'Console name is required' },
        { status: 400 }
      )
    }

    // Find console by name (case-insensitive)
    const itemConsole = await prisma.console.findFirst({
      where: {
        name: {
          equals: consoleName,
          mode: 'insensitive'
        }
      },
      include: {
        consoleType: true,
        items: {
          include: {
            category: true
          }
        }
      }
    })

    if (!itemConsole) {
      return NextResponse.json(
        { error: `Console "${consoleName}" not found` },
        { status: 404 }
      )
    }

    // Check if console has items
    if (itemConsole.items.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete console "${consoleName}" because it has ${itemConsole.items.length} item(s) associated with it. Please delete or reassign the items first.`,
          items: itemConsole.items.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category.name
          }))
        },
        { status: 400 }
      )
    }

    // Delete the console
    await prisma.console.delete({
      where: { id: itemConsole.id }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted console "${itemConsole.name}"`,
      deletedConsole: {
        id: itemConsole.id,
        name: itemConsole.name,
        consoleType: itemConsole.consoleType.name
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete console',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

