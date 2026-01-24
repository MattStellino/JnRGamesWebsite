// Automatic image fetching for items
// Fetches appropriate images based on item category

import { searchGames } from './rawg'

interface ItemForImage {
  id: number
  name: string
  categoryId: number
  category: {
    name: string
  }
  console?: {
    name: string
    consoleType?: {
      name: string
    }
  } | null
}

// Fetch the best matching image for an item
export async function fetchItemImage(item: ItemForImage): Promise<string | null> {
  const categoryName = item.category.name
  const consoleName = item.console?.name

  // For games, use RAWG API
  if (categoryName === 'Games') {
    return await fetchGameImage(item.name, consoleName)
  }

  // For consoles, use a console image lookup
  if (categoryName === 'Consoles') {
    return getConsoleImage(item.name, consoleName)
  }

  // For controllers, use controller image lookup
  if (categoryName === 'Controllers') {
    return getControllerImage(item.name, consoleName)
  }

  // For accessories, try to find a generic image
  if (categoryName === 'Accessories') {
    return getAccessoryImage(item.name, consoleName)
  }

  return null
}

// Fetch game cover art from RAWG
async function fetchGameImage(gameName: string, consoleName?: string | null): Promise<string | null> {
  try {
    const results = await searchGames(gameName, consoleName || undefined, 1, 5)

    if (!results || results.results.length === 0) {
      return null
    }

    // Find the best match - prefer exact name match
    const exactMatch = results.results.find(
      game => game.name.toLowerCase() === gameName.toLowerCase()
    )

    if (exactMatch?.background_image) {
      return exactMatch.background_image
    }

    // Otherwise return the first result with an image
    const withImage = results.results.find(game => game.background_image)
    return withImage?.background_image || null
  } catch (error) {
    console.error('Error fetching game image:', error)
    return null
  }
}

