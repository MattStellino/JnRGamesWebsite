const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteOtherConsoleDuplicates() {
  try {
    console.log('🗑️  Deleting games under "Other" console type that have duplicates...\n')
    
    // Find "Other" console type
    const otherConsoleType = await prisma.consoleType.findUnique({
      where: { name: 'Other' },
      include: {
        consoles: {
          include: {
            items: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    if (!otherConsoleType) {
      console.log('ℹ️  "Other" console type not found.')
      return
    }

    // Find Games category
    const gamesCategory = await prisma.category.findUnique({
      where: { name: 'Games' }
    })

    if (!gamesCategory) {
      console.error('❌ Games category not found.')
      process.exit(1)
    }

    // Get all games under "Other" console type
    const otherGames = []
    for (const console of otherConsoleType.consoles) {
      for (const item of console.items) {
        if (item.categoryId === gamesCategory.id) {
          otherGames.push({
            ...item,
            console: console
          })
        }
      }
    }

    if (otherGames.length === 0) {
      console.log('✅ No games found under "Other" console type.')
      return
    }

    // Get all games to check for duplicates
    const allGames = await prisma.item.findMany({
      where: {
        categoryId: gamesCategory.id
      },
      include: {
        console: {
          include: {
            consoleType: true
          }
        }
      }
    })

    // Find duplicates - games under "Other" that have the same name under a different console type
    const toDelete = []

    for (const otherGame of otherGames) {
      // Find games with same name but different console type (not "Other")
      const duplicates = allGames.filter(game => 
        game.id !== otherGame.id &&
        game.name.toLowerCase().trim() === otherGame.name.toLowerCase().trim() &&
        game.console.consoleType.name !== 'Other'
      )

      if (duplicates.length > 0) {
        toDelete.push(otherGame)
      }
    }

    if (toDelete.length === 0) {
      console.log('✅ No duplicate games under "Other" console type found to delete.')
      return
    }

    console.log(`📋 Found ${toDelete.length} games under "Other" to delete:\n`)
    toDelete.forEach(item => {
      console.log(`   - ID ${item.id}: "${item.name}" (Other - ${item.console.name})`)
    })

    console.log(`\n⚠️  About to delete ${toDelete.length} items...`)
    console.log('   This action cannot be undone!\n')

    // Delete the items
    let deleted = 0
    for (const item of toDelete) {
      try {
        await prisma.item.delete({
          where: { id: item.id }
        })
        console.log(`✅ Deleted ID ${item.id}: "${item.name}"`)
        deleted++
      } catch (error) {
        console.error(`❌ Failed to delete ID ${item.id}:`, error.message)
      }
    }

    console.log(`\n\n📊 Summary:`)
    console.log(`   ✅ Successfully deleted: ${deleted} items`)
    console.log(`   ❌ Failed: ${toDelete.length - deleted} items`)
    console.log('🎉 Cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

deleteOtherConsoleDuplicates()

