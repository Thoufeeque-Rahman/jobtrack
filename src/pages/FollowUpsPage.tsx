import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ChevronRight, CalendarClock, MapPin } from 'lucide-react'
import { format, isPast, isToday, isFuture, parseISO } from 'date-fns'
import { useOpportunities } from '@/features/opportunities/useOpportunities'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, STATUS_VARIANTS, PRIORITY_VARIANTS, PRIORITY_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Opportunity } from '@/types/database'

function FollowUpItem({ opp }: { opp: Opportunity }) {
  const date = parseISO(opp.follow_up_date!)
  const overdue = isPast(date) && !isToday(date)
  const today = isToday(date)
  const upcoming = isFuture(date)

  const displayStatus =
    opp.status === 'other' && opp.custom_status ? opp.custom_status : STATUS_LABELS[opp.status]

  return (
    <Link
      to={`/opportunities/${opp.id}`}
      className="flex items-start gap-4 px-4 py-4 bg-card hover:bg-accent/40 transition-colors group"
    >
      <div
        className={cn(
          'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
          overdue && 'bg-destructive/10 text-destructive',
          today && 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
          upcoming && 'bg-muted text-muted-foreground'
        )}
      >
        <CalendarClock className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{opp.title}</span>
          <Badge variant={STATUS_VARIANTS[opp.status] as never} className="text-[11px] py-0">
            {displayStatus}
          </Badge>
          <Badge variant={PRIORITY_VARIANTS[opp.priority] as never} className="text-[11px] py-0">
            {PRIORITY_LABELS[opp.priority]}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {opp.company && <span className="font-medium text-foreground/80">{opp.company.name}</span>}
          {opp.location && (
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{opp.location}</span>
          )}
          <span
            className={cn(
              'font-medium',
              overdue && 'text-destructive',
              today && 'text-amber-600 dark:text-amber-400'
            )}
          >
            {overdue && `Overdue · `}
            {today && 'Today · '}
            {format(date, 'MMM d, yyyy')}
          </span>
        </div>
        {opp.next_action && (
          <p className="text-xs text-muted-foreground truncate">→ {opp.next_action}</p>
        )}
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  )
}

export default function FollowUpsPage() {
  const { opportunities, loading, error } = useOpportunities()

  const { overdue, dueToday, upcoming } = useMemo(() => {
    const withFollowUp = opportunities.filter((o) => o.follow_up_date)
    const overdue = withFollowUp.filter(
      (o) => isPast(parseISO(o.follow_up_date!)) && !isToday(parseISO(o.follow_up_date!))
    )
    const dueToday = withFollowUp.filter((o) => isToday(parseISO(o.follow_up_date!)))
    const upcoming = withFollowUp
      .filter((o) => isFuture(parseISO(o.follow_up_date!)))
      .sort((a, b) => parseISO(a.follow_up_date!).getTime() - parseISO(b.follow_up_date!).getTime())
      .slice(0, 10)
    return { overdue, dueToday, upcoming }
  }, [opportunities])

  const Section = ({
    title,
    items,
    accent,
  }: {
    title: string
    items: Opportunity[]
    accent?: string
  }) =>
    items.length > 0 ? (
      <div className="mb-6">
        <h2 className={cn('text-xs font-semibold uppercase tracking-wider mb-2', accent)}>
          {title} <span className="text-muted-foreground font-normal normal-case tracking-normal">({items.length})</span>
        </h2>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {items.map((o) => <FollowUpItem key={o.id} opp={o} />)}
        </div>
      </div>
    ) : null

  const total = overdue.length + dueToday.length + upcoming.length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Follow-ups</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {loading ? '…' : total === 0 ? 'No follow-ups scheduled.' : `${total} total`}
        </p>
      </div>

      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      )}

      {!loading && error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <>
          <Section title="Overdue" items={overdue} accent="text-destructive" />
          <Section title="Due today" items={dueToday} accent="text-amber-600 dark:text-amber-400" />
          <Section title="Upcoming" items={upcoming} />

          {total === 0 && (
            <div className="text-center py-20">
              <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
              <p className="font-medium text-sm">No follow-ups scheduled</p>
              <p className="text-sm text-muted-foreground mt-1">
                Set follow-up dates on your opportunities to track them here.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

