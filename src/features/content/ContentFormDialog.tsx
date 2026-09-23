import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CONTENT_TYPE_LABELS,
  CONTENT_PLATFORM_LABELS,
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_ORDER,
} from '@/lib/constants'
import type { ContentPost, ContentPostInput, ContentType, ContentPlatform, ContentStatus } from '@/types/database'

interface ContentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editPost?: ContentPost | null
  onSuccess?: (post: ContentPost) => void
  createPost: (input: ContentPostInput) => Promise<ContentPost | null>
  updatePostWithToast: (id: string, patch: Partial<ContentPostInput>) => Promise<ContentPost | null>
}

const DEFAULT_VALUES: Partial<ContentPostInput> = {
  content_type: 'video',
  platform: 'linkedin',
  status: 'idea',
  title: '',
  description: '',
  idea: '',
  hook: '',
  script: '',
  caption: '',
  call_to_action: '',
  notes: '',
  scheduled_at: null,
}

export function ContentFormDialog({ open, onOpenChange, editPost, onSuccess, createPost, updatePostWithToast }: ContentFormDialogProps) {

  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState<ContentType>('video')
  const [platform, setPlatform] = useState<ContentPlatform>('linkedin')
  const [status, setStatus] = useState<ContentStatus>('idea')
  const [idea, setIdea] = useState('')
  const [hook, setHook] = useState('')
  const [script, setScript] = useState('')
  const [caption, setCaption] = useState('')
  const [callToAction, setCallToAction] = useState('')
  const [notes, setNotes] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = !!editPost

  // Populate form when editing
  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title)
      setContentType(editPost.content_type)
      setPlatform(editPost.platform)
      setStatus(editPost.status)
      setIdea(editPost.idea ?? '')
      setHook(editPost.hook ?? '')
      setScript(editPost.script ?? '')
      setCaption(editPost.caption ?? '')
      setCallToAction(editPost.call_to_action ?? '')
      setNotes(editPost.notes ?? '')
      setScheduledAt(editPost.scheduled_at ? editPost.scheduled_at.slice(0, 10) : '')
    } else {
      resetForm()
    }
  }, [editPost, open])

  function resetForm() {
    setTitle('')
    setContentType('video')
    setPlatform('linkedin')
    setStatus('idea')
    setIdea('')
    setHook('')
    setScript('')
    setCaption('')
    setCallToAction('')
    setNotes('')
    setScheduledAt('')
  }

  function handleOpenChange(v: boolean) {
    if (!v) resetForm()
    onOpenChange(v)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)

    const input: ContentPostInput = {
      ...DEFAULT_VALUES as ContentPostInput,
      title: title.trim(),
      content_type: contentType,
      platform,
      status,
      idea: idea.trim() || null,
      hook: hook.trim() || null,
      script: script.trim() || null,
      caption: caption.trim() || null,
      call_to_action: callToAction.trim() || null,
      notes: notes.trim() || null,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      description: null,
      recording_url: null,
      thumbnail_url: null,
      published_url: null,
      published_at: null,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      checklist_idea_finalized: false,
      checklist_hook_finalized: false,
      checklist_script_completed: false,
      checklist_video_recorded: false,
      checklist_video_edited: false,
      checklist_thumbnail_ready: false,
      checklist_caption_ready: false,
      checklist_cta_ready: false,
      checklist_published: false,
    }

    let result: ContentPost | null = null

    if (isEdit && editPost) {
      result = await updatePostWithToast(editPost.id, {
        title: input.title,
        content_type: input.content_type,
        platform: input.platform,
        status: input.status,
        idea: input.idea,
        hook: input.hook,
        script: input.script,
        caption: input.caption,
        call_to_action: input.call_to_action,
        notes: input.notes,
        scheduled_at: input.scheduled_at,
      })
    } else {
      result = await createPost(input)
    }

    setLoading(false)

    if (result) {
      onSuccess?.(result)
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit content' : 'New content'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Title — required */}
          <div className="space-y-2">
            <Label htmlFor="cf-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cf-title"
              placeholder="e.g. React vs Next.js for beginners"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Type + Platform row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Content type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((t) => (
                    <SelectItem key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as ContentPlatform)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CONTENT_PLATFORM_LABELS) as ContentPlatform[]).map((p) => (
                    <SelectItem key={p} value={p}>{CONTENT_PLATFORM_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>{CONTENT_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Idea */}
          <div className="space-y-2">
            <Label htmlFor="cf-idea">Idea</Label>
            <Textarea
              id="cf-idea"
              placeholder="What is this content about?"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Hook */}
          <div className="space-y-2">
            <Label htmlFor="cf-hook">Hook</Label>
            <Textarea
              id="cf-hook"
              placeholder="Opening line / attention grabber"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>

          {/* Script */}
          <div className="space-y-2">
            <Label htmlFor="cf-script">Script</Label>
            <Textarea
              id="cf-script"
              placeholder="Full script or outline"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="cf-caption">Caption</Label>
            <Textarea
              id="cf-caption"
              placeholder="Social media caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <Label htmlFor="cf-cta">Call to action</Label>
            <Input
              id="cf-cta"
              placeholder="What should viewers do?"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Scheduled date */}
          <div className="space-y-2">
            <Label htmlFor="cf-scheduled">Scheduled date (optional)</Label>
            <Input
              id="cf-scheduled"
              type="date"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="cf-notes">Notes</Label>
            <Textarea
              id="cf-notes"
              placeholder="Any additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {isEdit ? 'Saving…' : 'Creating…'}
                </>
              ) : (
                isEdit ? 'Save changes' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
