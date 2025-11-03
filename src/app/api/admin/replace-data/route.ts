import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { csvReplacer } from '@/lib/csv-replacer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { confirmReplace } = body

    if (!confirmReplace) {
      return NextResponse.json(
        { error: 'Replacement requires confirmation' },
        { status: 400 }
      )
    }

    const result = await csvReplacer.replaceAllData()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully replaced all data! Imported ${result.imported} items.`,
        imported: result.imported,
        errors: result.errors
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Data replacement failed',
        imported: result.imported,
        errors: result.errors
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error replacing data:', error)
    return NextResponse.json(
      { error: 'Failed to replace data' },
      { status: 500 }
    )
  }
}
