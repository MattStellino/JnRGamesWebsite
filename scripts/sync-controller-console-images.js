const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const mappings = [
  // Consoles (from website pictures/)
  {
    category: 'Consoles',
    itemName: 'Nintendo 64',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_64.webp',
    destFile: 'console_nintendo64.webp',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo Gamecube',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_gamecube.jpg',
    destFile: 'console_nintendogamecube.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo Switch',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_switch.avif',
    destFile: 'console_nintendoswitch.avif',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo Switch OLED',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_switch_oled.jpg',
    destFile: 'console_nintendoswitcholed.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo Wii (White)',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_wii.jpg',
    destFile: 'console_nintendowii.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo Wii Mini',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_wii_mini.webp',
    destFile: 'console_nintendowiimini.webp',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo Wii U',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_wii_u.jpg',
    destFile: 'console_nintendowiiu.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'SNES',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_snes.jpg',
    destFile: 'console_nintendosnes.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Sony PS2',
    sourceDir: 'website pictures',
    sourceFile: 'sony_ps2_fat.jpg',
    destFile: 'console_sony_ps2_fat.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Sony PS3 Super Slim 250GB',
    sourceDir: 'website pictures',
    sourceFile: 'ps3 superslim_250gb.jpg',
    destFile: 'console_ps3_superslim_250gb.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Sony PS3 Super Slim 500GB',
    sourceDir: 'website pictures',
    sourceFile: 'ps3_superslim_500gb.jpg',
    destFile: 'console_ps3_superslim_500gb.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Xbox 360 Slim',
    sourceDir: 'website pictures',
    sourceFile: 'xbox_360_slim.webp',
    destFile: 'console_xbox360slim.webp',
  },
  {
    category: 'Consoles',
    itemName: 'Xbox One S 500GB',
    sourceDir: 'website pictures',
    sourceFile: 'xbox_one_s_500gb.jpg',
    destFile: 'console_xboxones500gb.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Xbox One S 1TB',
    sourceDir: 'website pictures',
    sourceFile: 'xbox_one_s.jpg',
    destFile: 'console_xboxones.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Xbox One X',
    sourceDir: 'website pictures',
    sourceFile: 'xbox_one_X.jpg',
    destFile: 'console_xboxonex.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Xbox Series S',
    sourceDir: 'website pictures',
    sourceFile: 'xbox_series_s.jpg',
    destFile: 'console_xbox_series_s.jpg',
  },

  // Controllers (from controllers/)
  {
    category: 'Controllers',
    itemName: 'Nintendo Gamecube Controller',
    sourceDir: 'controllers',
    sourceFile: 'gamecube_controller.png',
    destFile: 'controller_gamecubecontroller.png',
  },
  {
    category: 'Controllers',
    itemName: 'Nintendo Switch Joy-Cons (Pair)',
    sourceDir: 'controllers',
    sourceFile: 'nintedo_switch_joycons.avif',
    destFile: 'controller_nintendo_switch_joycons.avif',
  },
  {
    category: 'Controllers',
    itemName: 'Nintendo Wii Remote',
    sourceDir: 'controllers',
    sourceFile: 'nintendo_wii_controllers.webp',
    destFile: 'controller_nintendowiicontrollers.webp',
  },
  {
    category: 'Controllers',
    itemName: 'PS2 Controller',
    sourceDir: 'controllers',
    sourceFile: 'ps2_controller.jpg',
    destFile: 'controller_ps2controller.jpg',
  },
  {
    category: 'Controllers',
    itemName: 'PS3 Controller',
    sourceDir: 'controllers',
    sourceFile: 'ps3_controller.webp',
    destFile: 'controller_ps3controller.webp',
  },
  {
    category: 'Controllers',
    itemName: 'PS4 Controller',
    sourceDir: 'controllers',
    sourceFile: 'ps4_controller.jpg',
    destFile: 'controller_ps4controller.jpg',
  },
  {
    category: 'Controllers',
    itemName: 'PS5 Controller',
    sourceDir: 'controllers',
    sourceFile: 'ps5_controller.webp',
    destFile: 'controller_ps5controller.webp',
  },
  {
    category: 'Controllers',
    itemName: 'Xbox 360 Controller',
    sourceDir: 'controllers',
    sourceFile: 'xbox_360_controller.jpg',
    destFile: 'controller_xbox360controller.jpg',
  },
  {
    category: 'Controllers',
    itemName: 'Xbox One Controller',
    sourceDir: 'controllers',
    sourceFile: 'xbox_one_controler.jpg',
    destFile: 'controller_xboxonecontroler.jpg',
  },
  {
    category: 'Controllers',
    itemName: 'Xbox Series Controller',
    sourceDir: 'controllers',
    sourceFile: 'xbox_series_controller.avif',
    destFile: 'controller_xboxseriescontroller.avif',
  },
]

async function run() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  let updated = 0
  let missingFiles = 0
  let missingItems = 0

  for (const mapping of mappings) {
    const sourcePath = path.join(process.cwd(), mapping.sourceDir, mapping.sourceFile)
    const destPath = path.join(uploadsDir, mapping.destFile)
    const imageUrl = `/uploads/${mapping.destFile}`

    if (!fs.existsSync(sourcePath)) {
      console.log(`MISSING FILE: ${sourcePath}`)
      missingFiles++
      continue
    }

    fs.copyFileSync(sourcePath, destPath)

    const item = await prisma.item.findFirst({
      where: {
        name: mapping.itemName,
        category: {
          name: mapping.category,
        },
      },
      include: {
        category: true,
      },
    })

    if (!item) {
      console.log(`MISSING ITEM: [${mapping.category}] ${mapping.itemName}`)
      missingItems++
      continue
    }

    await prisma.item.update({
      where: { id: item.id },
      data: { imageUrl },
    })

    console.log(`UPDATED: [${mapping.category}] ${item.name} -> ${imageUrl}`)
    updated++
  }

  console.log('')
  console.log(`Done. Updated=${updated}, MissingFiles=${missingFiles}, MissingItems=${missingItems}`)
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
