'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Leverans, Status } from '@/lib/types'

export async function createLeverans(input: Partial<Leverans>): Promise<{ data?: Leverans; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Ej inloggad.' }
  const payload = {
    datum: input.datum || null,
    levdatum: input.levdatum || null,
    transport: input.transport || null,
    regnr: input.regnr || null,
    lev: input.lev || null,
    po: input.po || null,
    artikel: input.artikel || null,
    antal: input.antal || null,
    dock: input.dock || null,
    status: (input.status || 'På väg') as Status,
    inav: input.inav || null,
    komm: input.komm || null,
    created_by: user.id,
  }
  const { data, error } = await supabase.from('leveranser').insert(payload).select('*').single()
  if (error) return { error: error.message }
  revalidatePath('/')
  return { data: data as Leverans }
}

export async function updateLeverans(id: number, patch: Partial<Leverans>): Promise<{ data?: Leverans; error?: string }> {
  const supabase = createClient()
  const { data, error } = await supabase.from('leveranser').update(patch).eq('id', id).select('*').single()
  if (error) return { error: error.message }
  revalidatePath('/')
  return { data: data as Leverans }
}

export async function deleteLeverans(id: number): Promise<{ ok?: boolean; error?: string }> {
  const supabase = createClient()
  const { error } = await supabase.from('leveranser').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
  return { ok: true }
}
