const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addGames() {
  try {
    const dbUrl = process.env.DATABASE_URL || ''
    const isProduction = !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')
    
    console.log('🎮 Adding games to database...\n')
    console.log(`📍 Database: ${isProduction ? 'PRODUCTION' : 'LOCAL'}\n`)
    
    if (!isProduction) {
      console.log('⚠️  WARNING: This appears to be a LOCAL database!')
      console.log('   If your website uses a PRODUCTION database, you need to:')
      console.log('   1. Set DATABASE_URL to your production database')
      console.log('   2. Run this script again\n')
    }
    
    // Find Games category
    const gamesCategory = await prisma.category.findUnique({
      where: { name: 'Games' }
    })

    if (!gamesCategory) {
      console.error('❌ Games category not found.')
      process.exit(1)
    }

    // Find consoles
    const nintendo3DS = await prisma.console.findUnique({
      where: { name: 'Nintendo 3DS' }
    })

    const nintendoDS = await prisma.console.findUnique({
      where: { name: 'Nintendo DS' }
    })

    const gamecube = await prisma.console.findUnique({
      where: { name: 'Nintendo GameCube' }
    })

    if (!nintendo3DS) {
      console.error('❌ Nintendo 3DS console not found.')
      process.exit(1)
    }
    if (!nintendoDS) {
      console.error('❌ Nintendo DS console not found.')
      process.exit(1)
    }
    if (!gamecube) {
      console.error('❌ Nintendo GameCube console not found.')
      process.exit(1)
    }

    console.log(`✅ Found all consoles and category\n`)

    // Nintendo 3DS games
    const nintendo3DSGames = [
      { name: "The Legend of Zelda: Ocarina of Time 3D", cib: 15, boxAndGame: 10, cartridgeOnly: 8 },
      { name: "The Legend of Zelda: Majora's Mask 3D", cib: 15, boxAndGame: 10, cartridgeOnly: 8 },
      { name: "Pokemon Y", cib: 20, boxAndGame: 15, cartridgeOnly: 10 },
      { name: "Pokemon X", cib: 20, boxAndGame: 15, cartridgeOnly: 10 },
      { name: "Pokemon Sun", cib: 15, boxAndGame: 10, cartridgeOnly: 8 },
      { name: "Pokemon Moon", cib: 15, boxAndGame: 10, cartridgeOnly: 8 },
      { name: "Pokemon Ultra Sun", cib: 25, boxAndGame: 20, cartridgeOnly: 15 },
      { name: "Pokemon Ultra Moon", cib: 25, boxAndGame: 20, cartridgeOnly: 15 },
    ]

    // Nintendo DS games
    const nintendoDSGames = [
      { name: "Pokemon Diamond", cib: 28, boxAndGame: 20, cartridgeOnly: 14 },
      { name: "Pokemon Pearl", cib: 28, boxAndGame: 20, cartridgeOnly: 14 },
      { name: "Pokemon Platinum", cib: 140, boxAndGame: 110, cartridgeOnly: 70 },
      { name: "Pokemon White", cib: 60, boxAndGame: 50, cartridgeOnly: 35 },
      { name: "Pokemon Black", cib: 60, boxAndGame: 50, cartridgeOnly: 35 },
      { name: "Pokemon White 2", cib: 150, boxAndGame: 120, cartridgeOnly: 80 },
      { name: "Pokemon Black 2", cib: 150, boxAndGame: 120, cartridgeOnly: 80 },
    ]

    // GameCube games
    const gamecubeGames = [
      { name: "Super Smash Bros. Melee", cib: 40, boxAndGame: 30, discOnly: 20 },
      { name: "Super Mario Sunshine", cib: 30, boxAndGame: 24, discOnly: 15 },
      { name: "The Legend of Zelda: Wind Waker", cib: 50, boxAndGame: 43, discOnly: 35 },
      { name: "The Legend of Zelda: Collector's Edition", cib: 38, boxAndGame: 27, discOnly: 18 },
      { name: "The Legend of Zelda: Twilight Princess", cib: 130, boxAndGame: 115, discOnly: 80 },
      { name: "Luigi's Mansion", cib: 35, boxAndGame: 30, discOnly: 18 },
      { name: "Sims 2", cib: 15, boxAndGame: 10, discOnly: 6 },
      { name: "Mario Superstar Baseball", cib: 55, boxAndGame: 40, discOnly: 28 },
    ]

    let created = 0
    let skipped = 0
    const errors = []

    // Add Nintendo 3DS games
    console.log('📱 Adding Nintendo 3DS games...\n')
    for (const game of nintendo3DSGames) {
      try {
        // Check if game already exists
        const existing = await prisma.item.findFirst({
          where: {
            name: game.name,
            consoleId: nintendo3DS.id,
            categoryId: gamesCategory.id
          }
        })

        if (existing) {
          console.log(`⏭️  Skipping "${game.name}" - already exists`)
          skipped++
          continue
        }

        await prisma.item.create({
          data: {
            name: game.name,
            description: `Game for Nintendo 3DS - Multiple condition options available`,
            price: game.cib,
            goodPrice: game.boxAndGame,
            acceptablePrice: game.cartridgeOnly,
            categoryId: gamesCategory.id,
            consoleId: nintendo3DS.id
          }
        })
        console.log(`✅ Created "${game.name}"`)
        created++
      } catch (error) {
        console.error(`❌ Failed to create "${game.name}":`, error.message)
        errors.push({ game: game.name, error: error.message })
      }
    }

    // Add Nintendo DS games
    console.log('\n📱 Adding Nintendo DS games...\n')
    for (const game of nintendoDSGames) {
      try {
        // Check if game already exists
        const existing = await prisma.item.findFirst({
          where: {
            name: game.name,
            consoleId: nintendoDS.id,
            categoryId: gamesCategory.id
          }
        })

        if (existing) {
          console.log(`⏭️  Skipping "${game.name}" - already exists`)
          skipped++
          continue
        }

        await prisma.item.create({
          data: {
            name: game.name,
            description: `Game for Nintendo DS - Multiple condition options available`,
            price: game.cib,
            goodPrice: game.boxAndGame,
            acceptablePrice: game.cartridgeOnly,
            categoryId: gamesCategory.id,
            consoleId: nintendoDS.id
          }
        })
        console.log(`✅ Created "${game.name}"`)
        created++
      } catch (error) {
        console.error(`❌ Failed to create "${game.name}":`, error.message)
        errors.push({ game: game.name, error: error.message })
      }
    }

    // Add GameCube games
    console.log('\n🎮 Adding GameCube games...\n')
    for (const game of gamecubeGames) {
      try {
        // Check if game already exists
        const existing = await prisma.item.findFirst({
          where: {
            name: game.name,
            consoleId: gamecube.id,
            categoryId: gamesCategory.id
          }
        })

        if (existing) {
          console.log(`⏭️  Skipping "${game.name}" - already exists`)
          skipped++
          continue
        }

        await prisma.item.create({
          data: {
            name: game.name,
            description: `Game for Nintendo GameCube - Multiple condition options available`,
            price: game.cib,
            goodPrice: game.boxAndGame,
            acceptablePrice: game.discOnly,
            categoryId: gamesCategory.id,
            consoleId: gamecube.id
          }
        })
        console.log(`✅ Created "${game.name}"`)
        created++
      } catch (error) {
        console.error(`❌ Failed to create "${game.name}":`, error.message)
        errors.push({ game: game.name, error: error.message })
      }
    }

    console.log(`\n\n📊 Summary:`)
    console.log(`   ✅ Created: ${created} games`)
    console.log(`   ⏭️  Skipped: ${skipped} games (already exist)`)
    if (errors.length > 0) {
      console.log(`   ❌ Errors: ${errors.length}`)
      errors.forEach(e => console.log(`      - ${e.game}: ${e.error}`))
    }
    console.log('\n🎉 Done!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

addGames()