// Console images - using high-quality Wikipedia/press images
// These are direct links to commonly used console images
const consoleImages: Record<string, string> = {
  // PlayStation
  'PS5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Black_PS5_and_controller.jpg/1200px-Black_PS5_and_controller.jpg',
  'PlayStation 5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Black_PS5_and_controller.jpg/1200px-Black_PS5_and_controller.jpg',
  'PS4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Sony-PlayStation-4-PS4-Console-FL.jpg/1200px-Sony-PlayStation-4-PS4-Console-FL.jpg',
  'PS4 Pro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/PS4-Pro-Console-Set.jpg/1200px-PS4-Pro-Console-Set.jpg',
  'PS4 Slim': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sony-PlayStation4-Pro-Console-BL.jpg/1200px-Sony-PlayStation4-Pro-Console-BL.jpg',
  'PlayStation 4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Sony-PlayStation-4-PS4-Console-FL.jpg/1200px-Sony-PlayStation-4-PS4-Console-FL.jpg',
  'PS3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Sony-PlayStation-3-2001A-wController-L.jpg/1200px-Sony-PlayStation-3-2001A-wController-L.jpg',
  'PS3 Slim': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/PS3-slim-console.png/1200px-PS3-slim-console.png',
  'PS3 Super Slim': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Sony-PlayStation-3-SuperSlim-Console-FL.jpg/1200px-Sony-PlayStation-3-SuperSlim-Console-FL.jpg',
  'PlayStation 3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Sony-PlayStation-3-2001A-wController-L.jpg/1200px-Sony-PlayStation-3-2001A-wController-L.jpg',
  'PS2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PS2-Versions.jpg/1200px-PS2-Versions.jpg',
  'PS2 Slim': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/PS2-Slim-Console-Set.jpg/1200px-PS2-Slim-Console-Set.jpg',
  'PlayStation 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PS2-Versions.jpg/1200px-PS2-Versions.jpg',
  'PS1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PSX-Console-wController.jpg/1200px-PSX-Console-wController.jpg',
  'PlayStation': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PSX-Console-wController.jpg/1200px-PSX-Console-wController.jpg',
  'PSP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Psp-1000.jpg/1200px-Psp-1000.jpg',
  'PS Vita': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/PlayStation-Vita-1101-FL.jpg/1200px-PlayStation-Vita-1101-FL.jpg',

  // Xbox
  'Xbox Series X': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Xbox-Series-X-Console-wController.png/800px-Xbox-Series-X-Console-wController.png',
  'Xbox Series S': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Xbox-Series-S-Console-wController-L.jpg/1200px-Xbox-Series-S-Console-wController-L.jpg',
  'Xbox One': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Microsoft-Xbox-One-Console-Set-wKinect.jpg/1200px-Microsoft-Xbox-One-Console-Set-wKinect.jpg',
  'Xbox One S': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Microsoft-Xbox-One-S-Console-wController-L.jpg/1200px-Microsoft-Xbox-One-S-Console-wController-L.jpg',
  'Xbox One X': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Microsoft-Xbox-One-X-Console-wController.png/800px-Microsoft-Xbox-One-X-Console-wController.png',
  'Xbox 360': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Xbox-360-Pro-wController.png/800px-Xbox-360-Pro-wController.png',
  'Xbox 360 Slim': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Xbox-360S-Console-Set.jpg/1200px-Xbox-360S-Console-Set.jpg',
  'Xbox 360 E': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Microsoft-Xbox-360-E-Console-Set-wController.jpg/1200px-Microsoft-Xbox-360-E-Console-Set-wController.jpg',
  'Xbox': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Xbox-Console-wController.jpg/1200px-Xbox-Console-wController.jpg',
  'Original Xbox': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Xbox-Console-wController.jpg/1200px-Xbox-Console-wController.jpg',

  // Nintendo
  'Nintendo Switch': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/NintendoSwitch_hardware.jpg/1200px-NintendoSwitch_hardware.jpg',
  'Switch': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/NintendoSwitch_hardware.jpg/1200px-NintendoSwitch_hardware.jpg',
  'Switch Lite': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Nintendo-Switch-Lite-Yellow-FL.jpg/1200px-Nintendo-Switch-Lite-Yellow-FL.jpg',
  'Switch OLED': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Nintendo-Switch-OLED-Model-Neon-Blue-Neon-Red-FL.png/1200px-Nintendo-Switch-OLED-Model-Neon-Blue-Neon-Red-FL.png',
  'Wii U': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Wii_U_Console_and_Gamepad.png/1200px-Wii_U_Console_and_Gamepad.png',
  'Wii': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Wii-console.jpg/800px-Wii-console.jpg',
  'Nintendo 3DS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Nintendo-3DS-AquaOpen.jpg/1200px-Nintendo-3DS-AquaOpen.jpg',
  '3DS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Nintendo-3DS-AquaOpen.jpg/1200px-Nintendo-3DS-AquaOpen.jpg',
  '3DS XL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Nintendo-3DS-XL-angled.jpg/1200px-Nintendo-3DS-XL-angled.jpg',
  'New 3DS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/New_Nintendo_3DS_XL.jpg/1200px-New_Nintendo_3DS_XL.jpg',
  'New 3DS XL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/New_Nintendo_3DS_XL.jpg/1200px-New_Nintendo_3DS_XL.jpg',
  '2DS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Nintendo-2DS-Blue-FL-Open.jpg/1200px-Nintendo-2DS-Blue-FL-Open.jpg',
  'Nintendo DS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Nintendo-DS-Fat-Blue.jpg/1200px-Nintendo-DS-Fat-Blue.jpg',
  'DS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Nintendo-DS-Fat-Blue.jpg/1200px-Nintendo-DS-Fat-Blue.jpg',
  'DS Lite': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Nintendo-DS-Lite-w-stylus.png/800px-Nintendo-DS-Lite-w-stylus.png',
  'DSi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Nintendo-DSi-Bl-Open.jpg/1200px-Nintendo-DSi-Bl-Open.jpg',
  'DSi XL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Nintendo-DSi-XL-Burg.jpg/1200px-Nintendo-DSi-XL-Burg.jpg',
  'GameCube': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/GameCube-Set.jpg/1200px-GameCube-Set.jpg',
  'Nintendo 64': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Nintendo-64-wController-L.jpg/1200px-Nintendo-64-wController-L.jpg',
  'N64': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Nintendo-64-wController-L.jpg/1200px-Nintendo-64-wController-L.jpg',
  'SNES': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/SNES-Mod1-Console-Set.jpg/1200px-SNES-Mod1-Console-Set.jpg',
  'Super Nintendo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/SNES-Mod1-Console-Set.jpg/1200px-SNES-Mod1-Console-Set.jpg',
  'NES': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/NES-Console-Set.jpg/1200px-NES-Console-Set.jpg',
  'Game Boy Advance': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Nintendo-Game-Boy-Advance-Purple-FL.jpg/1200px-Nintendo-Game-Boy-Advance-Purple-FL.jpg',
  'GBA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Nintendo-Game-Boy-Advance-Purple-FL.jpg/1200px-Nintendo-Game-Boy-Advance-Purple-FL.jpg',
  'GBA SP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Game-Boy-Advance-SP-Mk1-Blue.jpg/1200px-Game-Boy-Advance-SP-Mk1-Blue.jpg',
  'Game Boy Color': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Game-Boy-Color-Purple.png/800px-Game-Boy-Color-Purple.png',
  'GBC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Game-Boy-Color-Purple.png/800px-Game-Boy-Color-Purple.png',
  'Game Boy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Game-Boy-FL.jpg/800px-Game-Boy-FL.jpg',
  'GB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Game-Boy-FL.jpg/800px-Game-Boy-FL.jpg',

  // Sega
  'Dreamcast': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Dreamcast-Console-Set.jpg/1200px-Dreamcast-Console-Set.jpg',
  'Sega Saturn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sega-Saturn-Console-Set-Mk2.jpg/1200px-Sega-Saturn-Console-Set-Mk2.jpg',
  'Saturn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sega-Saturn-Console-Set-Mk2.jpg/1200px-Sega-Saturn-Console-Set-Mk2.jpg',
  'Sega Genesis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Sega-Genesis-Mod1-Set.jpg/1200px-Sega-Genesis-Mod1-Set.jpg',
  'Genesis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Sega-Genesis-Mod1-Set.jpg/1200px-Sega-Genesis-Mod1-Set.jpg',
  'Mega Drive': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Sega-Genesis-Mod1-Set.jpg/1200px-Sega-Genesis-Mod1-Set.jpg',
  'Sega CD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sega-CD-Model1-Set.jpg/1200px-Sega-CD-Model1-Set.jpg',
  'Game Gear': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Sega-Game-Gear-WB.png/1200px-Sega-Game-Gear-WB.png',
  'Master System': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Sega-Master-System-Set.jpg/1200px-Sega-Master-System-Set.jpg',
}

