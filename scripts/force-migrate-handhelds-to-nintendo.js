const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function forceMigrateHandheldsToNintendo() {
  try {
    console.log('🔄 Force migrating ALL handhelds to Nintendo console type...\n')
    
    // Find Nintendo console type
    const nintendoConsoleType = await prisma.consoleType.findUnique({
      where: { name: 'Nintendo' }
    })

    if (!nintendoConsoleType) {
      console.error('❌ Nintendo console type not found. Please run the main migration first.')
      process.exit(1)
    }

    console.log(`✅ Found Nintendo console type (ID: ${nintendoConsoleType.id})\n`)

    // Find Handhelds category
    const handheldsCategory = await prisma.category.findUnique({
      where: { name: 'Handhelds' }
    })

    if (!handheldsCategory) {
      console.error('❌ Handhelds category not found.')
      process.exit(1)
    }

    console.log(`✅ Found Handhelds category (ID: ${handheldsCategory.id})\n`)

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

    console.log(`📦 Found ${handheldItems.length} handheld items\n`)

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

    console.log(`🎮 Found ${uniqueConsoles.size} unique consoles linked to handheld items\n`)

    let updated = 0
    let skipped = 0

    // Update each console to be under Nintendo - FORCE IT
    for (const [consoleId, itemConsole] of uniqueConsoles) {
      const currentConsoleType = itemConsole.consoleType

      // Skip if already under Nintendo
      if (currentConsoleType.id === nintendoConsoleType.id) {
        console.log(`⏭️  Skipping console "${itemConsole.name}" - already under Nintendo`)
        skipped++
        continue
      }

      // FORCE update the console to be under Nintendo
      await prisma.console.update({
        where: { id: consoleId },
        data: { consoleTypeId: nintendoConsoleType.id }
      })

      console.log(`✅ FORCED console "${itemConsole.name}" from ${currentConsoleType.name} to Nintendo`)
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

    const itemsUnderOther = verifyItems.filter(item => 
      item.console.consoleType.name === 'Other'
    ).length

    console.log('\n📊 Migration Summary:')
    console.log(`   ✅ Updated: ${updated} consoles to Nintendo`)
    console.log(`   ⏭️  Skipped: ${skipped} consoles (already under Nintendo)`)
    console.log(`\n📦 Verification:`)
    console.log(`   ✅ Items under Nintendo: ${itemsUnderNintendo}/${handheldItems.length}`)
    if (itemsUnderOther > 0) {
      console.log(`   ⚠️  Items still under Other: ${itemsUnderOther}`)
      console.log(`\n❌ WARNING: Some items are still under Other!`)
    } else {
      console.log(`   ✅ No items under Other - All handhelds are now under Nintendo!`)
    }
    console.log('\n🎉 Handheld migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

forceMigrateHandheldsToNintendo()

