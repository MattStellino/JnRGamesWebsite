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

// Map our console names to RAWG platform slugs
const consoleToPlatformSlug: Record<string, string> = {
  // PlayStation
  'PS5': 'playstation5',
  'PlayStation 5': 'playstation5',
  'PS4': 'playstation4',
  'PlayStation 4': 'playstation4',
  'PS3': 'playstation3',
  'PlayStation 3': 'playstation3',
  'PS2': 'playstation2',
  'PlayStation 2': 'playstation2',
  'PS1': 'playstation',
  'PlayStation': 'playstation',
  'PSP': 'psp',
  'PS Vita': 'ps-vita',

  // Xbox
  'Xbox Series X': 'xbox-series-x',
  'Xbox Series S': 'xbox-series-x',
  'Xbox One': 'xbox-one',
  'Xbox 360': 'xbox360',
  'Xbox': 'xbox-old',

  // Nintendo
  'Nintendo Switch': 'nintendo-switch',
  'Wii U': 'wii-u',
  'Wii': 'wii',
  'Nintendo 3DS': 'nintendo-3ds',
  '3DS': 'nintendo-3ds',
  'Nintendo DS': 'nintendo-ds',
  'DS': 'nintendo-ds',
  'GameCube': 'gamecube',
  'Nintendo 64': 'nintendo-64',
  'N64': 'nintendo-64',
  'SNES': 'snes',
  'Super Nintendo': 'snes',
  'NES': 'nes',
  'Game Boy Advance': 'game-boy-advance',
  'GBA': 'game-boy-advance',
  'Game Boy Color': 'game-boy-color',
  'Game Boy': 'game-boy',

  // Sega
  'Dreamcast': 'dreamcast',
  'Saturn': 'sega-saturn',
  'Sega Genesis': 'genesis',
  'Genesis': 'genesis',
  'Mega Drive': 'genesis',
  'Sega CD': 'sega-cd',
  'Game Gear': 'game-gear',
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
    if (consoleName && consoleToPlatformSlug[consoleName]) {
      params.append('platforms', consoleToPlatformSlug[consoleName])
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