// Controller images
const controllerImages: Record<string, string> = {
  // PlayStation controllers
  'DualSense': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/DualSense_controller_-_white_model.jpg/1200px-DualSense_controller_-_white_model.jpg',
  'PS5 Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/DualSense_controller_-_white_model.jpg/1200px-DualSense_controller_-_white_model.jpg',
  'DualShock 4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/DualShock_4.jpg/1200px-DualShock_4.jpg',
  'PS4 Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/DualShock_4.jpg/1200px-DualShock_4.jpg',
  'DualShock 3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/DualShock_3.jpg/1200px-DualShock_3.jpg',
  'PS3 Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/DualShock_3.jpg/1200px-DualShock_3.jpg',
  'DualShock 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Sony-PlayStation-DualShock-2.jpg/1200px-Sony-PlayStation-DualShock-2.jpg',
  'PS2 Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Sony-PlayStation-DualShock-2.jpg/1200px-Sony-PlayStation-DualShock-2.jpg',
  'DualShock': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/PSX-DualShock-Controller.jpg/1200px-PSX-DualShock-Controller.jpg',
  'PS1 Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/PSX-DualShock-Controller.jpg/1200px-PSX-DualShock-Controller.jpg',

  // Xbox controllers
  'Xbox Series Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Microsoft-Xbox-Series-X-Controller-Front.jpg/1200px-Microsoft-Xbox-Series-X-Controller-Front.jpg',
  'Xbox One Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Microsoft-Xbox-One-controller.jpg/1200px-Microsoft-Xbox-One-controller.jpg',
  'Xbox 360 Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Xbox-360-S-Controller.png/800px-Xbox-360-S-Controller.png',
  'Xbox Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Xbox-Duke-Controller.jpg/1200px-Xbox-Duke-Controller.jpg',

  // Nintendo controllers
  'Joy-Con': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Nintendo-Switch-Joy-Con-Controllers-FL.jpg/1200px-Nintendo-Switch-Joy-Con-Controllers-FL.jpg',
  'Switch Pro Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Nintendo-Switch-Pro-Controller-FL.jpg/1200px-Nintendo-Switch-Pro-Controller-FL.jpg',
  'Wii U Pro Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Wii_U_Pro_Controller.JPG/1200px-Wii_U_Pro_Controller.JPG',
  'Wii Remote': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Wii_Remote_Image.jpg/400px-Wii_Remote_Image.jpg',
  'Wiimote': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Wii_Remote_Image.jpg/400px-Wii_Remote_Image.jpg',
  'Wii U GamePad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Wii_U_GamePad.png/1200px-Wii_U_GamePad.png',
  'GameCube Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/GameCube_controller.png/1200px-GameCube_controller.png',
  'N64 Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/N64-Controller-Gray.jpg/1200px-N64-Controller-Gray.jpg',
  'SNES Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/SNES-Controller.jpg/1200px-SNES-Controller.jpg',
  'NES Controller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/NES-controller.jpg/1200px-NES-controller.jpg',
}

