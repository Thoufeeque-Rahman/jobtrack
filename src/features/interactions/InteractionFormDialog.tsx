import { useState, useEffect } from 'react'
import { Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
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
import { PLATFORM_LABELS, INTERACTION_TYPE_LABELS } from '@/lib/constants'
import type {
  Contact,
  Interaction,
  InteractionInput,
  InteractionPlatform,
  InteractionType,
  InteractionDirection,
} from '@/types/database'

interface InteractionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunityId: string
  interaction?: Interaction | null
  contacts: Contact[]
  onSubmit: (input: InteractionInput) => Promise<Interaction | boolean | null>
}

const nowLocalDatetime = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const EMPTY = (opportunityId: string): InteractionInput => ({
  opportunity_id: opportunityId,
  contact_id: null,
  platform: 'linkedin',
  interaction_type: 'dm',
  direction: 'outgoing',
  content: null,
  notes: null,
  interacted_at: new Date().toISOString(),
})

export function InteractionFormDialog({
  open,
  onOpenChange,
  opportunityId,
  interaction,
  contacts,
  onSubmit,
}: InteractionFormDialogProps) {
  const isEdit = Boolean(interaction)
  const [form, setForm] = useState<InteractionInput>(EMPTY(opportunityId))
  const [localDatetime, setLocalDatetime] = useState(nowLocalDatetime())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (interaction) {
        const d = new Date(interaction.interacted_at)
        const pad = (n: number) => String(n).padStart(2, '0')
        setLocalDatetime(
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        )
        setForm({
          opportunity_id: interaction.opportunity_id,
          contact_id: interaction.contact_id,
          platform: interaction.platform,
          interaction_type: interaction.interaction_type,
          direction: interaction.direction,
          content: interaction.content,
          notes: interaction.notes,
          interacted_at: interaction.interacted_at,
        })
      } else {
        const now = nowLocalDatetime()
        setLocalDatetime(now)
        setForm(EMPTY(opportunityId))
      }
    }
  }, [open, interaction, opportunityId])

  const set = <K extends keyof InteractionInput>(field: K, value: InteractionInput[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const setStr = (field: keyof InteractionInput, value: string) =>
    set(field, (value.trim() === '' ? null : value) as never)

  const handleDatetime = (value: string) => {
    setLocalDatetime(value)
    if (value) set('interacted_at', new Date(value).toISOString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const result = await onSubmit(form)
    setSaving(false)
    if (result) onOpenChange(false)
  }

  const platforms = Object.keys(PLATFORM_LABELS) as InteractionPlatform[]
  const types = Object.keys(INTERACTION_TYPE_LABELS) as InteractionType[]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit interaction' : 'Log interaction'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update interaction details.' : 'Record a new interaction for this opportunity.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Direction */}
          <div className="space-y-1.5">
            <Label>Direction</Label>
            <div className="flex gap-2">
              {(['outgoing', 'incoming'] as InteractionDirection[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('direction', d)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border py-2 text-sm font-medium transition-colors ${
                    form.direction === d
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input bg-transparent text-muted-foreground hover:bg-accent'
                  }`}
                  disabled={saving}
                >
                  {d === 'outgoing' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Platform + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(v) => set('platform', v as InteractionPlatform)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.interaction_type}
                onValueChange={(v) => set('interaction_type', v as InteractionType)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>{INTERACTION_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact */}
          {contacts.length > 0 && (
            <div className="space-y-1.5">
              <Label>Contact</Label>
              <Select
                value={form.contact_id ?? '__none__'}
                onValueChange={(v) => set('contact_id', v === '__none__' ? null : v)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No contact</SelectItem>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.role ? ` · ${c.role}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date/time */}
          <div className="space-y-1.5">
            <Label htmlFor="interacted_at">Date & time</Label>
            <Input
              id="interacted_at"
              type="datetime-local"
              value={localDatetime}
              onChange={(e) => handleDatetime(e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="content">What happened?</Label>
            <Textarea
              id="content"
              placeholder="Sent intro message, received response…"
              rows={3}
              value={form.content ?? ''}
              onChange={(e) => setStr('content', e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Internal notes…"
              rows={2}
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
              {isEdit ? 'Save changes' : 'Log interaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
