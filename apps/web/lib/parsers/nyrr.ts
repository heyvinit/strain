import axios from 'axios'
import { ScrapeResult } from '../types'

const API_BASE = 'https://rmsprodapi.nyrr.org/api/v2'
const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Origin: 'https://results.nyrr.org',
  Referer: 'https://results.nyrr.org/',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
}

export async function parseNyrr(url: string): Promise<ScrapeResult> {
  // URL pattern: results.nyrr.org/event/{eventCode}/result/{bib}
  const match = url.match(/\/event\/([^/]+)\/result\/([^/?#]+)/)
  if (!match) {
    return { success: false, error: 'Could not parse NYRR result URL.' }
  }

  const eventCode = match[1]
  const bib = match[2]

  try {
    // Fetch runner result and event overview in parallel
    const [runnerRes, eventRes] = await Promise.allSettled([
      axios.post(`${API_BASE}/runners/eventRunner`, { eventCode, bib }, { headers: HEADERS, timeout: 15000 }),
      axios.post(`${API_BASE}/events/overview`, { eventCode }, { headers: HEADERS, timeout: 15000 }),
    ])

    if (runnerRes.status === 'rejected' || !runnerRes.value.data?.success) {
      return { success: false, error: 'Could not fetch your NYRR result. Please check the link.' }
    }

    const finisher = runnerRes.value.data.finisher
    if (!finisher) {
      return { success: false, error: 'No result found for this bib number.' }
    }

    const event = eventRes.status === 'fulfilled' ? eventRes.value.data : null

    const raceName = event?.name || `NYRR ${eventCode}`
    const raceDate = event?.date
      ? new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : ''

    const distance = event?.distanceName || event?.distance || ''

    const runnerName = [finisher.firstName, finisher.lastName].filter(Boolean).join(' ')

    // Position: overall + gender
    const overallPos = finisher.overallPlace
      ? `${finisher.overallPlace}${finisher.totalFinishers ? `/${finisher.totalFinishers}` : ''}`
      : undefined
    const genderPos = finisher.genderPlace
      ? `${finisher.genderPlace}${finisher.totalGenderFinishers ? `/${finisher.totalGenderFinishers}` : ''}`
      : undefined

    return {
      success: true,
      data: {
        raceName,
        raceDate,
        runnerName,
        bibNumber: String(finisher.bib || bib),
        distance,
        netTime: finisher.overallTime || '',
        pace: finisher.pace || undefined,
        overallPosition: overallPos,
        categoryPosition: genderPos,
        category: finisher.gender ? (finisher.gender === 'M' ? 'Male' : 'Female') : undefined,
        platform: 'NYRR',
      },
    }
  } catch (err) {
    console.error('[nyrr parser error]', err)
    return { success: false, error: 'Failed to fetch NYRR result data.' }
  }
}
