const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function findWiiConsoles() {
  try {
    console.log('🔍 Finding all consoles with "Wii" in the name...\n')
    
    // Find all consoles
    const allConsoles = await prisma.console.findMany({
      include: {
        consoleType: true,
        items: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Filter for Wii consoles
    const wiiConsoles = allConsoles.filter(c => 
      c.name.toLowerCase().includes('wii')
    )

    if (wiiConsoles.length === 0) {
      console.log('ℹ️  No consoles with "Wii" in the name found.')
      return
    }

    console.log(`📦 Found ${wiiConsoles.length} console(s) with "Wii" in the name:\n`)

    wiiConsoles.forEach(itemConsole => {
      console.log(`   "${itemConsole.name}" (ID: ${itemConsole.id})`)
      console.log(`   Console Type: ${itemConsole.consoleType.name}`)
      console.log(`   Items using this console: ${itemConsole.items.length}`)
      if (itemConsole.items.length > 0) {
        console.log(`   Items:`)
        itemConsole.items.forEach(item => {
          console.log(`      - "${item.name}" (${item.category.name})`)
        })
      }
      console.log('')
    })

    // Check if there's one just called "Wii"
    const justWii = wiiConsoles.find(c => c.name.toLowerCase() === 'wii')
    if (justWii) {
      console.log(`\n🎯 Found console named exactly "Wii" (ID: ${justWii.id})`)
      if (justWii.items.length === 0) {
        console.log(`✅ Safe to delete - no items using it`)
      } else {
        console.log(`⚠️  Has ${justWii.items.length} items - need to handle them first`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

findWiiConsoles()

