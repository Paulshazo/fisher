import { createClient } from '@/lib/supabase/server'
import Shell from '@/components/Shell'
import type { Leverans } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient()
  const { data } = await supabase
    .from('leveranser')
    .select('*')
    .order('created_at', { ascending: false })
  return <Shell initialData={(data ?? []) as Leverans[]} />
}
