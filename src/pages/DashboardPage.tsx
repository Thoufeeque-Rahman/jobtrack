import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Building2, Users, CalendarClock, ChevronRight, ArrowRight } from 'lucide-react'
import { format, isToday, isPast, parseISO, formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/features/auth/AuthProvider'
import { useOpportunities } from '@/features/opportunities/useOpportunities'
import { useCompanies } from '@/features/companies/useCompanies'
import { useContacts } from '@/features/contacts/useContacts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, STATUS_VARIANTS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Opportunity } from '@/types/database'

function StatCard({
  label,
  value,
  icon: Icon,
  to,
}: {
  label: string
  value: number | string
  icon: typeof Briefcase
  to: string
}) {
  return (
    <Link to={to}>
      <Card className="hover:border-primary/30 transition-colors cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-semibold mt-1">{value}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4.5 w-4.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function FollowUpRow({ opp }: { opp: Opportunity }) {
  const date = parseISO(opp.follow_up_date!)
  const overdue = isPast(date) && !isToday(date)
  const today = isToday(date)
  const displayStatus =
    opp.status === 'other' && opp.custom_status ? opp.custom_status : STATUS_LABELS[opp.status]

  return (
    <Link
      to={`/opportunities/${opp.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors group"
    >
      <CalendarClock
        className={cn(
          'h-4 w-4 shrink-0',
          overdue && 'text-destructive',
          today && 'text-amber-600'
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{opp.title}</span>
          <Badge variant={STATUS_VARIANTS[opp.status] as never} className="text-[11px] py-0 shrink-0">
            {displayStatus}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {opp.company?.name && `${opp.company.name} · `}
          <span className={cn(overdue && 'text-destructive font-medium', today && 'text-amber-600 font-medium')}>
            {overdue ? `Overdue (${format(date, 'MMM d')})` : today ? 'Today' : format(date, 'MMM d')}
          </span>
        </p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { opportunities, loading: oppLoading } = useOpportunities()
  const { companies, loading: compLoading } = useCompanies()
  const { contacts, loading: contactLoading } = useContacts()

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const firstName = user?.email?.split('@')[0] ?? 'there'

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const o of opportunities) {
      counts[o.status] = (counts[o.status] ?? 0) + 1
    }
    return counts
  }, [opportunities])

  const activeStatuses = ['applied', 'screening', 'interview', 'offer']
  const activeCount = activeStatuses.reduce((sum, s) => sum + (statusCounts[s] ?? 0), 0)

  const followUps = useMemo(() => {
    return opportunities
      .filter((o) => o.follow_up_date && (isPast(parseISO(o.follow_up_date)) || isToday(parseISO(o.follow_up_date))))
      .sort((a, b) => parseISO(a.follow_up_date!).getTime() - parseISO(b.follow_up_date!).getTime())
      .slice(0, 5)
  }, [opportunities])

  const recentOpportunities = useMemo(() =>
    opportunities.slice(0, 5),
    [opportunities]
  )

  const loading = oppLoading || compLoading || contactLoading

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-7">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold">{greeting}, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {loading ? '…' : `You're tracking ${opportunities.length} ${opportunities.length === 1 ? 'opportunity' : 'opportunities'}.`}
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Opportunities" value={opportunities.length} icon={Briefcase} to="/opportunities" />
          <StatCard label="Active pipeline" value={activeCount} icon={Briefcase} to="/opportunities" />
          <StatCard label="Companies" value={companies.length} icon={Building2} to="/companies" />
          <StatCard label="Contacts" value={contacts.length} icon={Users} to="/contacts" />
        </div>
      )}

      {/* Status breakdown */}
      {!loading && opportunities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(['discovered', 'applied', 'screening', 'interview', 'offer', 'rejected', 'accepted'] as const).map((s) =>
            (statusCounts[s] ?? 0) > 0 ? (
              <Badge key={s} variant={STATUS_VARIANTS[s] as never} className="gap-1.5">
                {STATUS_LABELS[s]}
                <span className="font-bold">{statusCounts[s]}</span>
              </Badge>
            ) : null
          )}
        </div>
      )}

      {/* Two columns: follow-ups + recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Follow-ups */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Due follow-ups</CardTitle>
              <Link to="/followups" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3 pb-2 px-0">
            {loading ? (
              <div className="px-4 space-y-2 py-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
              </div>
            ) : followUps.length === 0 ? (
              <p className="text-sm text-muted-foreground px-4 py-4">No overdue or due-today follow-ups. 🎉</p>
            ) : (
              <div className="divide-y divide-border">
                {followUps.map((o) => <FollowUpRow key={o.id} opp={o} />)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent opportunities */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Recent opportunities</CardTitle>
              <Link to="/opportunities" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3 pb-2 px-0">
            {loading ? (
              <div className="px-4 space-y-2 py-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
              </div>
            ) : recentOpportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground px-4 py-4">
                No opportunities yet.{' '}
                <Link to="/opportunities" className="text-primary underline">Add one →</Link>
              </p>
            ) : (
              <div className="divide-y divide-border">
                {recentOpportunities.map((o) => {
                  const displayStatus =
                    o.status === 'other' && o.custom_status ? o.custom_status : STATUS_LABELS[o.status]
                  return (
                    <Link
                      key={o.id}
                      to={`/opportunities/${o.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{o.title}</span>
                          <Badge variant={STATUS_VARIANTS[o.status] as never} className="text-[11px] py-0 shrink-0">
                            {displayStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {o.company?.name && `${o.company.name} · `}
                          {formatDistanceToNow(parseISO(o.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
