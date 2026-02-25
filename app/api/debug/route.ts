import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  const { url, usePuppeteer } = await req.json()

  try {
    let html = ''

    if (usePuppeteer) {
      const puppeteer = await import('puppeteer')
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      })
      const page = await browser.newPage()
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 })
      await new Promise(r => setTimeout(r, 2000))
      html = await page.content()
      await browser.close()
    } else {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' },
        timeout: 15000,
        responseType: 'text',
      })
      html = response.data as string
    }

    const $ = cheerio.load(html)
    $('script, style, nav, footer').remove()
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim()

    // Extract all text lines with length 2-100
    const lines: string[] = []
    $('body *').each((_, el) => {
      if ($(el).children().length === 0) {
        const t = $(el).text().trim()
        if (t.length >= 2 && t.length <= 150) lines.push(t)
      }
    })

    return NextResponse.json({
      htmlLength: html.length,
      bodyTextLength: bodyText.length,
      bodyTextPreview: bodyText.substring(0, 4000),
      title: $('title').text(),
      h1: $('h1').map((_, el) => $(el).text().trim()).get(),
      h2: $('h2').map((_, el) => $(el).text().trim()).get(),
      tableCount: $('table').length,
      lines: lines.slice(0, 80),
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
