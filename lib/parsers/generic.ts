import { CheerioAPI } from 'cheerio'
import Anthropic from '@anthropic-ai/sdk'
import { RaceData, ScrapeResult } from '../types'

const TIME_REGEX = /\b(\d{1,2}):(\d{2}):(\d{2})\b/g
const DISTANCE_REGEX = /\b(\d+\.?\d*)\s*(km|k|kilometers?|miles?|mi|KM|K)\b/gi
const DATE_REGEX = /\b(\d{1,2}[\/\-\s]\w+[\/\-\s]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})\b/i
const PACE_REGEX = /(\d{1,2}:\d{2})\s*(?:\/km|per km|min\/km|\/mile|per mile|min\/mi)/i

function extractLabelValuePairs($: CheerioAPI): Record<string, string> {
  const pairs: Record<string, string> = {}

  $('table tr').each((_, row) => {
    const cells = $(row).find('td, th')
    if (cells.length >= 2) {
      const label = $(cells[0]).text().trim().toLowerCase().replace(/[^a-z0-9\s]/g, '')
      const value = $(cells[1]).text().trim()
      if (label && value && label.length < 50 && value.length < 100) {
        pairs[label] = value
      }
    }
  })

  $('dl').each((_, dl) => {
    $(dl).find('dt').each((_, dt) => {
      const label = $(dt).text().trim().toLowerCase()
      const value = $(dt).next('dd').text().trim()
      if (label && value) pairs[label] = value
    })
  })

  // Divs/spans with colon-separated label:value
  $('[class*="result"], [class*="stat"], [class*="detail"], [class*="info"], [class*="field"], [class*="row"]').each(
    (_, el) => {
      const text = $(el).text().trim()
      const colonIdx = text.indexOf(':')
      if (colonIdx > 0 && colonIdx < 35 && text.length < 120) {
        const label = text.substring(0, colonIdx).trim().toLowerCase()
        const value = text.substring(colonIdx + 1).trim().split('\n')[0].trim()
        if (label && value && value.length < 80) pairs[label] = value
      }
    }
  )

  // Sibling-based scan: handles flex/grid card layouts where label and value
  // are separate child elements of a common parent, e.g.:
  //   <div><span>OFFICIAL TIME</span><span>01:57:09</span></div>
  const SIBLING_LABELS = /official[\s_]?time|net[\s_]?time|chip[\s_]?time|gun[\s_]?time|finish[\s_]?time|total[\s_]?time|avg[\s_]?pace|overall|position|rank|bib/i
  $('*').each((_, container) => {
    const kids = $(container).children().toArray()
    if (kids.length < 2 || kids.length > 6) return
    for (const kid of kids) {
      const kidText = $(kid).text().trim()
      if (!SIBLING_LABELS.test(kidText) || kidText.length > 50) continue
      const label = kidText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim()
      if (pairs[label]) continue // already found via a more structured extractor
      for (const sib of kids) {
        if (sib === kid) continue
        const val = $(sib).text().trim()
        if (val.length > 0 && val.length < 80) {
          pairs[label] = val
          break
        }
      }
    }
  })

  return pairs
}

