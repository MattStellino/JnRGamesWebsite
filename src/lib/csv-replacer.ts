import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { prisma } from './prisma'

interface ConsoleItem {
  name: string
  sku: string
  consoleOnlyPrice: string
  consoleWithController: string
  completeConsole: string
  specialNotes: string
}

interface ControllerItem {
  name: string
  sku: string
  acceptableCondition: string
  goodCondition: string
}

interface HandheldItem {
  name: string
  sku: string
  acceptableCondition: string
  goodCondition: string
  specialNotes: string
}

export class CSVReplacer {
  private csvDirectory = process.cwd()

  /**
   * Parse price string and return numeric value
   */
  private parsePrice(priceStr: string): number | null {
    if (!priceStr || priceStr.trim() === '' || priceStr.toLowerCase() === 'contact' || priceStr.toLowerCase() === 'n/a') {
      return null
    }
    
    // Remove $ and any other non-numeric characters except decimal point
    const cleaned = priceStr.replace(/[$,]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num
  }

  /**
   * Parse console CSV file
   */
  private parseConsoleCSV(): ConsoleItem[] {
    const filePath = path.join(this.csvDirectory, 'Console Website CSV - Sheet1.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    return records.map((record: any) => ({
      name: record.Name || '',
      sku: record.SKU || '',
      consoleOnlyPrice: record['Console Only Price'] || '',
      consoleWithController: record['Console With Controller'] || '',
      completeConsole: record['Complete Console'] || '',
      specialNotes: record['Special Notes'] || ''
    }))
  }

  /**
   * Parse controller CSV file
   */
  private parseControllerCSV(): ControllerItem[] {
    const filePath = path.join(this.csvDirectory, 'Controller & Accesories Website CSV - Sheet1.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    return records.map((record: any) => ({
      name: record.Name || '',
      sku: record.SKU || '',
      acceptableCondition: record['Acceptable Condition'] || '',
      goodCondition: record['Good Condition'] || ''
    }))
  }

  /**
   * Parse handheld CSV file
   */
  private parseHandheldCSV(): HandheldItem[] {
    const filePath = path.join(this.csvDirectory, 'Handheld Website CSV - Sheet1.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    return records.map((record: any) => ({
      name: record.Name || '',
      sku: record.SKU || '',
      acceptableCondition: record['Accecptable Condition'] || '', // Note: typo in original CSV
      goodCondition: record['Good Condition'] || '',
      specialNotes: record['Special Notes'] || ''
    }))
  }

  /**
   * Determine console type from item name
   */
  private getConsoleTypeFromName(name: string, type: 'console' | 'controller' | 'handheld'): string {
    const lowerName = name.toLowerCase()
    
    // Handhelds don't have console types - they use the handheld category only
    if (type === 'handheld') {
      return 'Other' // Use Other as console type for handhelds
    }
    
    // For non-handheld items, check console types
    if (lowerName.includes('ps2') || lowerName.includes('ps3') || lowerName.includes('ps4') || lowerName.includes('ps5') || lowerName.includes('playstation')) {
      return 'PlayStation'
    } else if (lowerName.includes('xbox')) {
      return 'Xbox'
    } else if (lowerName.includes('nintendo') || lowerName.includes('wii')) {
      return 'Nintendo'
    } else {
      return 'Other'
    }
  }

  /**
   * Determine console name from item name
   */
  private getConsoleFromName(name: string, type: 'console' | 'controller' | 'handheld'): string {
    const lowerName = name.toLowerCase()
    
    // Handheld devices get specific console names
    if (type === 'handheld') {
      if (lowerName.includes('gameboy color')) return 'Game Boy Color'
      if (lowerName.includes('gameboy advance')) return 'Game Boy Advance'
      if (lowerName.includes('gameboy advance sp')) return 'Game Boy Advance SP'
      if (lowerName.includes('nintendo ds lite')) return 'Nintendo DS Lite'
      if (lowerName.includes('nintendo dsi')) return 'Nintendo DSi'
      if (lowerName.includes('nintendo dsi xl')) return 'Nintendo DSi XL'
      if (lowerName.includes('nintendo 3ds')) return 'Nintendo 3DS'
      if (lowerName.includes('nintendo new 3ds')) return 'Nintendo New 3DS'
      if (lowerName.includes('nintendo 2ds')) return 'Nintendo 2DS'
      if (lowerName.includes('nintendo new 2ds')) return 'Nintendo New 2DS XL'
      return 'Handheld Device'
    }
    
    if (lowerName.includes('ps5')) return 'PlayStation 5'
    if (lowerName.includes('ps4')) return 'PlayStation 4'
    if (lowerName.includes('ps3')) return 'PlayStation 3'
    if (lowerName.includes('ps2')) return 'PlayStation 2'
    if (lowerName.includes('xbox series')) return 'Xbox Series X/S'
    if (lowerName.includes('xbox one')) return 'Xbox One'
    if (lowerName.includes('xbox 360')) return 'Xbox 360'
    if (lowerName.includes('switch')) return 'Nintendo Switch'
    if (lowerName.includes('wii')) return 'Nintendo Wii'
    if (lowerName.includes('gamecube')) return 'Nintendo GameCube'
    
    return 'Other'
  }

  /**
   * Determine category from item name and type
   */
  private getCategoryFromName(name: string, type: 'console' | 'controller' | 'handheld'): string {
    const lowerName = name.toLowerCase()
    
    if (type === 'console') {
      return 'Consoles'
    } else if (type === 'controller') {
      if (lowerName.includes('controller')) return 'Controllers'
      if (lowerName.includes('remote')) return 'Controllers'
      if (lowerName.includes('joy-con')) return 'Controllers'
      return 'Accessories'
    } else if (type === 'handheld') {
      return 'Handhelds'
    }
    
    return 'Other'
  }

  /**
   * Create or get console type
   */
  private async getOrCreateConsoleType(name: string) {
    let consoleType = await prisma.consoleType.findUnique({
      where: { name }
    })
    
    if (!consoleType) {
      consoleType = await prisma.consoleType.create({
        data: { name }
      })
    }
    
    return consoleType
  }

  /**
   * Create or get console
   */
  private async getOrCreateConsole(name: string, consoleTypeId: number) {
    let console = await prisma.console.findUnique({
      where: { name }
    })
    
    if (!console) {
      console = await prisma.console.create({
        data: {
          name,
          consoleTypeId
        }
      })
    }
    
    return console
  }

  /**
   * Create or get category
   */
  private async getOrCreateCategory(name: string) {
    let category = await prisma.category.findUnique({
      where: { name }
    })
    
    if (!category) {
      category = await prisma.category.create({
        data: { name }
      })
    }
    
    return category
  }

  /**
   * Replace all data with CSV data
   */
  async replaceAllData(): Promise<{
    success: boolean
    imported: number
    errors: string[]
  }> {
    const result = {
      success: false,
      imported: 0,
      errors: [] as string[]
    }

    try {

      // 1. Clear all existing data
      await prisma.item.deleteMany({})
      await prisma.console.deleteMany({})
      await prisma.consoleType.deleteMany({})
      await prisma.category.deleteMany({})

      // 2. Parse CSV files
      const consoleItems = this.parseConsoleCSV()
      const controllerItems = this.parseControllerCSV()
      const handheldItems = this.parseHandheldCSV()


      // 3. Process console items
      for (const item of consoleItems) {
        try {
          if (!item.name.trim()) continue

          const consoleTypeName = this.getConsoleTypeFromName(item.name, 'console')
          const consoleName = this.getConsoleFromName(item.name, 'console')
          const categoryName = this.getCategoryFromName(item.name, 'console')

          const consoleType = await this.getOrCreateConsoleType(consoleTypeName)
          const console = await this.getOrCreateConsole(consoleName, consoleType.id)
          const category = await this.getOrCreateCategory(categoryName)

          // Create single item with console pricing (Complete first, then Controller, then Only)
          const consoleOnlyPrice = this.parsePrice(item.consoleOnlyPrice)
          const consoleWithControllerPrice = this.parsePrice(item.consoleWithController)
          const completeConsolePrice = this.parsePrice(item.completeConsole)
          
          // Complete console is the highest price for display
          const displayPrice = completeConsolePrice || consoleWithControllerPrice || consoleOnlyPrice || 0

          if (displayPrice > 0) {
            await prisma.item.create({
              data: {
                name: item.name,
                description: item.specialNotes || `Console item for ${consoleName}`,
                price: displayPrice, // Complete console price (highest)
                consoleOnlyPrice: consoleOnlyPrice,
                consoleWithController: consoleWithControllerPrice,
                completeConsolePrice: completeConsolePrice,
                consoleId: console.id,
                categoryId: category.id
              }
            })
            result.imported++
          }
        } catch (error) {
          result.errors.push(`Error processing console item "${item.name}": ${error}`)
        }
      }

      // 4. Process controller items
      for (const item of controllerItems) {
        try {
          if (!item.name.trim()) continue

          const consoleTypeName = this.getConsoleTypeFromName(item.name, 'controller')
          const consoleName = this.getConsoleFromName(item.name, 'controller')
          const categoryName = this.getCategoryFromName(item.name, 'controller')

          const consoleType = await this.getOrCreateConsoleType(consoleTypeName)
          const console = await this.getOrCreateConsole(consoleName, consoleType.id)
          const category = await this.getOrCreateCategory(categoryName)

          // Create single item with condition pricing (Good first, then Acceptable)
          const acceptablePrice = this.parsePrice(item.acceptableCondition)
          const goodPrice = this.parsePrice(item.goodCondition)
          
          // Good condition is the display price (highest)
          const displayPrice = goodPrice || acceptablePrice || 0

          if (displayPrice > 0) {
            await prisma.item.create({
              data: {
                name: item.name,
                description: `Controller for ${consoleName}`,
                price: displayPrice, // Good condition price (highest)
                acceptablePrice: acceptablePrice,
                goodPrice: goodPrice,
                consoleId: console.id,
                categoryId: category.id
              }
            })
            result.imported++
          }
        } catch (error) {
          result.errors.push(`Error processing controller item "${item.name}": ${error}`)
        }
      }

      // 5. Process handheld items
      for (const item of handheldItems) {
        try {
          if (!item.name.trim()) continue

          const consoleTypeName = this.getConsoleTypeFromName(item.name, 'handheld')
          const consoleName = this.getConsoleFromName(item.name, 'handheld')
          const categoryName = this.getCategoryFromName(item.name, 'handheld')

          const consoleType = await this.getOrCreateConsoleType(consoleTypeName)
          const console = await this.getOrCreateConsole(consoleName, consoleType.id)
          const category = await this.getOrCreateCategory(categoryName)

          // Create single item with condition pricing (Good first, then Acceptable)
          const acceptablePrice = this.parsePrice(item.acceptableCondition)
          const goodPrice = this.parsePrice(item.goodCondition)
          
          // Good condition is the display price (highest)
          const displayPrice = goodPrice || acceptablePrice || 0

          if (displayPrice > 0) {
            await prisma.item.create({
              data: {
                name: item.name,
                description: item.specialNotes || `Handheld gaming device`,
                price: displayPrice, // Good condition price (highest)
                acceptablePrice: acceptablePrice,
                goodPrice: goodPrice,
                consoleId: console.id,
                categoryId: category.id
              }
            })
            result.imported++
          }
        } catch (error) {
          result.errors.push(`Error processing handheld item "${item.name}": ${error}`)
        }
      }

      result.success = true

    } catch (error) {
      result.errors.push(`Fatal error during replacement: ${error}`)
      console.error('Fatal error during data replacement:', error)
    }

    return result
  }
}

export const csvReplacer = new CSVReplacer()
