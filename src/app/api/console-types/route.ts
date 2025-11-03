import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { sanitizeInput } from '@/lib/security'

export async function GET() {
  try {
    const consoleTypes = await prisma.consoleType.findMany({
      include: {
        consoles: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(consoleTypes)
  } catch (error) {
    console.error('Error fetching console types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch console types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authCheck = await requireAuth()
    if (authCheck.error) return authCheck.error

    const body = await request.json()
    const rawName = body.name

    if (!rawName || typeof rawName !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      )
    }

    // Sanitize input
    const name = sanitizeInput(rawName.trim())

    if (!name || name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    const consoleType = await prisma.consoleType.create({
      data: {
        name
      }
    })

    return NextResponse.json(consoleType, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Console type with this name already exists' },
        { status: 409 }
      )
    }
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Failed to create console type' },
      { status: 500 }
    )
  }
}

