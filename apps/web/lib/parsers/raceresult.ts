import { CheerioAPI } from 'cheerio'
import { ScrapeResult } from '../types'

export function parseRaceResult($: CheerioAPI, url: string): ScrapeResult {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)

    // raceresult.com URLs:
    // my.raceresult.com/{eventId}/results#{hash}  — individual
    // my.raceresult.com/{eventId}/results         — leaderboard

    const hasHash = url.includes('#') && url.split('#')[1]?.length > 3

    // Look for JSON-LD or embedded JSON data (raceresult embeds data in script tags)
    let embeddedData: Record<string, string> = {}
    $('script[type="application/json"], script#result-data').each((_, el) => {
      try {
        const json = JSON.parse($(el).text())
        if (json.name || json.Name) embeddedData = json
      } catch {
        // ignore
      }
    })

    const raceName =
      embeddedData.EventName ||
      embeddedData.event ||
      $('h1, .event-name, .race-name').first().text().trim() ||
      $('title').text().split('|')[0].trim()

    const raceDate =
      embeddedData.EventDate ||
      $('.event-date, .race-date').first().text().trim()

    const runnerName =
      embeddedData.Name ||
      embeddedData.name ||
      $('.participant-name, .runner-name, h2.name').first().text().trim()

    const netTime =
      embeddedData.NetTime ||
      embeddedData.FinishTime ||
      $('.net-time, .finish-time, [data-field="NetTime"]').first().text().trim()

    const bibNumber =
      embeddedData.BibNumber ||
      embeddedData.Bib ||
      $('.bib, .bib-number, [data-field="BibNumber"]').first().text().trim()

    const distance =
      embeddedData.Distance ||
      $('.distance, .race-distance').first().text().trim()

    const pace =
      embeddedData.Pace ||
      $('.pace, [data-field="Pace"]').first().text().trim()

    const position =
      embeddedData.PlaceTotal ||
      $('.place, .position, [data-field="Place"]').first().text().trim()

    // Detect leaderboard — no individual hash and many result rows
    const resultRowCount = $('table tbody tr, .result-row').length
    if (resultRowCount > 10 && !hasHash && !runnerName && !netTime) {
      return {
        success: false,
        isLeaderboardPage: true,
        error: 'leaderboard',
      }
    }

    if (!netTime && !runnerName) {
      return { success: false, error: 'Could not extract runner data from this RaceResult page.' }
    }

    return {
      success: true,
      data: {
        raceName: raceName || 'Race',
        raceDate: raceDate || '',
        runnerName: runnerName || '',
        bibNumber: bibNumber || '',
        distance: distance || '',
        netTime: netTime || '',
        pace: pace || undefined,
        overallPosition: position || undefined,
        platform: 'RaceResult',
      },
    }
  } catch {
    return { success: false, error: 'Failed to parse RaceResult page.' }
  }
}
