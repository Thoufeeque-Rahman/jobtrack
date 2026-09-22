import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Company, CompanyInput } from '@/types/database'

interface CompanyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company | null
  onSubmit: (input: CompanyInput) => Promise<boolean | Company | null>
}

const EMPTY: CompanyInput = {
  name: '',
  website: null,
  industry: null,
  notes: null,
}

export function CompanyFormDialog({ open, onOpenChange, company, onSubmit }: CompanyFormDialogProps) {
  const isEdit = Boolean(company)
  const [form, setForm] = useState<CompanyInput>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyInput, string>>>({})

  useEffect(() => {
    if (open) {
      setForm(
        company
          ? { name: company.name, website: company.website, industry: company.industry, notes: company.notes }
          : EMPTY
      )
      setErrors({})
    }
  }, [open, company])

  const set = (field: keyof CompanyInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value || null }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name?.trim()) e.name = 'Company name is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const result = await onSubmit({ ...form, name: form.name!.trim() })
    setSaving(false)
    if (result) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit company' : 'Add company'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update company details.' : 'Add a new company to your tracker.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Acme Corp"
              value={form.name ?? ''}
              onChange={(e) => set('name', e.target.value)}
              disabled={saving}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="SaaS, Fintech, Healthcare…"
              value={form.industry ?? ''}
              onChange={(e) => set('industry', e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://acme.com"
              value={form.website ?? ''}
              onChange={(e) => set('website', e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any notes about this company…"
              rows={3}
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
              disabled={saving}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {isEdit ? 'Save changes' : 'Add company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

