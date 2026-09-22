import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Contact, ContactInput } from '@/types/database'

const CONTACT_SELECT = `
  id, user_id, company_id, name, role, email, linkedin_url, notes, created_at, updated_at,
  company:companies(id, name, website, industry, notes, user_id, created_at, updated_at)
`

function asCon(data: unknown): Contact { return data as Contact }
function asCons(data: unknown[]): Contact[] { return data as Contact[] }

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('contacts')
      .select(CONTACT_SELECT)
      .order('name')
    if (error) { setError('Failed to load contacts.'); console.error(error) }
    else { setContacts(asCons(data ?? [])) }
    setLoading(false)
  }, [])

  useEffect(() => { void fetch() }, [fetch])

  const createContact = async (input: ContactInput): Promise<Contact | null> => {
    const { data, error } = await supabase
      .from('contacts')
      .insert(input)
      .select(CONTACT_SELECT)
      .single()
    if (error) { toast.error('Failed to create contact.'); console.error(error); return null }
    const c = asCon(data)
    setContacts((prev) => [...prev, c].sort((a, b) => a.name.localeCompare(b.name)))
    toast.success('Contact added.')
    return c
  }

  const updateContact = async (id: string, input: Partial<ContactInput>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('contacts')
      .update(input)
      .eq('id', id)
      .select(CONTACT_SELECT)
      .single()
    if (error) { toast.error('Failed to update contact.'); console.error(error); return false }
    const c = asCon(data)
    setContacts((prev) =>
      prev.map((x) => (x.id === id ? c : x)).sort((a, b) => a.name.localeCompare(b.name))
    )
    toast.success('Contact updated.')
    return true
  }

  const deleteContact = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) { toast.error('Failed to delete contact.'); console.error(error); return false }
    setContacts((prev) => prev.filter((c) => c.id !== id))
    toast.success('Contact deleted.')
    return true
  }

  return { contacts, loading, error, refetch: fetch, createContact, updateContact, deleteContact }
}
