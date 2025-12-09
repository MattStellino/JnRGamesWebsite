const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateHandheldsToNintendo() {
  try {
    console.log('🔄 Starting handheld migration to Nintendo console type...')
    
    // Find Nintendo console type
    const nintendoConsoleType = await prisma.consoleType.findUnique({
      where: { name: 'Nintendo' }
    })

    if (!nintendoConsoleType) {
      console.error('❌ Nintendo console type not found. Please run the main migration first.')
      process.exit(1)
    }

    console.log(`✅ Found Nintendo console type (ID: ${nintendoConsoleType.id})`)

    // Find Handhelds category
    const handheldsCategory = await prisma.category.findUnique({
      where: { name: 'Handhelds' }
    })

    if (!handheldsCategory) {
      console.error('❌ Handhelds category not found.')
      process.exit(1)
    }

    console.log(`✅ Found Handhelds category (ID: ${handheldsCategory.id})`)

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

    console.log(`📦 Found ${handheldItems.length} handheld items`)

    if (handheldItems.length === 0) {
      console.log('ℹ️  No handheld items to migrate')
      return
    }

    // Get unique consoles from handheld items
    const uniqueConsoles = new Map()
    for (const item of handheldItems) {
      const itemConsole = item.console
      if (!uniqueConsoles.has(itemConsole.id)) {
        uniqueConsoles.set(itemConsole.id, itemConsole)
      }
    }

    console.log(`🎮 Found ${uniqueConsoles.size} unique consoles linked to handheld items`)

    let updated = 0
    let skipped = 0

    // Update each console to be under Nintendo
    for (const [consoleId, itemConsole] of uniqueConsoles) {
      const currentConsoleType = itemConsole.consoleType

      // Skip if already under Nintendo
      if (currentConsoleType.id === nintendoConsoleType.id) {
        console.log(`⏭️  Skipping console "${itemConsole.name}" - already under Nintendo`)
        skipped++
        continue
      }

      // Update the console to be under Nintendo
      await prisma.console.update({
        where: { id: consoleId },
        data: { consoleTypeId: nintendoConsoleType.id }
      })

      console.log(`✅ Updated console "${itemConsole.name}" to Nintendo console type`)
      updated++
    }

    // Count items that were moved
    const itemsMoved = handheldItems.filter(item => {
      const consoleType = item.console.consoleType
      return consoleType.id === nintendoConsoleType.id || 
             uniqueConsoles.get(item.console.id)?.consoleType?.id === nintendoConsoleType.id
    }).length

    console.log('\n📊 Migration Summary:')
    console.log(`   ✅ Updated: ${updated} consoles to Nintendo`)
    console.log(`   📦 Items moved: ${itemsMoved} handheld items`)
    console.log(`   ⏭️  Skipped: ${skipped} consoles (already under Nintendo)`)
    console.log('🎉 Handheld migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateHandheldsToNintendo()