function classifyPairs(pairs: Record<string, string>): { data: Partial<RaceData>; netTimeLabeled: boolean } {
  const data: Partial<RaceData> = {}
  const allTimes: string[] = []
  let netTimeLabeled = false

  for (const [label, value] of Object.entries(pairs)) {
    TIME_REGEX.lastIndex = 0
    if (TIME_REGEX.test(value)) allTimes.push(value)

    TIME_REGEX.lastIndex = 0
    // Net/Chip time
    if (/net|chip|finish|result|zeit|temps|tiempo|tempo|official/.test(label) && TIME_REGEX.test(value)) {
      data.netTime = value.match(TIME_REGEX)?.[0] || value
      netTimeLabeled = true
    }
    // Gun time
    if (/gun|gross|clock|wall/.test(label)) {
      TIME_REGEX.lastIndex = 0
      if (TIME_REGEX.test(value)) data.gunTime = value.match(TIME_REGEX)?.[0] || value
    }
    // Plain "time" or "finish time" → net time
    if (/^time$|^finish time$|^race time$|^total time$/.test(label)) {
      TIME_REGEX.lastIndex = 0
      if (!data.netTime && TIME_REGEX.test(value)) data.netTime = value.match(TIME_REGEX)?.[0] || value
    }
    // BIB
    if (/^bib$|bib no|race no|start no|number|startnr|nr\.|dorsale/.test(label)) {
      data.bibNumber = value.replace(/[^\d\w]/g, '').substring(0, 10)
    }
    // Distance
    if (/^distance$|^dist$|^km$|category distance/.test(label)) {
      data.distance = value
    }
    // Name
    if (/^name$|^runner$|^athlete$|^participant$|^finisher$|^competitor$/.test(label)) {
      if (!data.runnerName && value.length > 2 && value.length < 60) data.runnerName = value
    }
    // Position / Place
    if (/^place$|^position$|^rank$|^overall$|^pos$|placement|overall place/.test(label)) {
      data.overallPosition = value
    }
    // Category position
    if (/^category$|^division$|^age group$|^gender$|^class$|cat\./.test(label)) {
      if (/\d/.test(value)) data.categoryPosition = value
      else data.category = value
    }
    // Pace
    if (/pace|min\/km|tempo medio|avg pace/.test(label) || PACE_REGEX.test(value)) {
      data.pace = value
    }
    // Date
    if (/^date$|^race date$|event date/.test(label) && DATE_REGEX.test(value)) {
      data.raceDate = value
    }
  }

  if (!data.netTime && allTimes.length > 0) {
    // Pick the largest time value as net time (usually the race time, not a split).
    // The sibling-based extractor above should catch labeled times first, so this
    // fallback is only reached on pages with no recognizable labels.
    const sorted = allTimes.sort((a, b) => {
      const toSecs = (t: string) => {
        const p = t.split(':').map(Number)
        return p[0] * 3600 + p[1] * 60 + (p[2] || 0)
      }
      return toSecs(b) - toSecs(a)
    })
    data.netTime = sorted[0]
  }

  return { data, netTimeLabeled }
}

function isLeaderboard($: CheerioAPI): boolean {
  // Identify splits/checkpoint tables (individual result pages) — skip their rows
  const splitsTbodies = new Set<unknown>()
  $('table').each((_, table) => {
    const headerText = $(table).find('thead th, thead td').map((_, el) => $(el).text().trim().toLowerCase()).toArray().join(' ')
    if (/split|location|checkpoint|segment|lap/.test(headerText)) {
      $(table).find('tbody').each((_, tbody) => { splitsTbodies.add(tbody) })
    }
  })

  // Count rows that contain a time pattern, excluding splits tables
  let timeRowCount = 0
  $('table tbody tr, [class*="result-row"], [class*="runner-row"]').each((_, el) => {
    if (splitsTbodies.has($(el).parent()[0])) return
    TIME_REGEX.lastIndex = 0
    if (TIME_REGEX.test($(el).text())) timeRowCount++
  })
  TIME_REGEX.lastIndex = 0
  return timeRowCount > 8
}

function extractCleanText($: CheerioAPI): string {
  // Clone and strip noise
  const $clone = $
  $clone('nav, footer, header, script, style, select, option, .nav, .footer, .header, .menu, .sidebar, .ad, .cookie, .social, .share, .modal, iframe').remove()

  // Get structured text — preserve newlines between elements
  const lines: string[] = []
  $clone('body *').each((_, el) => {
    if ($clone(el).children().length === 0) {
      const text = $clone(el).text().trim()
      if (text.length > 0 && text.length < 200) lines.push(text)
    }
  })

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim().substring(0, 10000)
}

