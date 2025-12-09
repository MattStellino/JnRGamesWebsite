const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteDuplicateGames() {
  try {
    console.log('🗑️  Deleting duplicate games with "Complete in Box"...\n')
    
    // Find Games category
    const gamesCategory = await prisma.category.findUnique({
      where: { name: 'Games' }
    })

    if (!gamesCategory) {
      console.error('❌ Games category not found.')
      process.exit(1)
    }

    // Find all games
    const allGames = await prisma.item.findMany({
      where: {
        categoryId: gamesCategory.id
      },
      include: {
        console: true,
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Group games by name (case-insensitive) and console
    const gameGroups = new Map()
    
    for (const game of allGames) {
      const key = `${game.name.toLowerCase()}_${game.consoleId}`
      if (!gameGroups.has(key)) {
        gameGroups.set(key, [])
      }
      gameGroups.get(key).push(game)
    }

    // Find duplicates to delete
    const toDelete = []

    for (const [key, games] of gameGroups) {
      if (games.length > 1) {
        // Check which games show "Complete in Box" only vs "Game Only"
        const completeInBoxOnly = []
        const hasGameOnly = []

        games.forEach(game => {
          const isClassicNintendo = ['NES', 'SNES', 'Nintendo 64'].includes(game.console.name)
          
          // For modern systems: Complete in Box only if price exists but no goodPrice/acceptablePrice
          // For classic: they always show "Game Only"
          const showsOnlyCompleteInBox = !isClassicNintendo && 
            game.price > 0 && 
            !game.goodPrice && 
            !game.acceptablePrice &&
            (!game.description || !game.description.toLowerCase().includes('game only'))
          
          const showsGameOnly = isClassicNintendo ||
            (game.goodPrice && game.goodPrice > 0) ||
            (game.acceptablePrice && game.acceptablePrice > 0) ||
            (game.description && game.description.toLowerCase().includes('game only'))
          
          if (showsOnlyCompleteInBox && !showsGameOnly) {
            completeInBoxOnly.push(game)
          } else if (showsGameOnly) {
            hasGameOnly.push(game)
          }
        })

        // Only delete if we have both types and at least one "Game Only" to keep
        if (completeInBoxOnly.length > 0 && hasGameOnly.length > 0) {
          toDelete.push(...completeInBoxOnly)
        }
      }
    }

    if (toDelete.length === 0) {
      console.log('✅ No duplicate games with "Complete in Box" found to delete.')
      return
    }

    console.log(`📋 Found ${toDelete.length} duplicate games to delete:\n`)
    toDelete.forEach(item => {
      console.log(`   - ID ${item.id}: "${item.name}" (${item.console.name})`)
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

deleteDuplicateGames()

