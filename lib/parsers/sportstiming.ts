import { CheerioAPI } from 'cheerio'
import { ScrapeResult } from '../types'

const DISTANCE_MAP: Record<string, string> = {
  'marathon': '42.2 KM',
  'full marathon': '42.2 KM',
  'half marathon': '21.1 KM',
  '10k': '10 KM',
  'open 10k': '10 KM',
  '5k': '5 KM',
  'dream run': '6 KM',
}

function resolveDistance(raw: string): string {
  const lower = raw.toLowerCase().trim()
  // Check exact match first
  if (DISTANCE_MAP[lower]) return DISTANCE_MAP[lower]
  // Check partial match
  for (const [key, val] of Object.entries(DISTANCE_MAP)) {
    if (lower.includes(key)) return val
  }
  // If it already has "km" or "k" it's already a distance
  if (/\d+\.?\d*\s*(km|k)/i.test(raw)) return raw
  return raw // return as-is (e.g., "Marathon")
}

// Extract race name from the base64-encoded `q` URL param: {"e_name":"Tata Mumbai Marathon 2026",...}
function extractRaceNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const q = urlObj.searchParams.get('q')
    if (!q) return ''
    const decoded = Buffer.from(decodeURIComponent(q), 'base64').toString('utf-8')
    const parsed = JSON.parse(decoded)
    return parsed.e_name || parsed.eventName || parsed.name || ''
  } catch {
    return ''
  }
}

function getTextLines($: CheerioAPI): string[] {
  const lines: string[] = []
  $('body *').each((_, el) => {
    if ($(el).children().length === 0) {
      const t = $(el).text().trim()
      if (t.length >= 2 && t.length <= 200) lines.push(t)
    }
  })
  return lines
}

export function parseSportstiming($: CheerioAPI, url: string): ScrapeResult {
  try {
    const lines = getTextLines($)

    // Race name from URL q param
    const raceName = extractRaceNameFromUrl(url) || $('title').text().split('|')[0].trim()

    // Find runner name: first all-caps line that looks like a full name (2+ words)
    // It's preceded by initials (e.g. "VG") then the full name "VINIT GHELANI"
    let runnerName = ''
    let runnerIdx = -1
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Full name: all caps, 2–5 words, 5–50 chars
      if (
        /^[A-Z][A-Z\s]{4,49}$/.test(line) &&
        line.trim().split(/\s+/).length >= 2 &&
        !/^(BIB|MARATHON|TIMINGS|RANK|OVERALL|GENDER|SPLITS|SEARCH|SELECT|RESULTS|DETAILS|PHOTOS|SHARE|CERTIFICATE)/.test(line)
      ) {
        runnerName = line.trim()
        runnerIdx = i
        break
      }
    }

    if (runnerIdx === -1) {
      return { success: false, error: 'Could not find runner name on this page.' }
    }

    const rest = lines.slice(runnerIdx + 1)

    // BIB — label "BIB No" followed by number
    const bibIdx = rest.findIndex(l => /^bib\s*(no\.?|number)?$/i.test(l))
    const bibNumber = bibIdx >= 0 ? rest[bibIdx + 1]?.replace(/\D/g, '') || '' : ''

    // Distance/Category — first meaningful line after BIB
    const distanceRaw = bibIdx >= 0 ? (rest[bibIdx + 2] || '') : ''
    const distance = resolveDistance(distanceRaw)

    // Finish time — label "Finish Time" followed by HH:MM:SS
    const finishIdx = rest.findIndex(l => /finish\s*time/i.test(l))
    const netTime = finishIdx >= 0 ? (rest[finishIdx + 1] || '') : ''

    // Pace — label "Chip Pace" or "Net Pace" followed by MM:SS
    const paceIdx = rest.findIndex(l => /pace/i.test(l))
    const rawPace = paceIdx >= 0 ? (rest[paceIdx + 1] || '') : ''
    // Clean "00:06:32" → "6:32" (remove leading zero hours)
    const pace = rawPace.replace(/^00:0?/, '').replace(/^0(\d:)/, '$1')

    // Overall rank — "Overall" label → rank → "OF XXXX"
    const overallIdx = rest.findIndex(l => /^overall$/i.test(l))
    const overallRank = overallIdx >= 0 ? rest[overallIdx + 1] || '' : ''
    const overallTotal = overallIdx >= 0 ? rest[overallIdx + 2]?.replace(/^of\s*/i, '') || '' : ''
    const overallPosition = overallRank
      ? overallTotal
        ? `${overallRank} / ${overallTotal}`
        : overallRank
      : undefined

    // Category — last named category line (e.g. "25 to 29 yrs Male")
    // It appears after gender rank block
    const categoryIdx = rest.findIndex(l => /\d+\s*(to|yrs|&)/i.test(l))
    const category = categoryIdx >= 0 ? rest[categoryIdx] : undefined

    // Category rank
    const catRank = categoryIdx >= 0 ? rest[categoryIdx + 1] || '' : ''
    const catTotal = categoryIdx >= 0 ? rest[categoryIdx + 2]?.replace(/^of\s*/i, '') || '' : ''
    const categoryPosition = catRank && /^\d+$/.test(catRank)
      ? catTotal ? `${catRank} / ${catTotal}` : catRank
      : undefined

    if (!netTime) {
      return { success: false, error: 'Could not extract finish time from this page.' }
    }

    return {
      success: true,
      data: {
        raceName: raceName || 'Race',
        raceDate: '',
        runnerName,
        bibNumber,
        distance,
        netTime,
        pace: pace || undefined,
        overallPosition,
        category: category || undefined,
        categoryPosition,
        platform: 'Sports Timing Solutions',
      },
    }
  } catch (err) {
    console.error('[sportstiming parser error]', err)
    return { success: false, error: 'Failed to parse Sports Timing Solutions page.' }
  }
}
