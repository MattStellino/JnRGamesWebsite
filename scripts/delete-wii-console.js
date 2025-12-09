const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteWiiConsole() {
  try {
    console.log('🗑️  Deleting console named "Wii"...\n')
    
    // Find console named exactly "Wii" (case-insensitive)
    const wiiConsole = await prisma.console.findFirst({
      where: {
        name: {
          equals: 'Wii',
          mode: 'insensitive'
        }
      },
      include: {
        consoleType: true,
        items: {
          include: {
            category: true
          }
        }
      }
    })

    if (!wiiConsole) {
      console.log('ℹ️  No console named "Wii" found.')
      return
    }

    console.log(`📦 Found "Wii" console:`)
    console.log(`   ID: ${wiiConsole.id}`)
    console.log(`   Console Type: ${wiiConsole.consoleType.name}`)
    console.log(`   Items using this console: ${wiiConsole.items.length}\n`)

    if (wiiConsole.items.length > 0) {
      console.log(`⚠️  WARNING: This console has ${wiiConsole.items.length} items:`)
      wiiConsole.items.forEach(item => {
        console.log(`   - "${item.name}" (${item.category.name})`)
      })
      console.log(`\n⚠️  These items will be DELETED along with the console!`)
      console.log(`   This action cannot be undone!\n`)
      
      // For safety, we'll just report - user should delete items first or reassign them
      console.log(`\n❌ Cannot delete console with items. Please:`)
      console.log(`   1. Delete or reassign the items first`)
      console.log(`   2. Then delete the console`)
      return
    }

    console.log(`✅ No items using this console - safe to delete\n`)
    console.log(`⚠️  About to delete console "Wii" (ID: ${wiiConsole.id})...`)

    await prisma.console.delete({
      where: { id: wiiConsole.id }
    })

    console.log(`✅ Successfully deleted console "Wii"`)
    console.log('🎉 Done!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

deleteWiiConsole()

