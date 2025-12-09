const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function findOtherConsoleDuplicates() {
  try {
    console.log('🔍 Finding games under "Other" console type that have duplicates...\n')
    
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

    // Find all games under "Other" console type
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

    console.log(`📦 Found ${otherGames.length} games under "Other" console type\n`)

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
        },
        category: true
      }
    })

    // Find duplicates - games under "Other" that have the same name under a different console type
    const toDelete = []
    const toKeep = []

    for (const otherGame of otherGames) {
      // Find games with same name but different console type (not "Other")
      const duplicates = allGames.filter(game => 
        game.id !== otherGame.id &&
        game.name.toLowerCase().trim() === otherGame.name.toLowerCase().trim() &&
        game.console.consoleType.name !== 'Other'
      )

      if (duplicates.length > 0) {
        console.log(`\n🔴 DUPLICATE FOUND: "${otherGame.name}"`)
        console.log(`   ❌ DELETE - Under "Other - ${otherGame.console.name}" (ID: ${otherGame.id})`)
        console.log(`   ✅ KEEP - Under "${duplicates[0].console.consoleType.name} - ${duplicates[0].console.name}" (ID: ${duplicates[0].id})`)
        toDelete.push(otherGame)
      } else {
        console.log(`\n✅ KEEP: "${otherGame.name}" - No duplicate found under correct console type`)
        toKeep.push(otherGame)
      }
    }

    console.log(`\n\n📊 Summary:`)
    console.log(`   Games under "Other": ${otherGames.length}`)
    console.log(`   To delete (have duplicates): ${toDelete.length}`)
    console.log(`   To keep (no duplicates): ${toKeep.length}`)

    if (toDelete.length > 0) {
      console.log(`\n\n⚠️  Items that will be deleted:`)
      toDelete.forEach(item => {
        console.log(`   - ID ${item.id}: "${item.name}" (Other - ${item.console.name})`)
      })
    }

    return { toDelete, toKeep }
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

findOtherConsoleDuplicates().then(result => {
  if (result && result.toDelete.length > 0) {
    console.log(`\n\n💡 To delete these items, run:`)
    console.log(`   node scripts/delete-other-console-duplicates.js`)
  }
})

