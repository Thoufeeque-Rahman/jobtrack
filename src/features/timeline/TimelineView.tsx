import { format } from 'date-fns'
import { ArrowUpRight, ArrowDownLeft, Pencil, Trash2 } from 'lucide-react'
import { PLATFORM_LABELS, INTERACTION_TYPE_LABELS } from '@/lib/constants'
import type { Interaction } from '@/types/database'
import { cn } from '@/lib/utils'

interface TimelineViewProps {
  interactions: Interaction[]
  loading: boolean
  error: string | null
  onEdit: (interaction: Interaction) => void
  onDelete: (id: string) => void
}

export function TimelineView({ interactions, loading, error, onEdit, onDelete }: TimelineViewProps) {
  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive py-4">{error}</p>
  }

  if (interactions.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground">No interactions logged yet.</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Use "Log interaction" above to record emails, DMs, calls, etc.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {interactions.map((item) => (
          <div key={item.id} className="relative flex gap-4 group">
            {/* Dot */}
            <div
              className={cn(
                'mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10',
                item.direction === 'outgoing'
                  ? 'border-primary/60 text-primary'
                  : 'border-emerald-500/60 text-emerald-600'
              )}
            >
              {item.direction === 'outgoing' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownLeft className="h-4 w-4" />
              )}
            </div>

            {/* Content card */}
            <div className="flex-1 min-w-0 rounded-lg border border-border bg-card px-4 py-3 hover:border-border/80 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  {/* Meta */}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {PLATFORM_LABELS[item.platform]}
                    </span>
                    <span>·</span>
                    <span>{INTERACTION_TYPE_LABELS[item.interaction_type]}</span>
                    <span>·</span>
                    <span
                      className={
                        item.direction === 'outgoing' ? 'text-primary' : 'text-emerald-600'
                      }
                    >
                      {item.direction === 'outgoing' ? 'Outgoing' : 'Incoming'}
                    </span>
                    {item.contact && (
                      <>
                        <span>·</span>
                        <span>{item.contact.name}</span>
                      </>
                    )}
                  </div>
                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.interacted_at), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Edit interaction"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    aria-label="Delete interaction"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              {item.content && (
                <p className="mt-2 text-sm leading-relaxed">{item.content}</p>
              )}
              {item.notes && (
                <p className="mt-1.5 text-xs text-muted-foreground italic">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
