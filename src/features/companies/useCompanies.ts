import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Company, CompanyInput } from '@/types/database'

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('companies')
      .select('id, user_id, name, website, industry, notes, created_at, updated_at')
      .order('name')
    if (error) {
      setError('Failed to load companies.')
      console.error(error)
    } else {
      setCompanies(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetch()
  }, [fetch])

  const createCompany = async (input: CompanyInput): Promise<Company | null> => {
    const { data, error } = await supabase
      .from('companies')
      .insert(input)
      .select()
      .single()
    if (error) {
      toast.error('Failed to create company.')
      console.error(error)
      return null
    }
    setCompanies((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    toast.success('Company added.')
    return data
  }

  const updateCompany = async (id: string, input: Partial<CompanyInput>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('companies')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      toast.error('Failed to update company.')
      console.error(error)
      return false
    }
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? data : c)).sort((a, b) => a.name.localeCompare(b.name))
    )
    toast.success('Company updated.')
    return true
  }

  const deleteCompany = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete company.')
      console.error(error)
      return false
    }
    setCompanies((prev) => prev.filter((c) => c.id !== id))
    toast.success('Company deleted.')
    return true
  }

  return { companies, loading, error, refetch: fetch, createCompany, updateCompany, deleteCompany }
}
