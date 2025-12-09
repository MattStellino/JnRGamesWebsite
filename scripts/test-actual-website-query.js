const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testActualQuery() {
  try {
    console.log('🔍 Testing EXACT query that the website uses...\n')
    
    // This is the EXACT query from items/page.tsx
    const pageNum = 1
    const limit = 12
    const skip = (pageNum - 1) * limit

    const where = {} // NO filters - this is what shows on /items with no filters

    // Get total count
    const totalItems = await prisma.item.count({ where })
    console.log(`📊 Total items (no filters): ${totalItems}`)

    // Get paginated items - EXACT query from page.tsx
    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        console: {
          include: {
            consoleType: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { name: 'asc' }
      ],
      skip,
      take: limit,
    })

    console.log(`\n📋 First 12 items that SHOULD show on website:\n`)
    items.forEach((item, index) => {
      const consoleName = item.console ? item.console.name : 'NO CONSOLE'
      const categoryName = item.category ? item.category.name : 'NO CATEGORY'
      const date = new Date(item.createdAt).toLocaleString()
      console.log(`${index + 1}. ${item.name}`)
      console.log(`   Category: ${categoryName} | Console: ${consoleName}`)
      console.log(`   Created: ${date}`)
      console.log(`   ID: ${item.id}`)
      console.log('')
    })

    // Check if new games are in this list
    const newGameNames = [
      'Mario Superstar Baseball',
      'Sims 2',
      'Luigi\'s Mansion',
      'Super Smash Bros. Melee',
      'Pokemon Diamond',
      'Pokemon Y',
      'The Legend of Zelda: Ocarina of Time 3D'
    ]

    console.log('\n🎮 Checking if new games are in first 12:\n')
    newGameNames.forEach(gameName => {
      const found = items.find(item => item.name === gameName)
      if (found) {
        const position = items.indexOf(found) + 1
        console.log(`✅ ${gameName} - Position ${position}`)
      } else {
        console.log(`❌ ${gameName} - NOT IN FIRST 12`)
      }
    })

    // Check ALL items to see where new games are
    console.log('\n🔍 Finding positions of ALL new games:\n')
    const allNewGames = [
      'Mario Superstar Baseball',
      'Sims 2',
      'Luigi\'s Mansion',
      'The Legend of Zelda: Twilight Princess',
      'The Legend of Zelda: Collector\'s Edition',
      'Super Mario Sunshine',
      'The Legend of Zelda: Wind Waker',
      'Super Smash Bros. Melee',
      'Pokemon Black 2',
      'Pokemon White 2',
      'Pokemon Black',
      'Pokemon White',
      'Pokemon Pearl',
      'Pokemon Platinum',
      'Pokemon Diamond',
      'Pokemon Ultra Moon',
      'Pokemon Ultra Sun',
      'Pokemon Moon',
      'Pokemon Sun',
      'Pokemon X',
      'Pokemon Y',
      'The Legend of Zelda: Majora\'s Mask 3D',
      'The Legend of Zelda: Ocarina of Time 3D'
    ]

    const allItems = await prisma.item.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })

    allNewGames.forEach(gameName => {
      const position = allItems.findIndex(item => item.name === gameName)
      if (position >= 0) {
        const page = Math.floor(position / 12) + 1
        console.log(`${gameName}: Position ${position + 1} (Page ${page})`)
      } else {
        console.log(`${gameName}: NOT FOUND IN DATABASE`)
      }
    })

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testActualQuery()

