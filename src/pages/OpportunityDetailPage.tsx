import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  DollarSign,
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { useOpportunity } from '@/features/opportunities/useOpportunities'
import { OpportunityFormDialog } from '@/features/opportunities/OpportunityFormDialog'
import { useInteractions } from '@/features/interactions/useInteractions'
import { InteractionFormDialog } from '@/features/interactions/InteractionFormDialog'
import { TimelineView } from '@/features/timeline/TimelineView'
import { useCompanies } from '@/features/companies/useCompanies'
import { useContacts } from '@/features/contacts/useContacts'
import { Button } from '@/components/ui/button'
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
import { STATUS_LABELS, STATUS_VARIANTS, PRIORITY_LABELS, PRIORITY_VARIANTS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Interaction, OpportunityInput } from '@/types/database'

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { opportunity, loading, error, update } = useOpportunity(id!)
  const { interactions, loading: interLoading, error: interError, createInteraction, updateInteraction, deleteInteraction } = useInteractions(id!)
  const { companies } = useCompanies()
  const { contacts } = useContacts()

  const [editOppOpen, setEditOppOpen] = useState(false)
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null)
  const [deletingInteractionId, setDeletingInteractionId] = useState<string | null>(null)
  const [deletingOpp, setDeletingOpp] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-sm text-destructive mb-4">{error ?? 'Opportunity not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/opportunities')}>
          Back to opportunities
        </Button>
      </div>
    )
  }

  const handleUpdateOpportunity = (input: OpportunityInput) => update(input)

  const openEditInteraction = (i: Interaction) => {
    setEditingInteraction(i)
    setInteractionDialogOpen(true)
  }

  const openLogInteraction = () => {
    setEditingInteraction(null)
    setInteractionDialogOpen(true)
  }

  const handleDeleteInteraction = async () => {
    if (!deletingInteractionId) return
    await deleteInteraction(deletingInteractionId)
    setDeletingInteractionId(null)
  }

  const displayStatus =
    opportunity.status === 'other' && opportunity.custom_status
      ? opportunity.custom_status
      : STATUS_LABELS[opportunity.status]

  const followUpOverdue =
    opportunity.follow_up_date &&
    isPast(new Date(opportunity.follow_up_date)) &&
    !isToday(new Date(opportunity.follow_up_date))

  const followUpToday = opportunity.follow_up_date && isToday(new Date(opportunity.follow_up_date))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link to="/opportunities" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Opportunities
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{opportunity.title}</span>
      </nav>

      {/* Header card */}
      <div className="rounded-lg border border-border bg-card p-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold">{opportunity.title}</h1>
            {opportunity.company && (
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                {opportunity.company.name}
                {opportunity.company.website && (
                  <a
                    href={opportunity.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={STATUS_VARIANTS[opportunity.status] as never}>{displayStatus}</Badge>
              <Badge variant={PRIORITY_VARIANTS[opportunity.priority] as never}>
                {PRIORITY_LABELS[opportunity.priority]} priority
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditOppOpen(true)}>
              <Pencil />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={() => setDeletingOpp(true)}
            >
              <Trash2 />
            </Button>
          </div>
        </div>

        {/* Detail row */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {opportunity.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {opportunity.location}
            </span>
          )}
          {opportunity.salary_range && (
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              {opportunity.salary_range}
            </span>
          )}
          {opportunity.follow_up_date && (
            <span
              className={cn(
                'flex items-center gap-1.5',
                followUpOverdue && 'text-destructive font-medium',
                followUpToday && 'text-amber-600 font-medium'
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              Follow-up: {format(new Date(opportunity.follow_up_date), 'MMM d, yyyy')}
              {followUpOverdue && ' (overdue)'}
              {followUpToday && ' (today)'}
            </span>
          )}
          {opportunity.url && (
            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Job posting
            </a>
          )}
        </div>

        {/* Next action */}
        {opportunity.next_action && (
          <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/10">
            <p className="text-xs font-medium text-primary mb-0.5">Next action</p>
            <p className="text-sm">{opportunity.next_action}</p>
          </div>
        )}

        {/* Notes */}
        {opportunity.notes && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground font-medium mb-1">Notes</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{opportunity.notes}</p>
          </div>
        )}
      </div>

      {/* Timeline section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Interaction timeline</h2>
          <Button size="sm" onClick={openLogInteraction}>
            <Plus />
            Log interaction
          </Button>
        </div>

        <TimelineView
          interactions={interactions}
          loading={interLoading}
          error={interError}
          onEdit={openEditInteraction}
          onDelete={(id) => setDeletingInteractionId(id)}
        />
      </div>

      {/* Dialogs */}
      <OpportunityFormDialog
        open={editOppOpen}
        onOpenChange={setEditOppOpen}
        opportunity={opportunity}
        companies={companies}
        onSubmit={handleUpdateOpportunity}
      />

      <InteractionFormDialog
        open={interactionDialogOpen}
        onOpenChange={(open) => {
          setInteractionDialogOpen(open)
          if (!open) setEditingInteraction(null)
        }}
        opportunityId={id!}
        interaction={editingInteraction}
        contacts={contacts}
        onSubmit={editingInteraction
          ? (input) => updateInteraction(editingInteraction.id, input)
          : createInteraction
        }
      />

      {/* Delete interaction confirm */}
      <AlertDialog
        open={Boolean(deletingInteractionId)}
        onOpenChange={(open) => !open && setDeletingInteractionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete interaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This interaction will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInteraction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete opportunity confirm */}
      <AlertDialog open={deletingOpp} onOpenChange={setDeletingOpp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete opportunity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this opportunity and ALL its interactions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const { error } = await supabase.from('opportunities').delete().eq('id', id!)
                if (!error) navigate('/opportunities')
              }}
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
