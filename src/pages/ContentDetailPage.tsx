import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Trash2,
  ExternalLink,
  Check,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { useContentPost } from '@/features/content/useContent'
import { useContent } from '@/features/content/useContent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_VARIANTS,
  CONTENT_STATUS_ORDER,
  CONTENT_TYPE_LABELS,
  CONTENT_PLATFORM_LABELS,
  CHECKLIST_ITEMS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ContentStatus, ContentPostInput } from '@/types/database'

// ─── Pipeline stepper ────────────────────────────────────────

function PipelineStepper({ status }: { status: ContentStatus }) {
  const currentIdx = CONTENT_STATUS_ORDER.indexOf(status)
  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {CONTENT_STATUS_ORDER.map((s, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={s} className="flex items-center shrink-0">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                active && 'bg-primary text-primary-foreground',
                done && 'text-primary',
                !active && !done && 'text-muted-foreground'
              )}
            >
              {done && <Check className="h-3 w-3" />}
              {CONTENT_STATUS_LABELS[s]}
            </div>
            {i < CONTENT_STATUS_ORDER.length - 1 && (
              <div className={cn('h-px w-4 shrink-0', done || active ? 'bg-primary/40' : 'bg-border')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Autosave textarea / input helpers ───────────────────────

function AutoTextarea({
  label,
  value,
  placeholder,
  rows = 3,
  onSave,
}: {
  label: string
  value: string
  placeholder?: string
  rows?: number
  onSave: (value: string) => void
}) {
  const [local, setLocal] = useState(value)

  useEffect(() => { setLocal(value) }, [value])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== value) onSave(local) }}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  )
}

function AutoInput({
  label,
  value,
  placeholder,
  type = 'text',
  onSave,
}: {
  label: string
  value: string
  placeholder?: string
  type?: string
  onSave: (value: string) => void
}) {
  const [local, setLocal] = useState(value)

  useEffect(() => { setLocal(value) }, [value])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== value) onSave(local) }}
        placeholder={placeholder}
      />
    </div>
  )
}

// ─── Number input for metrics ──────────────────────────────

