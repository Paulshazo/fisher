export type Status = 'In Transit' | 'Received' | 'Delayed'

export interface Leverans {
  id: number
  datum: string | null
  levdatum: string | null
  transport: string | null
  regnr: string | null
  lev: string | null
  po: string | null
  artikel: string | null
  antal: string | null
  dock: string | null
  status: Status
  inav: string | null
  utcheckning: string | null
  komm: string | null
  org: string | null
  from_org: string | null
  created_at: string
  updated_at: string
}

export const ORGS = ['SE', 'UK', 'FR', 'DE', 'IR', 'SP'] as const
export type Org = typeof ORGS[number]
export const ORG_LABEL: Record<string, string> = {
  SE: 'Fisher SE', UK: 'Fisher UK', FR: 'Fisher FR',
  DE: 'Fisher DE', IR: 'Fisher IR', SP: 'Fisher SP',
}
