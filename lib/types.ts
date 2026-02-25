export interface RaceData {
  raceName: string
  raceDate: string
  runnerName: string
  bibNumber: string
  distance: string
  netTime: string
  gunTime?: string
  pace?: string
  overallPosition?: string
  categoryPosition?: string
  category?: string
  platform: string
}

export interface ScrapeResult {
  success: boolean
  data?: RaceData
  error?: string
  isLeaderboardPage?: boolean
  hint?: string
}

export interface CardStyle {
  textColor: string
  fontFamily: 'inter' | 'mono' | 'grotesk'
  template: 'classic' | 'bold' | 'minimal'
  showBib: boolean
  showPosition: boolean
  showPace: boolean
  showCategory: boolean
  textShadow: boolean
  layout: 'story' | 'square' | 'wide'
  noteRaw: string
  notes: string[]
}
