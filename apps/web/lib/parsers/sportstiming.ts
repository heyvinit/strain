import axios from 'axios'
import { ScrapeResult } from '../types'

const API_BASE = 'https://sportstimingsolutions.in/frontend/api'
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  Referer: 'https://sportstimingsolutions.in/',
  Origin: 'https://sportstimingsolutions.in',
}

const DISTANCE_MAP: Record<string, string> = {
  'marathon': '42.2 KM',
  'full marathon': '42.2 KM',
  'half marathon': '21.1 KM',
  '10k': '10 KM',
  'open 10k': '10 KM',
  '5k': '5 KM',
  'dream run': '6 KM',
  '50 kms': '50 KM',
  '35 kms': '35 KM',
  '25 kms': '25 KM',
}

function resolveDistance(raw: string): string {
  const lower = raw.toLowerCase().trim()
  if (DISTANCE_MAP[lower]) return DISTANCE_MAP[lower]
  for (const [key, val] of Object.entries(DISTANCE_MAP)) {
    if (lower.includes(key)) return val
  }
  if (/\d+\.?\d*\s*(km|k)/i.test(raw)) return raw
  return raw
}

// Decode the base64 `data` field returned by the API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeApiData(response: any): any {
  if (response?.data && typeof response.data === 'string') {
    try {
      return JSON.parse(Buffer.from(response.data, 'base64').toString('utf-8'))
    } catch { /* fall through */ }
  }
  return response
}

export async function parseSportstiming(url: string): Promise<ScrapeResult> {
  // Decode the base64 q param to get event_id and bibNo
  let eventId: string
  let bibNo: string
  let raceName = ''

  try {
    const urlObj = new URL(url)
    const q = urlObj.searchParams.get('q')
    if (!q) return { success: false, error: 'Missing q parameter in Sports Timing URL.' }
    const decoded = JSON.parse(Buffer.from(decodeURIComponent(q), 'base64').toString('utf-8'))
    eventId = String(decoded.e_id || decoded.eventId || '')
    bibNo = String(decoded.bibNo || decoded.bib_no || decoded.bib || '')
    raceName = decoded.e_name || decoded.eventName || ''
    if (!eventId || !bibNo) return { success: false, error: 'Could not parse event ID or bib from URL.' }
  } catch {
    return { success: false, error: 'Invalid Sports Timing Solutions URL format.' }
  }

  try {
    const res = await axios.get(
      `${API_BASE}/event/bib/result?event_id=${eventId}&bibNo=${bibNo}`,
      { headers: HEADERS, timeout: 15000 }
    )
    const data = decodeApiData(res.data)

    const event = data?.event || {}
    const race = data?.race || {}
    const participant = data?.participant || {}
    const brackets: Array<Record<string, unknown>> = data?.brackets || []

    const runnerName = String(
      participant.full_name ||
      [participant.first_name, participant.last_name].filter(Boolean).join(' ') ||
      ''
    ).trim()

    // Overall bracket first
    const overall = brackets.find((b) => String(b.bracket_name).toLowerCase() === 'overall') || brackets[0]
    const netTime = String(overall?.finished_time || '').trim()
    const gunTime = overall?.gun_time ? String(overall.gun_time).trim() : undefined

    if (!runnerName && !netTime) {
      return { success: false, error: 'Could not extract result data from Sports Timing Solutions.' }
    }

    // Gender/age bracket for category
    const ageBracket = brackets.find((b) => /\d/.test(String(b.bracket_name)))
    const genderBracket = brackets.find((b) =>
      /^(male|female|men|women)$/i.test(String(b.bracket_name))
    )
    const category = ageBracket
      ? String(ageBracket.bracket_name)
      : genderBracket
      ? String(genderBracket.bracket_name)
      : participant.gender
      ? participant.gender === 'M' ? 'Male' : 'Female'
      : undefined

    const overallPosition = overall?.bracket_rank
      ? overall.bracket_participants
        ? `${overall.bracket_rank} / ${overall.bracket_participants}`
        : String(overall.bracket_rank)
      : undefined

    const catBracket = ageBracket || genderBracket
    const categoryPosition = catBracket?.bracket_rank
      ? catBracket.bracket_participants
        ? `${catBracket.bracket_rank} / ${catBracket.bracket_participants}`
        : String(catBracket.bracket_rank)
      : undefined

    const distance = resolveDistance(race.name ? String(race.name) : raceName)
    const raceDate = race.race_date
      ? new Date(String(race.race_date)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : ''

    return {
      success: true,
      data: {
        raceName: event.name || raceName || 'Race',
        raceDate,
        runnerName,
        bibNumber: String(participant.bibno || bibNo),
        distance,
        netTime,
        gunTime,
        overallPosition,
        category,
        categoryPosition,
        platform: 'Sports Timing Solutions',
      },
    }
  } catch (err) {
    console.error('[sportstiming parser error]', err)
    return { success: false, error: 'Failed to fetch Sports Timing Solutions result.' }
  }
}
