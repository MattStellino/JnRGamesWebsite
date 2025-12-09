const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Create admin user if it doesn't exist
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12)
      
      await prisma.admin.create({
        data: {
          username: process.env.ADMIN_USERNAME || 'admin',
          password: hashedPassword,
        },
      })
      
      console.log('✅ Admin user created successfully')
    } else {
      console.log('ℹ️  Admin user already exists')
    }

    // Create default categories if they don't exist
    const defaultCategories = ['Games', 'Consoles', 'Accessories', 'Controllers']
    
    for (const categoryName of defaultCategories) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: categoryName }
      })

      if (!existingCategory) {
        await prisma.category.create({
          data: { name: categoryName }
        })
        console.log(`✅ Created category: ${categoryName}`)
      }
    }

    // Create default console types if they don't exist
    const defaultConsoleTypes = ['Nintendo', 'PlayStation', 'Xbox', 'PC', 'Other']
    
    for (const consoleTypeName of defaultConsoleTypes) {
      const existingConsoleType = await prisma.consoleType.findUnique({
        where: { name: consoleTypeName }
      })

      if (!existingConsoleType) {
        await prisma.consoleType.create({
          data: { name: consoleTypeName }
        })
        console.log(`✅ Created console type: ${consoleTypeName}`)
      }
    }

    console.log('🎉 Database migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()





