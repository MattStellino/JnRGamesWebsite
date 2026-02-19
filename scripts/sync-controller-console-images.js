const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const idx = line.indexOf('=')
    if (idx === -1) continue

    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Do not override values explicitly set in the shell/session.
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }

  return true
}

function resolveEnvFileFromArgs() {
  const idx = process.argv.indexOf('--env-file')
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1]
  }
  return null
}

const explicitEnvFile = resolveEnvFileFromArgs()
const defaultEnvOrder = ['.env.local', '.env', '.env.production']
const selectedEnvFile = explicitEnvFile || defaultEnvOrder.find((file) => fs.existsSync(path.join(process.cwd(), file)))

if (selectedEnvFile) {
  loadEnvFile(path.join(process.cwd(), selectedEnvFile))
  console.log(`Using env file: ${selectedEnvFile}`)
}

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
  {
    category: 'Consoles',
    itemName: 'Gameboy Advance',
    sourceDir: 'website pictures',
    sourceFile: 'gameboy_advance.jpg',
    destFile: 'console_gameboyadvance.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Gameboy Advance SP',
    sourceDir: 'website pictures',
    sourceFile: 'gameboy_advance_sp.jpg',
    destFile: 'console_gameboyadvancesp.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Gameboy Color',
    sourceDir: 'website pictures',
    sourceFile: 'gameboy_color.jpg',
    destFile: 'console_gameboycolor.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo 2DS',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_2ds.webp',
    destFile: 'console_nintendo2ds.webp',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo 3DS',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_3ds.jpg',
    destFile: 'console_nintendo3ds.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo 3DS XL',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_3ds_xl.jpg',
    destFile: 'console_nintendo3dsxl.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo DS Lite',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_ds_lite.webp',
    destFile: 'console_nintendodslite.webp',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo DSi',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_dsi.webp',
    destFile: 'console_nintendodsi.webp',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo DSi XL',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_dsi_xl.webp',
    destFile: 'console_nintendodsixl.webp',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo New 2DS XL',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_2ds_xl.jpg',
    destFile: 'console_nintendonew2dsxl.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo New 3DS XL Black',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_new_3ds_xl_black.jpg',
    destFile: 'console_nintendonew3dsxlblack.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Nintendo New 3DS XL Red',
    sourceDir: 'website pictures',
    sourceFile: 'nintendo_new_3ds_xl_red.jpg',
    destFile: 'console_nintendonew3dsxlred.jpg',
  },
  {
    category: 'Consoles',
    itemName: 'Sony PS3 Slim',
    sourceDir: 'website pictures',
    sourceFile: 'sony_ps3_slim.jpg',
    destFile: 'console_sonyps3slim.jpg',
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
