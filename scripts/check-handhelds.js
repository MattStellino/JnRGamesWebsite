const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkHandhelds() {
  try {
    console.log('🔍 Checking handheld items and their console types...\n')
    
    // Find Handhelds category
    const handheldsCategory = await prisma.category.findUnique({
      where: { name: 'Handhelds' }
    })

    if (!handheldsCategory) {
      console.error('❌ Handhelds category not found.')
      process.exit(1)
    }

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
        },
        category: true
      }
    })

    console.log(`📦 Found ${handheldItems.length} handheld items:\n`)

    // Group by console type
    const byConsoleType = {}
    
    for (const item of handheldItems) {
      const consoleTypeName = item.console.consoleType.name
      if (!byConsoleType[consoleTypeName]) {
        byConsoleType[consoleTypeName] = []
      }
      byConsoleType[consoleTypeName].push({
        item: item.name,
        console: item.console.name,
        consoleType: consoleTypeName
      })
    }

    // Display results
    for (const [consoleType, items] of Object.entries(byConsoleType)) {
      console.log(`\n🎮 ${consoleType} (${items.length} items):`)
      for (const { item, console: consoleName } of items) {
        console.log(`   - ${item} (Console: ${consoleName})`)
      }
    }

    // Check Nintendo console type
    const nintendoConsoleType = await prisma.consoleType.findUnique({
      where: { name: 'Nintendo' },
      include: {
        consoles: {
          include: {
            items: {
              where: {
                categoryId: handheldsCategory.id
              }
            }
          }
        }
      }
    })

    if (nintendoConsoleType) {
      console.log(`\n\n✅ Nintendo Console Type (ID: ${nintendoConsoleType.id}):`)
      console.log(`   Total consoles: ${nintendoConsoleType.consoles.length}`)
      
      const handheldConsoles = nintendoConsoleType.consoles.filter(c => 
        c.items.some(i => i.categoryId === handheldsCategory.id)
      )
      
      console.log(`   Consoles with handheld items: ${handheldConsoles.length}`)
      for (const itemConsole of handheldConsoles) {
        const handheldCount = itemConsole.items.filter(i => i.categoryId === handheldsCategory.id).length
        console.log(`   - ${itemConsole.name} (${handheldCount} handheld items)`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkHandhelds()

