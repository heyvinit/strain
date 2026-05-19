import { CheerioAPI } from 'cheerio'
import { ScrapeResult } from '../types'

const DISTANCE_MAP: Record<string, string> = {
  'HALF MARATHON': '21.1 KM',
  'FULL MARATHON': '42.2 KM',
  'MARATHON': '42.2 KM',
  '10K': '10 KM',
  '10KM': '10 KM',
  '5K': '5 KM',
  '5KM': '5 KM',
  '3K': '3 KM',
  '3KM': '3 KM',
  '21K': '21 KM',
  '42K': '42 KM',
}

function resolveDistance(text: string): string {
  const upper = text.toUpperCase().trim()
  if (DISTANCE_MAP[upper]) return DISTANCE_MAP[upper]
  // Try extracting from race name string
  for (const [key, val] of Object.entries(DISTANCE_MAP)) {
    if (upper.includes(key)) return val
  }
  return text
}

// Extract all meaningful text lines from the rendered page
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

export function parseIfinish($: CheerioAPI, url: string): ScrapeResult {
  try {
    const lines = getTextLines($)

    // Locate the anchor: "RESULTS ARE PROVISIONAL..."
    let startIdx = lines.findIndex(l => l.includes('RESULTS ARE PROVISIONAL') || l.includes('PROVISIONAL'))
    if (startIdx === -1) {
      // Fallback: look for a line with MARATHON or 10K to find the result block
      startIdx = lines.findIndex(l => /marathon|10k|5k|21k|42k/i.test(l) && l.length > 15) - 1
    }

    // If no anchor found at all, fail early
    if (startIdx < 0) {
      return { success: false, error: 'Could not locate result data on this iFinish page.' }
    }

    const resultLines = lines.slice(startIdx + 1)

    // First line = race name
    const rawRaceName = resultLines[0] || ''
    // Clean race name — remove trailing "~ HALF MARATHON" etc. if it duplicates
    const raceName = rawRaceName.replace(/\s*~\s*.+$/i, '').trim() || rawRaceName

    // Second line = runner name
    const runnerName = resultLines[1] || ''

    // Third line = BIB
    const bibLine = resultLines[2] || ''
    const bibNumber = bibLine.replace(/\D/g, '')

    // Find Gender line (Male/Female)
    const genderLine = resultLines.find(l => /^(male|female|m|f)$/i.test(l)) || ''

    // Find distance — look for lines like "HALF MARATHON", "10K", etc.
    const distanceLine = resultLines.find(l => resolveDistance(l) !== l) || ''
    const distance = distanceLine ? resolveDistance(distanceLine) : resolveDistance(rawRaceName)

    // Find category: "Category - 18 TO 35"
    const categoryLine = resultLines.find(l => /^category\s*[-–]/i.test(l)) || ''
    const category = categoryLine.replace(/^category\s*[-–]\s*/i, '').trim()

    // Find a specific field by finding its label and reading the next line
    const findValue = (label: RegExp): string => {
      const idx = resultLines.findIndex(l => label.test(l))
      return idx >= 0 ? (resultLines[idx + 1] || '') : ''
    }

    const netTime = findValue(/^net time$/i)
    const grossTime = findValue(/^gross time$/i)
    // Prefer net pace; fall back to gross pace
    const netPaceRaw = findValue(/net pace/i) || findValue(/gross pace/i)
    // Strip leading zero: "05:01" → "5:01"
    const pace = netPaceRaw.replace(/^0(\d:)/, '$1')

    const overallRankRaw = findValue(/^overall rank$/i)
    const genderRankRaw = findValue(/^gender rank$/i)

    // Build overall position string
    const overallPosition = overallRankRaw
      ? genderRankRaw
        ? `${overallRankRaw} overall`
        : overallRankRaw
      : undefined

    if (!netTime && !runnerName) {
      return { success: false, error: 'Could not extract result data from this iFinish page.' }
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
        gunTime: grossTime || undefined,
        pace: pace || undefined,
        overallPosition,
        category: category || undefined,
        platform: 'iFinish',
      },
    }
  } catch (err) {
    console.error('[ifinish parser error]', err)
    return { success: false, error: 'Failed to parse iFinish page.' }
  }
}
