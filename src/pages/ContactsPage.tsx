import { useState } from 'react'
import { Plus, Search, Users, Pencil, Trash2, Mail, ExternalLink, Building2 } from 'lucide-react'
import { useContacts } from '@/features/contacts/useContacts'
import { useCompanies } from '@/features/companies/useCompanies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import type { Contact, ContactInput } from '@/types/database'
import { useEffect } from 'react'

const EMPTY: ContactInput = {
  name: '',
  company_id: null,
  role: null,
  email: null,
  linkedin_url: null,
  notes: null,
}

function ContactFormDialog({
  open,
  onOpenChange,
  contact,
  companies,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact | null
  companies: { id: string; name: string }[]
  onSubmit: (input: ContactInput) => Promise<Contact | boolean | null>
}) {
  const isEdit = Boolean(contact)
  const [form, setForm] = useState<ContactInput>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(
        contact
          ? { name: contact.name, company_id: contact.company_id, role: contact.role, email: contact.email, linkedin_url: contact.linkedin_url, notes: contact.notes }
          : EMPTY
      )
      setNameError('')
    }
  }, [open, contact])

  const setStr = (field: keyof ContactInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value.trim() === '' ? null : value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) { setNameError('Name is required.'); return }
    setSaving(true)
    const result = await onSubmit({ ...form, name: form.name.trim() })
    setSaving(false)
    if (result) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit contact' : 'Add contact'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update contact details.' : 'Add a new contact to your network.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cname">Name <span className="text-destructive">*</span></Label>
            <Input id="cname" placeholder="Rahul Sharma" value={form.name ?? ''} onChange={(e) => { setStr('name', e.target.value); setNameError('') }} disabled={saving} autoFocus />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Select value={form.company_id ?? '__none__'} onValueChange={(v) => setForm(p => ({ ...p, company_id: v === '__none__' ? null : v }))} disabled={saving}>
              <SelectTrigger><SelectValue placeholder="Select company…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No company</SelectItem>
                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crole">Role / Title</Label>
            <Input id="crole" placeholder="Engineering Manager" value={form.role ?? ''} onChange={(e) => setStr('role', e.target.value)} disabled={saving} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cemail">Email</Label>
              <Input id="cemail" type="email" placeholder="rahul@acme.com" value={form.email ?? ''} onChange={(e) => setStr('email', e.target.value)} disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clinkedin">LinkedIn URL</Label>
              <Input id="clinkedin" type="url" placeholder="https://linkedin.com/in/…" value={form.linkedin_url ?? ''} onChange={(e) => setStr('linkedin_url', e.target.value)} disabled={saving} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cnotes">Notes</Label>
            <Textarea id="cnotes" placeholder="Notes about this contact…" rows={2} value={form.notes ?? ''} onChange={(e) => setStr('notes', e.target.value)} disabled={saving} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {isEdit ? 'Save changes' : 'Add contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ContactsPage() {
  const { contacts, loading, error, createContact, updateContact, deleteContact } = useContacts()
  const { companies } = useCompanies()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase()
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.company?.name.toLowerCase().includes(q) ?? false) ||
      (c.role?.toLowerCase().includes(q) ?? false)
    )
  })

  const openCreate = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (c: Contact) => { setEditing(c); setDialogOpen(true) }

  const handleDelete = async () => {
    if (!deletingId) return
    await deleteContact(deletingId)
    setDeletingId(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? '…' : `${contacts.length} ${contacts.length === 1 ? 'contact' : 'contacts'}`}
          </p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus />Add contact</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search contacts…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading && <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>}

      {!loading && error && <div className="text-center py-16"><p className="text-sm text-destructive">{error}</p></div>}

      {!loading && !error && contacts.length === 0 && (
        <div className="text-center py-20">
          <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-medium text-sm">No contacts yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">Add recruiters, hiring managers, and other contacts.</p>
          <Button onClick={openCreate} size="sm"><Plus />Add your first contact</Button>
        </div>
      )}

      {!loading && !error && contacts.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16"><p className="text-sm text-muted-foreground">No contacts match "{search}"</p></div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {filtered.map((contact) => (
            <div key={contact.id} className="flex items-center gap-4 px-4 py-3.5 bg-card hover:bg-accent/40 transition-colors group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm uppercase">
                {contact.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{contact.name}</span>
                  {contact.role && <span className="text-xs text-muted-foreground">· {contact.role}</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  {contact.company && (
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{contact.company.name}</span>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                      <Mail className="h-3 w-3" />{contact.email}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {contact.linkedin_url && (
                  <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" aria-label="LinkedIn profile">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button type="button" onClick={() => openEdit(contact)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" aria-label="Edit contact">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setDeletingId(contact.id)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive" aria-label="Delete contact">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }}
        contact={editing}
        companies={companies}
        onSubmit={editing ? (input) => updateContact(editing.id, input) : createContact}
      />

      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>This contact will be removed. Interactions referencing them will not be deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
