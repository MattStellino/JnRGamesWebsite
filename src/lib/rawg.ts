// RAWG Video Games Database API
// Free tier: 20,000 requests/month
// Get your API key at: https://rawg.io/apidocs

const RAWG_API_KEY = process.env.RAWG_API_KEY || ''
const RAWG_BASE_URL = 'https://api.rawg.io/api'

export interface RAWGGame {
  id: number
  name: string
  slug: string
  background_image: string | null
  released: string | null
  platforms: Array<{
    platform: {
      id: number
      name: string
      slug: string
    }
  }> | null
}

export interface RAWGSearchResponse {
  count: number
  next: string | null
  previous: string | null
  results: RAWGGame[]
}

// Map our console names to RAWG platform IDs
const consoleToPlatformId: Record<string, string> = {
  // PlayStation
  'PS5': '187',
  'PlayStation 5': '187',
  'Playstation 5': '187',
  'PS4': '18',
  'PlayStation 4': '18',
  'Playstation 4': '18',
  'PS3': '16',
  'PlayStation 3': '16',
  'Playstation 3': '16',
  'PS2': '15',
  'PlayStation 2': '15',
  'Playstation 2': '15',
  'PS1': '27',
  'PlayStation': '27',
  'PSP': '17',
  'PS Vita': '19',

  // Xbox
  'Xbox Series X': '186',
  'Xbox Series S': '186',
  'Xbox Series X/S': '186',
  'Xbox One': '1',
  'Xbox 360': '14',
  'Xbox': '80',

  // Nintendo
  'Nintendo Switch': '7',
  'Wii U': '10',
  'Wii': '11',
  'Nintendo Wii': '11',
  'Nintendo 3DS': '8',
  '3DS': '8',
  'Nintendo DS': '9',
  'DS': '9',
  'GameCube': '105',
  'Nintendo GameCube': '105',
  'Nintendo 64': '83',
  'N64': '83',
  'SNES': '79',
  'Super Nintendo': '79',
  'NES': '49',
  'Game Boy Advance': '24',
  'GBA': '24',
  'Game Boy Color': '43',
  'Game Boy': '26',
  'Gameboy': '26',

  // Sega
  'Dreamcast': '106',
  'Sega Saturn': '107',
  'Saturn': '107',
  'Sega Genesis': '167',
  'Genesis': '167',
  'Mega Drive': '167',
  'Game Gear': '77',
}

export async function searchGames(
  query: string,
  consoleName?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<RAWGSearchResponse | null> {
  if (!RAWG_API_KEY) {
    console.warn('RAWG_API_KEY not set. Game image search will not work.')
    return null
  }

  try {
    const params = new URLSearchParams({
      key: RAWG_API_KEY,
      search: query,
      page: page.toString(),
      page_size: pageSize.toString(),
    })

    // Add platform filter if console is specified
    if (consoleName && consoleToPlatformId[consoleName]) {
      params.append('platforms', consoleToPlatformId[consoleName])
    }

    const response = await fetch(`${RAWG_BASE_URL}/games?${params.toString()}`)

    if (!response.ok) {
      console.error('RAWG API error:', response.status, response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error searching RAWG:', error)
    return null
  }
}

export async function getGameDetails(gameId: number): Promise<RAWGGame | null> {
  if (!RAWG_API_KEY) {
    return null
  }

  try {
    const response = await fetch(
      `${RAWG_BASE_URL}/games/${gameId}?key=${RAWG_API_KEY}`
    )

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching game details:', error)
    return null
  }
}
