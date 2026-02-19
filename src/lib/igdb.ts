// IGDB API integration via Twitch authentication
// Requires TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET
// (Fallback supported: IGDB_CLIENT_ID / IGDB_CLIENT_SECRET)

const IGDB_CLIENT_ID = process.env.TWITCH_CLIENT_ID || process.env.IGDB_CLIENT_ID || ''
const IGDB_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || process.env.IGDB_CLIENT_SECRET || ''

const IGDB_BASE_URL = 'https://api.igdb.com/v4'
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'
const REQUEST_TIMEOUT_MS = 10_000
const MAX_QUERY_LENGTH = 120
const MAX_CONSOLE_LENGTH = 60
const MAX_PAGE_SIZE = 25
const MAX_PAGE = 50

interface IGDBPlatform {
  name: string
}

interface IGDBCover {
  image_id: string
}

export interface IGDBGame {
  id: number
  name: string
  cover?: IGDBCover | null
  first_release_date?: number | null
  platforms?: IGDBPlatform[] | null
}

type TokenCache = {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

function buildCoverUrl(imageId: string, size: 't_cover_big' | 't_cover_big_2x' = 't_cover_big_2x') {
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`
}

function escapeSearchText(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[\r\n\t]/g, ' ')
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function sanitizeInput(text: string, maxLength: number) {
  return normalizeWhitespace(text).slice(0, maxLength)
}

function safePositiveInt(value: number, fallback: number, max: number) {
  if (!Number.isFinite(value)) return fallback
  const parsed = Math.floor(value)
  if (parsed <= 0) return fallback
  return Math.min(parsed, max)
}

function cleanGameQuery(query: string) {
  const removablePhrases = [
    'complete in box',
    'cib',
    'box and game',
    'case and game',
    'disc only',
    'game only',
    'cartridge only',
    'players choice',
    "player's choice",
    'platinum hits',
    'greatest hits',
  ]

  let cleaned = query
  cleaned = cleaned.replace(/\([^)]*\)/g, ' ')
  cleaned = cleaned.replace(/\[[^\]]*\]/g, ' ')
  cleaned = cleaned.replace(/[-_/]+/g, ' ')

  for (const phrase of removablePhrases) {
    const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'ig')
    cleaned = cleaned.replace(pattern, ' ')
  }

  return normalizeWhitespace(cleaned)
}

function buildSearchCandidates(query: string, consoleName?: string) {
  const candidates: string[] = []
  const original = sanitizeInput(query, MAX_QUERY_LENGTH)
  if (!original) {
    return []
  }

  const cleaned = cleanGameQuery(query)
  const safeCleaned = sanitizeInput(cleaned, MAX_QUERY_LENGTH)

  if (original) {
    candidates.push(original)
  }

  if (safeCleaned && safeCleaned.toLowerCase() !== original.toLowerCase()) {
    candidates.push(safeCleaned)
  }

  if (consoleName) {
    const safeConsole = sanitizeInput(consoleName, MAX_CONSOLE_LENGTH)
    const withConsole = normalizeWhitespace(`${safeCleaned || original} ${safeConsole}`)
    if (withConsole) {
      candidates.push(withConsole)
    }
  }

  return Array.from(new Set(candidates.filter(Boolean)))
}

async function fetchWithTimeout(url: string, options: RequestInit) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function getAccessToken(): Promise<string | null> {
  if (!IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET) {
    console.warn('TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET not set. Game image search will not work.')
    return null
  }

  const now = Date.now()
  if (tokenCache && now < tokenCache.expiresAt - 60_000) {
    return tokenCache.token
  }

  try {
    const body = new URLSearchParams({
      client_id: IGDB_CLIENT_ID,
      client_secret: IGDB_CLIENT_SECRET,
      grant_type: 'client_credentials',
    })

    const response = await fetchWithTimeout(TWITCH_TOKEN_URL, {
      method: 'POST',
      body,
    })

    if (!response.ok) {
      console.error('Twitch token error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    if (!data.access_token || !data.expires_in) {
      console.error('Invalid token response from Twitch.')
      return null
    }

    tokenCache = {
      token: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    }

    return tokenCache.token
  } catch (error) {
    console.error('Error fetching IGDB access token:', error)
    return null
  }
}

export async function searchGames(
  query: string,
  consoleName?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<IGDBGame[] | null> {
  const token = await getAccessToken()
  if (!token) {
    return null
  }

  const safePage = safePositiveInt(page, 1, MAX_PAGE)
  const safePageSize = safePositiveInt(pageSize, 10, MAX_PAGE_SIZE)
  const offset = Math.max(0, (safePage - 1) * safePageSize)
  const searchCandidates = buildSearchCandidates(query, consoleName)

  for (const searchText of searchCandidates) {
    const result = await searchGamesOnce(token, searchText, offset, safePageSize)
    if (result === null) {
      return null
    }

    if (result.length > 0) {
      return result
    }
  }

  return []
}

export function getCoverImageUrl(imageId?: string | null) {
  if (!imageId) {
    return null
  }

  return buildCoverUrl(imageId, 't_cover_big_2x')
}

async function searchGamesOnce(token: string, searchText: string, offset: number, pageSize: number) {
  const apicalypse = [
    'fields name, cover.image_id, first_release_date, platforms.name;',
    `search "${escapeSearchText(searchText)}";`,
    'where cover != null;',
    `limit ${pageSize};`,
    offset > 0 ? `offset ${offset};` : null,
  ]
    .filter(Boolean)
    .join(' ')

  try {
    const response = await fetchWithTimeout(`${IGDB_BASE_URL}/games`, {
      method: 'POST',
      headers: {
        'Client-ID': IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'text/plain',
      },
      body: apicalypse,
    })

    if (!response.ok) {
      const errorText = (await response.text()).slice(0, 500)
      console.error('IGDB API error:', response.status, response.statusText, errorText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error searching IGDB:', error)
    return null
  }
}