function getConsoleImage(itemName: string, consoleName?: string | null): string | null {
  // First try exact match with item name
  if (consoleImages[itemName]) {
    return consoleImages[itemName]
  }

  // Try with console name
  if (consoleName && consoleImages[consoleName]) {
    return consoleImages[consoleName]
  }

  // Try partial matching
  const lowerName = itemName.toLowerCase()
  for (const [key, url] of Object.entries(consoleImages)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return url
    }
  }

  return null
}

function getControllerImage(itemName: string, consoleName?: string | null): string | null {
  // First try exact match
  if (controllerImages[itemName]) {
    return controllerImages[itemName]
  }

  // Try partial matching with item name
  const lowerName = itemName.toLowerCase()
  for (const [key, url] of Object.entries(controllerImages)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return url
    }
  }

  // Fall back to console-based controller
  if (consoleName) {
    const consoleControllerMap: Record<string, string> = {
      'PS5': 'DualSense',
      'PlayStation 5': 'DualSense',
      'PS4': 'DualShock 4',
      'PlayStation 4': 'DualShock 4',
      'PS3': 'DualShock 3',
      'PlayStation 3': 'DualShock 3',
      'PS2': 'DualShock 2',
      'PlayStation 2': 'DualShock 2',
      'PS1': 'DualShock',
      'PlayStation': 'DualShock',
      'Xbox Series X': 'Xbox Series Controller',
      'Xbox Series S': 'Xbox Series Controller',
      'Xbox One': 'Xbox One Controller',
      'Xbox 360': 'Xbox 360 Controller',
      'Xbox': 'Xbox Controller',
      'Nintendo Switch': 'Joy-Con',
      'Switch': 'Joy-Con',
      'Wii U': 'Wii U GamePad',
      'Wii': 'Wii Remote',
      'GameCube': 'GameCube Controller',
      'Nintendo 64': 'N64 Controller',
      'N64': 'N64 Controller',
      'SNES': 'SNES Controller',
      'NES': 'NES Controller',
    }

    const controllerKey = consoleControllerMap[consoleName]
    if (controllerKey && controllerImages[controllerKey]) {
      return controllerImages[controllerKey]
    }
  }

  return null
}

function getAccessoryImage(itemName: string, consoleName?: string | null): string | null {
  // Common accessories - try to match by name
  const accessoryImages: Record<string, string> = {
    'Kinect': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Xbox-One-Kinect.jpg/1200px-Xbox-One-Kinect.jpg',
    'PlayStation Camera': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/PlayStation-Camera.jpg/1200px-PlayStation-Camera.jpg',
    'PlayStation Move': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/PlayStation-Move.jpg/800px-PlayStation-Move.jpg',
    'PS VR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/PlayStation-VR-Headset-Mk1-FL.jpg/1200px-PlayStation-VR-Headset-Mk1-FL.jpg',
    'PSVR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/PlayStation-VR-Headset-Mk1-FL.jpg/1200px-PlayStation-VR-Headset-Mk1-FL.jpg',
    'Nunchuk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Wii-Nunchuk-controller.jpg/400px-Wii-Nunchuk-controller.jpg',
    'Wii Balance Board': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Wii_Balance_Board.JPG/1200px-Wii_Balance_Board.JPG',
  }

  const lowerName = itemName.toLowerCase()
  for (const [key, url] of Object.entries(accessoryImages)) {
    if (lowerName.includes(key.toLowerCase())) {
      return url
    }
  }

  return null
}
