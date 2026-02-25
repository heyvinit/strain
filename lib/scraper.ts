import axios from 'axios'
import * as cheerio from 'cheerio'
import { RaceData, ScrapeResult } from './types'
import { parseWebscorer } from './parsers/webscorer'
import { parseRaceResult } from './parsers/raceresult'
import { parseAthlinks } from './parsers/athlinks'
import { parseIfinish } from './parsers/ifinish'
import { parseSportstiming } from './parsers/sportstiming'
import { parseGeneric } from './parsers/generic'

// ─── Field cleaners ───────────────────────────────────────────────────────────

function extractTime(raw: string): string {
  const m = raw.match(/\b(\d{1,2}:\d{2}:\d{2})\b/)
  return m ? m[1] : raw.trim()
}

function extractPace(raw: string): string {
  const matches = [...raw.matchAll(/\b(\d{1,2}:\d{2})\b/g)]
  for (const m of matches) {
    const idx = m.index ?? 0
    const before = raw[idx - 1]
    const after = raw[idx + m[0].length]
    if (before === ':' || after === ':') continue
    return m[1].replace(/^0(\d)/, '$1')
  }
  return raw.trim()
}

function extractNumber(raw: string): string {
  const m = raw.match(/\b(\d+)\b/)
  return m ? m[1] : raw.trim()
}

function extractPosition(raw: string): string {
  const m = raw.match(/(\d+)\s*[\/of]\s*(\d+)/i) || raw.match(/\b(\d+)\b/)
  return m ? m[0] : raw.trim()
}

function cleanRaceData(data: RaceData): RaceData {
  return {
    ...data,
    raceName: data.raceName.trim(),
    raceDate: data.raceDate.trim(),
    runnerName: data.runnerName.trim(),
    bibNumber: data.bibNumber ? extractNumber(data.bibNumber) : '',
    netTime: data.netTime ? extractTime(data.netTime) : '',
    gunTime: data.gunTime ? extractTime(data.gunTime) : undefined,
    pace: data.pace ? extractPace(data.pace) : undefined,
    overallPosition: data.overallPosition ? extractPosition(data.overallPosition) : undefined,
    categoryPosition: data.categoryPosition ? extractPosition(data.categoryPosition) : undefined,
    category: data.category?.trim() || undefined,
    distance: data.distance?.trim() || '',
  }
}

// ─── Platform detection ───────────────────────────────────────────────────────

type Platform =
  | 'webscorer'
  | 'raceresult'
  | 'athlinks'
  | 'ifinish'
  | 'sportstiming'
  | 'generic'

// Platforms whose static HTML already has all data (Axios is fine, fast)
const STATIC_PLATFORMS: Platform[] = ['webscorer', 'athlinks']

// Platforms that are definitely JS-rendered SPAs — always use Puppeteer
const JS_PLATFORMS: Platform[] = ['ifinish', 'sportstiming', 'raceresult']

function detectPlatform(hostname: string): Platform {
  if (hostname.includes('webscorer.com')) return 'webscorer'
  if (hostname.includes('raceresult.com')) return 'raceresult'
  if (hostname.includes('athlinks.com')) return 'athlinks'
  if (hostname.includes('ifinish.in')) return 'ifinish'
  if (hostname.includes('sportstimingsolutions.in')) return 'sportstiming'
  return 'generic'
}

// ─── Fetching ─────────────────────────────────────────────────────────────────

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
}

async function fetchWithAxios(url: string): Promise<string> {
  const response = await axios.get(url, {
    headers: HEADERS,
    timeout: 15000,
    maxRedirects: 5,
    responseType: 'text',
  })
  return response.data as string
}

async function fetchWithPuppeteer(url: string): Promise<string> {
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })
  try {
    const page = await browser.newPage()
    await page.setUserAgent(HEADERS['User-Agent'])
    await page.setViewport({ width: 390, height: 844 })
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 })
    // Extra wait for late-loading data
    await new Promise(r => setTimeout(r, 2000))
    return await page.content()
  } finally {
    await browser.close()
  }
}

