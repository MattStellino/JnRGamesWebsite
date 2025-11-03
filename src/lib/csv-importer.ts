import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { prisma } from './prisma'

export interface CSVItem {
  name: string
  description?: string
  price: number
  imageUrl?: string
  consoleType: string
  console: string
  category: string
  barcode?: string
  condition?: string
  notes?: string
}

export interface ImportResult {
  success: boolean
  imported: number
  updated: number
  errors: string[]
  warnings: string[]
}

export class CSVImporter {
  private csvDirectory = path.join(process.cwd(), 'data', 'csv')

  /**
   * Get list of available CSV files in the data/csv directory
   */
  async getAvailableFiles(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.csvDirectory)) {
        fs.mkdirSync(this.csvDirectory, { recursive: true })
        return []
      }
      
      const files = fs.readdirSync(this.csvDirectory)
      return files.filter(file => file.endsWith('.csv'))
    } catch (error) {
      console.error('Error reading CSV directory:', error)
      return []
    }
  }

  /**
   * Read and parse a CSV file
   */
  async readCSVFile(filename: string): Promise<CSVItem[]> {
    const filePath = path.join(this.csvDirectory, filename)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filename}`)
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        // Convert price to number
        if (context.column === 'price') {
          const num = parseFloat(value.replace(/[$,]/g, ''))
          return isNaN(num) ? 0 : num
        }
        return value
      }
    })

    return records as CSVItem[]
  }

  /**
   * Validate CSV data before import
   */
  validateCSVData(items: CSVItem[]): { valid: CSVItem[], errors: string[] } {
    const valid: CSVItem[] = []
    const errors: string[] = []

    items.forEach((item, index) => {
      const rowErrors: string[] = []

      // Required fields validation
      if (!item.name?.trim()) {
        rowErrors.push('Name is required')
      }
      if (!item.price || item.price <= 0) {
        rowErrors.push('Price must be greater than 0')
      }
      if (!item.consoleType?.trim()) {
        rowErrors.push('Console Type is required')
      }
      if (!item.console?.trim()) {
        rowErrors.push('Console is required')
      }
      if (!item.category?.trim()) {
        rowErrors.push('Category is required')
      }

      // Price validation
      if (item.price && (isNaN(item.price) || item.price < 0)) {
        rowErrors.push('Price must be a valid positive number')
      }

      if (rowErrors.length === 0) {
        valid.push(item)
      } else {
        errors.push(`Row ${index + 2}: ${rowErrors.join(', ')}`)
      }
    })

    return { valid, errors }
  }

  /**
   * Import CSV data to database
   */
  async importCSV(filename: string, options: {
    updateExisting?: boolean
    clearExisting?: boolean
  } = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      updated: 0,
      errors: [],
      warnings: []
    }

    try {
      // Read and validate CSV data
      const csvData = await this.readCSVFile(filename)
      const { valid, errors } = this.validateCSVData(csvData)
      
      if (errors.length > 0) {
        result.errors = errors
        return result
      }

      if (valid.length === 0) {
        result.errors.push('No valid data found in CSV file')
        return result
      }

      // Clear existing data if requested
      if (options.clearExisting) {
        await prisma.item.deleteMany({})
        result.warnings.push('All existing items have been cleared')
      }

      // Process each valid item
      for (const item of valid) {
        try {
          // Find or create console type
          let consoleType = await prisma.consoleType.findUnique({
            where: { name: item.consoleType }
          })
          
          if (!consoleType) {
            consoleType = await prisma.consoleType.create({
              data: { name: item.consoleType }
            })
          }

          // Find or create console
          let console = await prisma.console.findUnique({
            where: { name: item.console }
          })
          
          if (!console) {
            console = await prisma.console.create({
              data: {
                name: item.console,
                consoleTypeId: consoleType.id
              }
            })
          }

          // Find or create category
          let category = await prisma.category.findUnique({
            where: { name: item.category }
          })
          
          if (!category) {
            category = await prisma.category.create({
              data: { name: item.category }
            })
          }

          // Check if item already exists
          const existingItem = await prisma.item.findFirst({
            where: {
              name: item.name,
              consoleId: console.id,
              categoryId: category.id
            }
          })

          if (existingItem) {
            if (options.updateExisting) {
              await prisma.item.update({
                where: { id: existingItem.id },
                data: {
                  description: item.description || existingItem.description,
                  price: item.price,
                  imageUrl: item.imageUrl || existingItem.imageUrl
                }
              })
              result.updated++
            } else {
              result.warnings.push(`Item "${item.name}" already exists and was skipped`)
            }
          } else {
            await prisma.item.create({
              data: {
                name: item.name,
                description: item.description,
                price: item.price,
                imageUrl: item.imageUrl,
                consoleId: console.id,
                categoryId: category.id
              }
            })
            result.imported++
          }
        } catch (itemError) {
          result.errors.push(`Error processing "${item.name}": ${itemError}`)
        }
      }

      result.success = result.errors.length === 0
      return result

    } catch (error) {
      result.errors.push(`Import failed: ${error}`)
      return result
    }
  }

  /**
   * Create a sample CSV template
   */
  async createSampleCSV(): Promise<void> {
    const sampleData = [
      {
        name: 'PlayStation 5 Console',
        description: 'Sony PlayStation 5 gaming console',
        price: 450.00,
        imageUrl: 'https://example.com/ps5.jpg',
        consoleType: 'PlayStation',
        console: 'PlayStation 5',
        category: 'Consoles',
        barcode: '711719512000',
        condition: 'Good',
        notes: 'Includes controller and cables'
      },
      {
        name: 'The Legend of Zelda: Breath of the Wild',
        description: 'Nintendo Switch game',
        price: 35.00,
        imageUrl: 'https://example.com/zelda.jpg',
        consoleType: 'Nintendo',
        console: 'Nintendo Switch',
        category: 'Games',
        barcode: '045496880000',
        condition: 'Excellent',
        notes: 'Complete in box'
      }
    ]

    const csvContent = this.convertToCSV(sampleData)
    const filePath = path.join(this.csvDirectory, 'sample-template.csv')
    
    fs.writeFileSync(filePath, csvContent)
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || ''
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    }
    
    return csvRows.join('\n')
  }
}

export const csvImporter = new CSVImporter()
