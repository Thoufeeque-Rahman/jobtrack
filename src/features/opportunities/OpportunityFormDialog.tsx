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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUS_LABELS, STATUS_ORDER, PRIORITY_LABELS } from '@/lib/constants'
import type { Company, Opportunity, OpportunityInput, OpportunityStatus, OpportunityPriority } from '@/types/database'

interface OpportunityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity?: Opportunity | null
  companies: Company[]
  onSubmit: (input: OpportunityInput) => Promise<Opportunity | boolean | null>
}

const EMPTY: OpportunityInput = {
  title: '',
  company_id: null,
  status: 'discovered',
  custom_status: null,
  priority: 'medium',
  url: null,
  salary_range: null,
  location: null,
  notes: null,
  next_action: null,
  follow_up_date: null,
  applied_at: null,
}

export function OpportunityFormDialog({
  open,
  onOpenChange,
  opportunity,
  companies,
  onSubmit,
}: OpportunityFormDialogProps) {
  const isEdit = Boolean(opportunity)
  const [form, setForm] = useState<OpportunityInput>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof OpportunityInput, string>>>({})

  useEffect(() => {
    if (open) {
      setForm(
        opportunity
          ? {
              title: opportunity.title,
              company_id: opportunity.company_id,
              status: opportunity.status,
              custom_status: opportunity.custom_status,
              priority: opportunity.priority,
              url: opportunity.url,
              salary_range: opportunity.salary_range,
              location: opportunity.location,
              notes: opportunity.notes,
              next_action: opportunity.next_action,
              follow_up_date: opportunity.follow_up_date,
              applied_at: opportunity.applied_at,
            }
          : EMPTY
      )
      setErrors({})
    }
  }, [open, opportunity])

  const set = <K extends keyof OpportunityInput>(field: K, value: OpportunityInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const setStr = (field: keyof OpportunityInput, value: string) =>
    set(field, (value.trim() === '' ? null : value) as never)

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.title?.trim()) e.title = 'Role / title is required.'
    if (form.status === 'other' && !form.custom_status?.trim())
      e.custom_status = 'Please describe the status.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const result = await onSubmit({ ...form, title: form.title!.trim() })
    setSaving(false)
    if (result) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit opportunity' : 'Add opportunity'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update opportunity details.' : 'Track a new job opportunity.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Role / Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Frontend Engineer"
              value={form.title ?? ''}
              onChange={(e) => setStr('title', e.target.value)}
              disabled={saving}
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Select
              value={form.company_id ?? '__none__'}
              onValueChange={(v) => set('company_id', v === '__none__' ? null : v)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No company</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set('status', v as OpportunityStatus)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => set('priority', v as OpportunityPriority)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['low', 'medium', 'high'] as OpportunityPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom status */}
          {form.status === 'other' && (
            <div className="space-y-1.5">
              <Label htmlFor="custom_status">
                Custom status <span className="text-destructive">*</span>
              </Label>
              <Input
                id="custom_status"
                placeholder="e.g. Technical test"
                value={form.custom_status ?? ''}
                onChange={(e) => setStr('custom_status', e.target.value)}
                disabled={saving}
              />
              {errors.custom_status && (
                <p className="text-xs text-destructive">{errors.custom_status}</p>
              )}
            </div>
          )}

          {/* Location + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Remote, Bangalore…"
                value={form.location ?? ''}
                onChange={(e) => setStr('location', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary_range">Salary range</Label>
              <Input
                id="salary_range"
                placeholder="₹20–30 LPA"
                value={form.salary_range ?? ''}
                onChange={(e) => setStr('salary_range', e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="url">Job posting URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://…"
              value={form.url ?? ''}
              onChange={(e) => setStr('url', e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Next action + Follow-up date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="next_action">Next action</Label>
              <Input
                id="next_action"
                placeholder="Send follow-up…"
                value={form.next_action ?? ''}
                onChange={(e) => setStr('next_action', e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="follow_up_date">Follow-up date</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={form.follow_up_date ?? ''}
                onChange={(e) => setStr('follow_up_date', e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes…"
              rows={3}
              value={form.notes ?? ''}
              onChange={(e) => setStr('notes', e.target.value)}
              disabled={saving}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {isEdit ? 'Save changes' : 'Add opportunity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
