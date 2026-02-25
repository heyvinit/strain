import { CheerioAPI } from 'cheerio'
import { ScrapeResult } from '../types'

export function parseAthlinks($: CheerioAPI, url: string): ScrapeResult {
  try {
    // Athlinks individual URL pattern:
    // athlinks.com/event/{id}/results/Race/{raceId}/Bib/{bibNo}
    // athlinks.com/event/{id}/results/Race/{raceId}/Entrant/{entrantId}
    const bibMatch = url.match(/\/Bib\/(\d+)/i)
    const bibFromUrl = bibMatch?.[1] || ''

    const raceName =
      $('h1[class*="event"], h1[class*="race"], .event-name').first().text().trim() ||
      $('h1').first().text().trim() ||
      $('title').text().split('|')[0].trim()

    const raceDate =
      $('[class*="date"], [class*="Date"]').first().text().trim()

    const runnerName =
      $('[class*="athlete"], [class*="Athlete"], [class*="participant"]').first().text().trim() ||
      $('h2').first().text().trim()

    const netTime =
      $('[class*="chip-time"], [class*="ChipTime"], [class*="net-time"]').first().text().trim() ||
      $('[class*="finish-time"], [class*="FinishTime"]').first().text().trim()

    const gunTime =
      $('[class*="gun-time"], [class*="GunTime"]').first().text().trim()

    const bibNumber =
      bibFromUrl ||
      $('[class*="bib"], [class*="Bib"]').first().text().replace(/\D/g, '') ||
      ''

    const distance =
      $('[class*="distance"], [class*="Distance"]').first().text().trim()

    const pace =
      $('[class*="pace"], [class*="Pace"]').first().text().trim()

    const position =
      $('[class*="overall-place"], [class*="OverallPlace"], [class*="place"]').first().text().trim()

    const category =
      $('[class*="division"], [class*="Division"], [class*="age-group"]').first().text().trim()

    if (!netTime && !runnerName) {
      return { success: false, error: 'Could not extract runner data from this Athlinks page.' }
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
        gunTime: gunTime || undefined,
        pace: pace || undefined,
        overallPosition: position || undefined,
        category: category || undefined,
        platform: 'Athlinks',
      },
    }
  } catch {
    return { success: false, error: 'Failed to parse Athlinks page.' }
  }
}