function MetricInput({
  label,
  value,
  onSave,
}: {
  label: string
  value: number
  onSave: (value: number) => void
}) {
  const [local, setLocal] = useState(String(value))

  useEffect(() => { setLocal(String(value)) }, [value])

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const n = parseInt(local, 10)
          if (!isNaN(n) && n !== value) onSave(n)
        }}
        className="w-full"
      />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { post, loading, error, update } = useContentPost(id!)
  const { deletePost } = useContent()

  const save = useCallback(
    async (patch: Partial<ContentPostInput>) => {
      await update(patch)
    },
    [update]
  )

  const saveWithToast = useCallback(
    async (patch: Partial<ContentPostInput>) => {
      const result = await update(patch)
      if (result) toast.success('Saved.')
    },
    [update]
  )

  async function handleDelete() {
    const ok = await deletePost(id!)
    if (ok) navigate('/content/pipeline')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">{error ?? 'Post not found.'}</p>
        <Link to="/content/pipeline" className="text-primary hover:underline text-sm">
          ← Back to pipeline
        </Link>
      </div>
    )
  }

  const isPublished = post.status === 'published'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        to="/content/pipeline"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Pipeline
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 justify-between">
          <h1 className="text-2xl font-semibold leading-tight">{post.title}</h1>
          <div className="flex items-center gap-2 shrink-0">
            {/* Status selector */}
            <Select
              value={post.status}
              onValueChange={(v) => saveWithToast({ status: v as ContentStatus })}
            >
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>{CONTENT_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete content post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{post.title}". This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={CONTENT_STATUS_VARIANTS[post.status] as never}>
            {CONTENT_STATUS_LABELS[post.status]}
          </Badge>
          <Badge variant="outline">{CONTENT_TYPE_LABELS[post.content_type]}</Badge>
          <Badge variant="outline">{CONTENT_PLATFORM_LABELS[post.platform]}</Badge>
        </div>

        {/* Pipeline stepper */}
        <div className="overflow-x-auto py-2">
          <PipelineStepper status={post.status} />
        </div>
      </div>

      {/* ── Creative content ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Creative</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <AutoTextarea
            label="Idea"
            value={post.idea ?? ''}
            placeholder="What is this content about?"
            rows={3}
            onSave={(v) => save({ idea: v || null })}
          />
          <AutoTextarea
            label="Hook"
            value={post.hook ?? ''}
            placeholder="Opening line / attention grabber"
            rows={2}
            onSave={(v) => save({ hook: v || null })}
          />
          <AutoTextarea
            label="Script"
            value={post.script ?? ''}
            placeholder="Full script or outline"
            rows={8}
            onSave={(v) => save({ script: v || null })}
          />
          <AutoTextarea
            label="Caption"
            value={post.caption ?? ''}
            placeholder="Social media caption"
            rows={3}
            onSave={(v) => save({ caption: v || null })}
          />
          <AutoInput
            label="Call to action"
            value={post.call_to_action ?? ''}
            placeholder="What should viewers do?"
            onSave={(v) => save({ call_to_action: v || null })}
          />
        </CardContent>
      </Card>

      {/* ── Checklist ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {CHECKLIST_ITEMS.map(({ key, label }) => {
              const checked = post[key] as boolean
              return (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={cn(
                      'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors',
                      checked
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-input group-hover:border-primary/50'
                    )}
                    onClick={() => save({ [key]: !checked })}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </div>
                  <span
                    className={cn('text-sm', checked && 'line-through text-muted-foreground')}
                    onClick={() => save({ [key]: !checked })}
                  >
                    {label}
                  </span>
                </label>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Production assets ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AutoInput
            label="Recording URL"
            value={post.recording_url ?? ''}
            placeholder="https://drive.google.com/…"
            onSave={(v) => save({ recording_url: v || null })}
          />
          <AutoInput
            label="Thumbnail URL"
            value={post.thumbnail_url ?? ''}
            placeholder="https://drive.google.com/…"
            onSave={(v) => save({ thumbnail_url: v || null })}
          />
        </CardContent>
      </Card>

      {/* ── Publishing ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publishing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform display */}
          <div className="space-y-1">
            <Label>Platform</Label>
            <p className="text-sm font-medium">{CONTENT_PLATFORM_LABELS[post.platform]}</p>
          </div>

          {/* Scheduled date */}
          <AutoInput
            label="Scheduled date"
            value={post.scheduled_at ? post.scheduled_at.slice(0, 10) : ''}
            type="date"
            onSave={(v) => save({ scheduled_at: v ? new Date(v).toISOString() : null })}
          />

          {/* Published date */}
          <AutoInput
            label="Published date"
            value={post.published_at ? post.published_at.slice(0, 10) : ''}
            type="date"
            onSave={(v) => save({ published_at: v ? new Date(v).toISOString() : null })}
          />

          {/* Published URL */}
          <div className="space-y-2">
            <Label>Published URL</Label>
            <div className="flex gap-2">
              <AutoInput
                label=""
                value={post.published_url ?? ''}
                placeholder="https://www.linkedin.com/posts/…"
                onSave={(v) => save({ published_url: v || null })}
              />
              {post.published_url && (
                <a
                  href={post.published_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center justify-center h-10 w-10 rounded-md border border-input hover:bg-accent transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Performance metrics ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Performance
            {!isPublished && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">(available after publishing)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricInput label="Views" value={post.views} onSave={(v) => save({ views: v })} />
            <MetricInput label="Likes" value={post.likes} onSave={(v) => save({ likes: v })} />
            <MetricInput label="Comments" value={post.comments} onSave={(v) => save({ comments: v })} />
            <MetricInput label="Shares" value={post.shares} onSave={(v) => save({ shares: v })} />
          </div>
        </CardContent>
      </Card>

      {/* ── Notes ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <AutoTextarea
            label=""
            value={post.notes ?? ''}
            placeholder="Any additional notes…"
            rows={4}
            onSave={(v) => save({ notes: v || null })}
          />
        </CardContent>
      </Card>

      {/* Footer timestamps */}
      <p className="text-xs text-muted-foreground pb-4">
        Created {format(parseISO(post.created_at), 'MMM d, yyyy')} ·{' '}
        Last updated {format(parseISO(post.updated_at), 'MMM d, yyyy HH:mm')}
      </p>
    </div>
  )
}
