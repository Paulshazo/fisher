export type Status = 'På väg' | 'Lossat' | 'Försenat'

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
  created_at: string
  updated_at: string
}
