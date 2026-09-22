import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Opportunity, OpportunityInput } from '@/types/database'

const OPP_SELECT = `
  id, user_id, company_id, title, status, custom_status, priority,
  url, salary_range, location, notes, next_action, follow_up_date,
  applied_at, created_at, updated_at,
  company:companies(id, name, website, industry, notes, user_id, created_at, updated_at)
`

// Supabase returns joined relations as arrays in its inferred type,
// but at runtime they are objects (when using a FK relation). We cast via unknown.
function asOpp(data: unknown): Opportunity { return data as Opportunity }
function asOpps(data: unknown[]): Opportunity[] { return data as Opportunity[] }

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('opportunities')
      .select(OPP_SELECT)
      .order('created_at', { ascending: false })

    if (error) {
      setError('Failed to load opportunities.')
      console.error(error)
    } else {
      setOpportunities(asOpps(data ?? []))
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetch() }, [fetch])

  const createOpportunity = async (input: OpportunityInput): Promise<Opportunity | null> => {
    const { data, error } = await supabase
      .from('opportunities')
      .insert(input)
      .select(OPP_SELECT)
      .single()
    if (error) { toast.error('Failed to create opportunity.'); console.error(error); return null }
    const opp = asOpp(data)
    setOpportunities((prev) => [opp, ...prev])
    toast.success('Opportunity added.')
    return opp
  }

  const updateOpportunity = async (id: string, input: Partial<OpportunityInput>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('opportunities')
      .update(input)
      .eq('id', id)
      .select(OPP_SELECT)
      .single()
    if (error) { toast.error('Failed to update opportunity.'); console.error(error); return false }
    const opp = asOpp(data)
    setOpportunities((prev) => prev.map((o) => (o.id === id ? opp : o)))
    toast.success('Opportunity updated.')
    return true
  }

  const deleteOpportunity = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('opportunities').delete().eq('id', id)
    if (error) { toast.error('Failed to delete opportunity.'); console.error(error); return false }
    setOpportunities((prev) => prev.filter((o) => o.id !== id))
    toast.success('Opportunity deleted.')
    return true
  }

  return { opportunities, loading, error, refetch: fetch, createOpportunity, updateOpportunity, deleteOpportunity }
}

export function useOpportunity(id: string) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('opportunities')
      .select(OPP_SELECT)
      .eq('id', id)
      .single()
    if (error) { setError('Opportunity not found.'); console.error(error) }
    else { setOpportunity(asOpp(data)) }
    setLoading(false)
  }, [id])

  useEffect(() => { void fetch() }, [fetch])

  const update = async (input: Partial<OpportunityInput>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('opportunities')
      .update(input)
      .eq('id', id)
      .select(OPP_SELECT)
      .single()
    if (error) { toast.error('Failed to update.'); return false }
    setOpportunity(asOpp(data))
    toast.success('Updated.')
    return true
  }

  return { opportunity, loading, error, refetch: fetch, update }
}
