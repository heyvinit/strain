import { CheerioAPI } from 'cheerio'
import { ScrapeResult } from '../types'

export function parseWebscorer($: CheerioAPI, url: string): ScrapeResult {
  try {
    const urlObj = new URL(url)

    // Webscorer individual result: raceid + racer param OR name param
    const racerId = urlObj.searchParams.get('racer') || urlObj.searchParams.get('runnerid')
    const nameParam = urlObj.searchParams.get('name')

    const raceName =
      $('h1.race-name, h1.race-title, #race-name, .race-header h1').first().text().trim() ||
      $('title').text().split('-')[0].trim() ||
      $('h1').first().text().trim()

    const raceDate =
      $('.race-date, .event-date, [class*="date"]').first().text().trim() ||
      $('time').first().text().trim()

    // Try to find the specific runner row
    let runnerRow = null

    if (racerId) {
      runnerRow = $(`[data-racer="${racerId}"], [data-runner="${racerId}"], tr[id*="${racerId}"]`)
    }
    if (!runnerRow || runnerRow.length === 0) {
      // Look for highlighted/selected row (current result)
      runnerRow = $('tr.highlight, tr.selected, tr.current, .result-highlight, .my-result')
    }

    // Count total result rows — if many, it's a leaderboard
    const resultRows = $('table.results tr, table.result-table tr, .results-table tr').filter(
      (_, el) => $(el).find('td').length > 2
    )
    if (resultRows.length > 5 && runnerRow && runnerRow.length === 0) {
      return {
        success: false,
        isLeaderboardPage: true,
        error: 'leaderboard',
      }
    }

    const targetRow = runnerRow && runnerRow.length > 0 ? runnerRow.first() : null

    const runnerName =
      (targetRow ? targetRow.find('td.name, td[data-field="name"], .runner-name').text().trim() : '') ||
      (nameParam ? decodeURIComponent(nameParam) : '') ||
      $('.runner-name, .participant-name, td.name').first().text().trim()

    const netTime =
      (targetRow ? targetRow.find('td.time, td[data-field="time"], .net-time').text().trim() : '') ||
      $('.finish-time, .net-time, td.time').first().text().trim()

    const bibNumber =
      (targetRow ? targetRow.find('td.bib, td[data-field="bib"]').text().trim() : '') ||
      $('.bib-number, td.bib').first().text().trim()

    const distance =
      $('.race-distance, .distance, [class*="distance"]').first().text().trim() ||
      $('h2, h3').filter((_, el) => /km|mile|marathon|half/i.test($(el).text())).first().text().trim()

    const pace =
      (targetRow ? targetRow.find('td.pace, td[data-field="pace"]').text().trim() : '') ||
      $('.pace, td.pace').first().text().trim()

    const position =
      (targetRow ? targetRow.find('td.place, td.position, td:first-child').text().trim() : '') ||
      ''

    if (!netTime && !runnerName) {
      return { success: false, error: 'Could not extract runner data from this Webscorer page.' }
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
        platform: 'Webscorer',
      },
    }
  } catch {
    return { success: false, error: 'Failed to parse Webscorer page.' }
  }
}
