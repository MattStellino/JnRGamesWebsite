import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Manual mappings for items that didn't auto-match
const manualMappings = [
  // Console mappings
  {
    itemNameContains: 'Sony PS2',
    categoryName: 'Consoles',
    sourceDir: 'website pictures',
    sourceFile: 'sony_ps2_fat.jpg',
    destFile: 'console_sony_ps2_fat.jpg'
  },
  {
    itemNameContains: 'Xbox Series S',
    categoryName: 'Consoles',
    sourceDir: 'website pictures',
    sourceFile: 'xbox_series_s.jpg',
    destFile: 'console_xbox_series_s.jpg'
  },
  {
    itemNameContains: 'PS3 Super Slim 250GB',
    categoryName: 'Consoles',
    sourceDir: 'website pictures',
    sourceFile: 'ps3 superslim_250gb.jpg',
    destFile: 'console_ps3_superslim_250gb.jpg'
  },
  {
    itemNameContains: 'PS3 Super Slim 500GB',
    categoryName: 'Consoles',
    sourceDir: 'website pictures',
    sourceFile: 'ps3_superslim_500gb.jpg',
    destFile: 'console_ps3_superslim_500gb.jpg'
  },
  // Controller mappings
  {
    itemNameContains: 'Switch Joy-Cons',
    categoryName: 'Controllers',
    sourceDir: 'controllers',
    sourceFile: 'nintedo_switch_joycons.avif',
    destFile: 'controller_nintendo_switch_joycons.avif'
  }
]

async function assignRemainingImages() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    let updatedCount = 0

    for (const mapping of manualMappings) {
      // Find the item in database
      const items = await prisma.item.findMany({
        where: {
          name: {
            contains: mapping.itemNameContains,
            mode: 'insensitive'
          },
          category: {
            name: mapping.categoryName
          }
        },
        include: {
          category: true,
          console: true
        }
      })

      if (items.length === 0) {
        console.log(`  ✗ Item not found: ${mapping.itemNameContains}`)
        continue
      }

      // Copy file to uploads
      const sourcePath = path.join(process.cwd(), mapping.sourceDir, mapping.sourceFile)
      const destPath = path.join(uploadsDir, mapping.destFile)

      if (fs.existsSync(sourcePath)) {
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(sourcePath, destPath)
          console.log(`  Copied: ${mapping.sourceFile} -> ${mapping.destFile}`)
        }

        const imageUrl = `/uploads/${mapping.destFile}`

        // Update all matching items
        for (const item of items) {
          await prisma.item.update({
            where: { id: item.id },
            data: { imageUrl }
          })

          console.log(`  ✓ Updated: ${item.name} (${item.console.name}) -> ${imageUrl}`)
          updatedCount++
        }
      } else {
        console.log(`  ✗ Source file not found: ${sourcePath}`)
      }
    }

    console.log(`\n=== Summary ===`)
    console.log(`Total items updated: ${updatedCount}`)

  } catch (error) {
    console.error('Error assigning remaining images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignRemainingImages()