async function aiExtract(pageText: string, url: string): Promise<ScrapeResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: 'Could not extract race data from this page. Please ensure the link goes to your individual result, not the full leaderboard.' }
  }

  try {
    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [
        {
          role: 'user',
          content: `Extract individual runner race result data from the page content below.

CRITICAL DISTINCTIONS:
- "raceName" = the name of the RACE/EVENT (e.g. "Mumbai Marathon 2025", "City 10K Run") — NOT a person's name
- "runnerName" = the name of the PERSON who ran (e.g. "John Smith", "Priya Patel") — looks like a human name, NOT a race name
- Race names contain words like: Marathon, Run, Race, Triathlon, km, K, 10K, Half, Full, Open, Championship, Cup
- Runner names are personal names (first + last name, sometimes all caps)
- "netTime"/"gunTime" = finish times in HH:MM:SS format (e.g. "1:45:23", "01:45:53")
- "pace" = per-km pace in MM:SS format (e.g. "5:02", "6:32") — NOT a full race time
- "overallPosition" = rank among all finishers, format "234" or "234/8920"
- If the page shows a TABLE with MANY runners, set isLeaderboard:true

Return ONLY valid JSON, no markdown:
{
  "raceName": string or null,
  "raceDate": string or null,
  "runnerName": string or null,
  "bibNumber": string or null,
  "distance": "distance with unit e.g. 21.1 KM, 42.2 KM, 10 KM",
  "netTime": "HH:MM:SS or null",
  "gunTime": "HH:MM:SS or null",
  "pace": "M:SS or MM:SS or null",
  "overallPosition": string or null,
  "categoryPosition": string or null,
  "category": string or null,
  "isLeaderboard": boolean
}

URL (may contain race/event info): ${url}

Page content:
${pageText}`,
        },
      ],
    })

    const responseText = (message.content[0] as { type: string; text: string }).text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')

    const extracted = JSON.parse(jsonMatch[0])

    if (extracted.isLeaderboard) {
      return { success: false, isLeaderboardPage: true, error: 'leaderboard' }
    }

    if (!extracted.netTime && !extracted.runnerName) {
      return {
        success: false,
        error:
          "Could not find individual race result data on this page. Please make sure the URL links to your specific result — not the full race leaderboard.",
      }
    }

    return {
      success: true,
      data: {
        raceName: extracted.raceName || 'Race',
        raceDate: extracted.raceDate || '',
        runnerName: extracted.runnerName || '',
        bibNumber: extracted.bibNumber || '',
        distance: extracted.distance || '',
        netTime: extracted.netTime || '',
        gunTime: extracted.gunTime || undefined,
        pace: extracted.pace || undefined,
        overallPosition: extracted.overallPosition || undefined,
        categoryPosition: extracted.categoryPosition || undefined,
        category: extracted.category || undefined,
        platform: 'AI Extracted',
      },
    }
  } catch (err) {
    console.error('[AI extraction error]', err)
    return { success: false, error: 'Could not extract race data. Please try a direct link to your individual result.' }
  }
}

export async function parseGeneric($: CheerioAPI, url: string, rawHtml: string): Promise<ScrapeResult> {
  try {
    // Step 1: Leaderboard check — but only if no specific runner is highlighted
    if (isLeaderboard($)) {
      const highlighted = $('tr.highlight, tr.active, tr.selected, .my-result, .current-runner, [class*="highlighted"]')
      if (highlighted.length === 0) {
        return { success: false, isLeaderboardPage: true, error: 'leaderboard' }
      }
    }

    // Step 2: Race name from page title/heading
    const raceName =
      $('h1').first().text().trim() ||
      $('title').text().split(/[-|]/)[0].trim()

    const raceDate =
      $('[class*="date"], [class*="Date"], time').first().text().trim() ||
      (() => { const m = $('body').text().match(DATE_REGEX); return m ? m[0] : '' })()

    // Step 3: Extract structured pairs and classify
    const pairs = extractLabelValuePairs($)
    console.log('[generic] Extracted pairs:', JSON.stringify(pairs, null, 2))
    const { data: classified, netTimeLabeled } = classifyPairs(pairs)

    // Step 4: Runner name from heading if not found in pairs
    if (!classified.runnerName) {
      $('h2, h3, h4').each((_, el) => {
        const text = $(el).text().trim()
        if (text.length > 3 && text.length < 60 && !/race|event|result|welcome|login|register/i.test(text)) {
          classified.runnerName = text
          return false // break
        }
      })
    }

    // Step 5: JSON-LD structured data
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).text())
        if (json['@type'] === 'SportsEvent' || json['@type'] === 'Event') {
          if (!classified.runnerName && json.competitor?.name) classified.runnerName = json.competitor.name
          if (!raceName && json.name) classified.raceName = json.name
        }
      } catch { /* ignore */ }
    })

    console.log('[generic] Classified data:', JSON.stringify(classified, null, 2))

    // Step 6: Return if we have enough — only when netTime was matched via a label.
    // If it came from the "largest time" fallback, skip to AI which can read
    // labelled fields like "OFFICIAL TIME" that the pair extractor may have missed.
    if (classified.netTime && netTimeLabeled) {
      return {
        success: true,
        data: {
          raceName: raceName || (classified as Partial<RaceData> & { raceName?: string }).raceName || 'Race',
          raceDate: raceDate || classified.raceDate || '',
          runnerName: classified.runnerName || '',
          bibNumber: classified.bibNumber || '',
          distance: classified.distance || '',
          netTime: classified.netTime,
          gunTime: classified.gunTime,
          pace: classified.pace,
          overallPosition: classified.overallPosition,
          categoryPosition: classified.categoryPosition,
          category: classified.category,
          platform: 'Generic',
        },
      }
    }

    // Step 7: AI fallback
    console.log('[generic] Falling back to AI extraction...')
    const pageText = extractCleanText($)
    console.log('[generic] Page text length for AI:', pageText.length)
    return await aiExtract(pageText, url)
  } catch (err) {
    console.error('[generic parser error]', err)
    return { success: false, error: 'Failed to parse this page.' }
  }
}
