import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { csvImporter } from '@/lib/csv-importer'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const files = await csvImporter.getAvailableFiles()
    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error getting CSV files:', error)
    return NextResponse.json(
      { error: 'Failed to get CSV files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { filename, options = {} } = body

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    // Validate options
    const importOptions = {
      updateExisting: Boolean(options.updateExisting),
      clearExisting: Boolean(options.clearExisting)
    }

    // Prevent dangerous operations without explicit confirmation
    if (importOptions.clearExisting && !options.confirmClear) {
      return NextResponse.json(
        { error: 'Clear existing data requires confirmation' },
        { status: 400 }
      )
    }

    const result = await csvImporter.importCSV(filename, importOptions)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error importing CSV:', error)
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create sample CSV template
    await csvImporter.createSampleCSV()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sample CSV template created successfully' 
    })
  } catch (error) {
    console.error('Error creating sample CSV:', error)
    return NextResponse.json(
      { error: 'Failed to create sample CSV' },
      { status: 500 }
    )
  }
}
