import { NextRequest, NextResponse } from 'next/server'
import { scrapeRaceResult } from '@/lib/scraper'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A race result URL is required.' },
        { status: 400 }
      )
    }

    if (url.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid race result URL.' },
        { status: 400 }
      )
    }

    const result = await scrapeRaceResult(url)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