// Check if Axios HTML is clearly just a JS shell (fast sanity check)
function looksLikeJsShell(html: string): boolean {
  const $ = cheerio.load(html)
  $('script, style, head').remove()
  const text = $('body').text().replace(/\s+/g, ' ').trim()
  // Plainly empty
  if (text.length < 600) return true
  // Angular/Vue/Handlebars template syntax — data not yet rendered
  if ((text.match(/\{\{[\s\S]*?\}\}/g) || []).length > 4) return true
  // React placeholder
  if (/enable javascript/i.test(text) && text.length < 2000) return true
  return false
}

async function fetchHtml(
  url: string,
  platform: Platform
): Promise<{ html: string; usedPuppeteer: boolean }> {
  // Known JS platforms: skip Axios entirely, go straight to Puppeteer
  if (JS_PLATFORMS.includes(platform)) {
    console.log(`[scraper] Known JS platform (${platform}), using Puppeteer directly`)
    return { html: await fetchWithPuppeteer(url), usedPuppeteer: true }
  }

  // Known static platforms: Axios only, no Puppeteer fallback needed
  if (STATIC_PLATFORMS.includes(platform)) {
    try {
      return { html: await fetchWithAxios(url), usedPuppeteer: false }
    } catch (err: unknown) {
      throw axiosError(err)
    }
  }

  // Generic unknown platform — try Axios first, then Puppeteer if it looks like a JS shell
  let axiosHtml = ''
  try {
    axiosHtml = await fetchWithAxios(url)
  } catch (err: unknown) {
    throw axiosError(err)
  }

  if (!looksLikeJsShell(axiosHtml)) {
    console.log('[scraper] Static HTML looks good, using Axios result')
    return { html: axiosHtml, usedPuppeteer: false }
  }

  console.log('[scraper] Static HTML is a JS shell, falling back to Puppeteer...')
  try {
    return { html: await fetchWithPuppeteer(url), usedPuppeteer: true }
  } catch {
    // Puppeteer failed — return the Axios HTML anyway and let the parser try
    console.log('[scraper] Puppeteer also failed, using Axios HTML as last resort')
    return { html: axiosHtml, usedPuppeteer: false }
  }
}

function axiosError(err: unknown): Error {
  const e = err as { code?: string; response?: { status: number } }
  if (e.response?.status === 403 || e.response?.status === 401)
    return new Error('This page requires login or is blocking automated access.')
  if (e.code === 'ENOTFOUND' || e.code === 'ECONNREFUSED')
    return new Error('Could not reach this website. Please check the URL.')
  return new Error('Failed to fetch the page. The site may be temporarily down.')
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function scrapeRaceResult(url: string): Promise<ScrapeResult> {
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

  let urlObj: URL
  try {
    urlObj = new URL(normalizedUrl)
  } catch {
    return { success: false, error: 'Invalid URL format. Please check the link and try again.' }
  }

  const hostname = urlObj.hostname.toLowerCase()
  const platform = detectPlatform(hostname)

  let html: string
  let usedPuppeteer = false

  try {
    const fetched = await fetchHtml(normalizedUrl, platform)
    html = fetched.html
    usedPuppeteer = fetched.usedPuppeteer
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch the page.' }
  }

  console.log(`[scraper] platform=${platform} puppeteer=${usedPuppeteer} html=${html.length}`)

  const $ = cheerio.load(html)

  let result: ScrapeResult
  switch (platform) {
    case 'webscorer':    result = parseWebscorer($, normalizedUrl); break
    case 'raceresult':  result = parseRaceResult($, normalizedUrl); break
    case 'athlinks':    result = parseAthlinks($, normalizedUrl); break
    case 'ifinish':     result = parseIfinish($, normalizedUrl); break
    case 'sportstiming': result = parseSportstiming($, normalizedUrl); break
    default:            result = await parseGeneric($, normalizedUrl, html)
  }

  if (!result.success && result.isLeaderboardPage) {
    return {
      success: false,
      isLeaderboardPage: true,
      error:
        "This link shows the full race leaderboard, not your individual result. Please find your specific result — search for your name or BIB number on the race website — then paste that individual link here.",
      hint: 'Tip: Look for a "Search" or "Find my result" option on the race results page.',
    }
  }

  if (result.success && result.data) {
    result.data = cleanRaceData(result.data)
  }

  return result
}
