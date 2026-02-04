import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStatus() {
  const consoles = await prisma.item.findMany({
    where: { category: { name: 'Consoles' } },
    include: { console: true }
  })

  const controllers = await prisma.item.findMany({
    where: { category: { name: 'Controllers' } },
    include: { console: true }
  })

  const consolesWithImages = consoles.filter(c => c.imageUrl).length
  const controllersWithImages = controllers.filter(c => c.imageUrl).length

  console.log('=== Image Assignment Summary ===')
  console.log(`Consoles: ${consolesWithImages}/${consoles.length} have images`)
  console.log(`Controllers: ${controllersWithImages}/${controllers.length} have images`)
  console.log('')

  const consolesWithout = consoles.filter(c => !c.imageUrl)
  const controllersWithout = controllers.filter(c => !c.imageUrl)

  if (consolesWithout.length > 0) {
    console.log('Consoles without images:')
    consolesWithout.forEach(c => console.log(`  - ${c.name} (${c.console.name})`))
  } else {
    console.log('✓ All consoles have images!')
  }

  if (controllersWithout.length > 0) {
    console.log('\nControllers without images:')
    controllersWithout.forEach(c => console.log(`  - ${c.name} (${c.console.name})`))
  } else {
    console.log('✓ All controllers have images!')
  }

  await prisma.$disconnect()
}

checkStatus()
