import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Interaction, InteractionInput } from '@/types/database'

const INTER_SELECT = `
  id, user_id, opportunity_id, contact_id, platform, interaction_type,
  direction, content, notes, interacted_at, created_at, updated_at,
  contact:contacts(id, name, role, email, linkedin_url, notes, user_id, company_id, created_at, updated_at)
`

function asInter(data: unknown): Interaction { return data as Interaction }
function asInters(data: unknown[]): Interaction[] { return data as Interaction[] }

const byDate = (a: Interaction, b: Interaction) =>
  new Date(b.interacted_at).getTime() - new Date(a.interacted_at).getTime()

export function useInteractions(opportunityId: string) {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('interactions')
      .select(INTER_SELECT)
      .eq('opportunity_id', opportunityId)
      .order('interacted_at', { ascending: false })

    if (error) { setError('Failed to load interactions.'); console.error(error) }
    else { setInteractions(asInters(data ?? [])) }
    setLoading(false)
  }, [opportunityId])

  useEffect(() => { void fetch() }, [fetch])

  const createInteraction = async (input: InteractionInput): Promise<Interaction | null> => {
    const { data, error } = await supabase
      .from('interactions')
      .insert(input)
      .select(INTER_SELECT)
      .single()
    if (error) { toast.error('Failed to add interaction.'); console.error(error); return null }
    const item = asInter(data)
    setInteractions((prev) => [item, ...prev].sort(byDate))
    toast.success('Interaction added.')
    return item
  }

  const updateInteraction = async (id: string, input: Partial<InteractionInput>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('interactions')
      .update(input)
      .eq('id', id)
      .select(INTER_SELECT)
      .single()
    if (error) { toast.error('Failed to update interaction.'); console.error(error); return false }
    const item = asInter(data)
    setInteractions((prev) => prev.map((i) => (i.id === id ? item : i)).sort(byDate))
    toast.success('Interaction updated.')
    return true
  }

  const deleteInteraction = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('interactions').delete().eq('id', id)
    if (error) { toast.error('Failed to delete interaction.'); console.error(error); return false }
    setInteractions((prev) => prev.filter((i) => i.id !== id))
    toast.success('Interaction deleted.')
    return true
  }

  return { interactions, loading, error, refetch: fetch, createInteraction, updateInteraction, deleteInteraction }
}
