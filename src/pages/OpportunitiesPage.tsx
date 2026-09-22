import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Briefcase, MapPin, CalendarClock, ChevronRight, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { useOpportunities } from '@/features/opportunities/useOpportunities'
import { OpportunityFormDialog } from '@/features/opportunities/OpportunityFormDialog'
import { useCompanies } from '@/features/companies/useCompanies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUS_LABELS, STATUS_ORDER, STATUS_VARIANTS, PRIORITY_LABELS, PRIORITY_VARIANTS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Opportunity, OpportunityInput, OpportunityStatus, OpportunityPriority } from '@/types/database'

export default function OpportunitiesPage() {
  const { opportunities, loading, error, createOpportunity, updateOpportunity, deleteOpportunity } = useOpportunities()
  const { companies } = useCompanies()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OpportunityStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<OpportunityPriority | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Opportunity | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = opportunities.filter((o) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      o.title.toLowerCase().includes(q) ||
      (o.company?.name.toLowerCase().includes(q) ?? false) ||
      (o.location?.toLowerCase().includes(q) ?? false)
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus
    const matchesPriority = filterPriority === 'all' || o.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleCreate = (input: OpportunityInput) => createOpportunity(input)
  const handleUpdate = (input: OpportunityInput) => {
    if (!editing) return Promise.resolve(false)
    return updateOpportunity(editing.id, input)
  }

  const openCreate = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (o: Opportunity, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(o)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    await deleteOpportunity(deletingId)
    setDeletingId(null)
  }

  const displayStatus = (o: Opportunity) =>
    o.status === 'other' && o.custom_status ? o.custom_status : STATUS_LABELS[o.status]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? '…' : `${opportunities.length} total`}
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus />
          Add opportunity
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as OpportunityStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as OpportunityPriority | 'all')}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(['low', 'medium', 'high'] as OpportunityPriority[]).map((p) => (
              <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && opportunities.length === 0 && (
        <div className="text-center py-20">
          <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-medium text-sm">No opportunities yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            Add your first job opportunity to start tracking your search.
          </p>
          <Button onClick={openCreate} size="sm">
            <Plus />
            Add opportunity
          </Button>
        </div>
      )}

      {/* No filter results */}
      {!loading && !error && opportunities.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">No opportunities match your filters.</p>
        </div>
      )}

      {/* List */}
      {!loading && filtered.length > 0 && (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {filtered.map((opp) => {
            const followUpOverdue =
              opp.follow_up_date &&
              isPast(new Date(opp.follow_up_date)) &&
              !isToday(new Date(opp.follow_up_date))
            const followUpToday = opp.follow_up_date && isToday(new Date(opp.follow_up_date))

            return (
              <div
                key={opp.id}
                onClick={() => navigate(`/opportunities/${opp.id}`)}
                className="flex items-start gap-4 px-4 py-4 bg-card hover:bg-accent/40 transition-colors cursor-pointer group"
              >
                {/* Left: status color stripe */}
                <div
                  className={cn(
                    'mt-1 w-1 self-stretch rounded-full shrink-0',
                    opp.priority === 'high' ? 'bg-destructive/60' :
                    opp.priority === 'medium' ? 'bg-amber-400/60' :
                    'bg-border'
                  )}
                />

                {/* Main info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{opp.title}</span>
                    <Badge variant={STATUS_VARIANTS[opp.status] as never} className="text-[11px] py-0">
                      {displayStatus(opp)}
                    </Badge>
                    <Badge variant={PRIORITY_VARIANTS[opp.priority] as never} className="text-[11px] py-0">
                      {PRIORITY_LABELS[opp.priority]}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    {opp.company && (
                      <span className="font-medium text-foreground/80">{opp.company.name}</span>
                    )}
                    {opp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {opp.location}
                      </span>
                    )}
                    {opp.follow_up_date && (
                      <span
                        className={cn(
                          'flex items-center gap-1',
                          followUpOverdue && 'text-destructive font-medium',
                          followUpToday && 'text-amber-600 font-medium'
                        )}
                      >
                        <CalendarClock className="h-3 w-3" />
                        {followUpOverdue && 'Overdue · '}
                        {followUpToday && 'Today · '}
                        {format(new Date(opp.follow_up_date), 'MMM d')}
                      </span>
                    )}
                  </div>

                  {opp.next_action && (
                    <p className="text-xs text-muted-foreground truncate">→ {opp.next_action}</p>
                  )}
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {opp.url && (
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      aria-label="Open job posting"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={(e) => openEdit(opp, e)}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Edit opportunity"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDeletingId(opp.id) }}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    aria-label="Delete opportunity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <OpportunityFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }}
        opportunity={editing}
        companies={companies}
        onSubmit={editing ? handleUpdate : handleCreate}
      />

      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete opportunity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the opportunity and all its interactions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
