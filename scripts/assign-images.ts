import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Normalize names for matching (remove spaces, underscores, make lowercase)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_\s-]+/g, '')
    .replace(/\.(jpg|jpeg|png|webp|avif)$/i, '')
}

// Function to find best match between item name and filename
function findMatch(itemName: string, filenames: string[]): string | null {
  const normalizedItemName = normalizeName(itemName)

  // Try exact match first
  for (const filename of filenames) {
    const normalizedFilename = normalizeName(filename)
    if (normalizedItemName === normalizedFilename) {
      return filename
    }
  }

  // Try partial match (filename contains item name or vice versa)
  for (const filename of filenames) {
    const normalizedFilename = normalizeName(filename)
    if (normalizedFilename.includes(normalizedItemName) ||
        normalizedItemName.includes(normalizedFilename)) {
      return filename
    }
  }

  return null
}

async function assignImages() {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Get all image files from both directories
    const websitePicturesDir = path.join(process.cwd(), 'website pictures')
    const controllersDir = path.join(process.cwd(), 'controllers')

    const consoleImages = fs.existsSync(websitePicturesDir)
      ? fs.readdirSync(websitePicturesDir).filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f))
      : []

    const controllerImages = fs.existsSync(controllersDir)
      ? fs.readdirSync(controllersDir).filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f))
      : []

    console.log(`Found ${consoleImages.length} console images`)
    console.log(`Found ${controllerImages.length} controller images`)

    // Get all items from database
    const items = await prisma.item.findMany({
      include: {
        category: true,
        console: true
      }
    })

    console.log(`Found ${items.length} items in database`)

    let updatedCount = 0
    let notFoundCount = 0

    // Process console items
    const consoleItems = items.filter(item => item.category.name === 'Consoles')
    console.log(`\nProcessing ${consoleItems.length} console items...`)

    for (const item of consoleItems) {
      const matchedFile = findMatch(item.console.name, consoleImages)

      if (matchedFile) {
        // Copy file to uploads if not already there
        const sourcePath = path.join(websitePicturesDir, matchedFile)
        const destFilename = `console_${normalizeName(matchedFile)}${path.extname(matchedFile)}`
        const destPath = path.join(uploadsDir, destFilename)

        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(sourcePath, destPath)
          console.log(`  Copied: ${matchedFile} -> ${destFilename}`)
        }

        // Update database
        const imageUrl = `/uploads/${destFilename}`
        await prisma.item.update({
          where: { id: item.id },
          data: { imageUrl }
        })

        console.log(`  ✓ Updated: ${item.name} (${item.console.name}) -> ${imageUrl}`)
        updatedCount++
      } else {
        console.log(`  ✗ No match found for: ${item.name} (${item.console.name})`)
        notFoundCount++
      }
    }

    // Process controller items
    const controllerItems = items.filter(item => item.category.name === 'Controllers')
    console.log(`\nProcessing ${controllerItems.length} controller items...`)

    for (const item of controllerItems) {
      // Try to match based on console name or item name
      let matchedFile = findMatch(item.console.name, controllerImages)

      if (!matchedFile) {
        matchedFile = findMatch(item.name, controllerImages)
      }

      if (matchedFile) {
        // Copy file to uploads if not already there
        const sourcePath = path.join(controllersDir, matchedFile)
        const destFilename = `controller_${normalizeName(matchedFile)}${path.extname(matchedFile)}`
        const destPath = path.join(uploadsDir, destFilename)

        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(sourcePath, destPath)
          console.log(`  Copied: ${matchedFile} -> ${destFilename}`)
        }

        // Update database
        const imageUrl = `/uploads/${destFilename}`
        await prisma.item.update({
          where: { id: item.id },
          data: { imageUrl }
        })

        console.log(`  ✓ Updated: ${item.name} (${item.console.name}) -> ${imageUrl}`)
        updatedCount++
      } else {
        console.log(`  ✗ No match found for: ${item.name} (${item.console.name})`)
        notFoundCount++
      }
    }

    console.log(`\n=== Summary ===`)
    console.log(`Total items updated: ${updatedCount}`)
    console.log(`Items not matched: ${notFoundCount}`)

  } catch (error) {
    console.error('Error assigning images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignImages()
