const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking which database you\'re connected to...\n')
    
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      console.error('❌ DATABASE_URL not set!')
      process.exit(1)
    }

    // Mask password in URL for display
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
    console.log(`📊 Database URL: ${maskedUrl}`)
    
    // Check if it's local or production
    if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
      console.log('📍 Database: LOCAL')
    } else {
      console.log('📍 Database: PRODUCTION/REMOTE')
    }

    // Count items
    const totalItems = await prisma.item.count()
    console.log(`\n📦 Total items in THIS database: ${totalItems}`)

    // Check for new games
    const newGames = await prisma.item.findMany({
      where: {
        name: {
          in: [
            'Mario Superstar Baseball',
            'Super Smash Bros. Melee',
            'Pokemon Diamond',
            'Pokemon Y'
          ]
        }
      },
      select: {
        name: true
      }
    })

    console.log(`\n🎮 New games found in THIS database: ${newGames.length}/4`)
    if (newGames.length === 4) {
      console.log('✅ All new games are in this database')
      console.log('\n⚠️  If games aren\'t showing on website:')
      console.log('   1. Make sure you\'re looking at the SAME database (local vs production)')
      console.log('   2. Restart your Next.js server')
      console.log('   3. Clear browser cache (Ctrl+Shift+R)')
    } else {
      console.log('❌ New games are NOT in this database!')
      console.log('\n💡 You need to run the script on the PRODUCTION database!')
      console.log('   Run: node scripts/add-games.js')
      console.log('   (Make sure DATABASE_URL points to production)')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()

