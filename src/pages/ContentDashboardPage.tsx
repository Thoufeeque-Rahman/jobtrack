import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clapperboard, ArrowRight, CalendarClock, ChevronRight, TrendingUp } from 'lucide-react'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { useContent } from '@/features/content/useContent'
import { ContentFormDialog } from '@/features/content/ContentFormDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_VARIANTS,
  CONTENT_TYPE_LABELS,
  CONTENT_PLATFORM_LABELS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ContentPost } from '@/types/database'

function StatusStat({ label, count, variant }: { label: string; count: number; variant?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card gap-1">
      <span
        className={cn(
          'text-2xl font-bold',
          variant === 'success' && 'text-emerald-600',
          variant === 'info' && 'text-blue-600',
          variant === 'warning' && 'text-amber-600',
          variant === 'purple' && 'text-purple-600',
        )}
      >
        {count}
      </span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  )
}

function ContentCard({ post }: { post: ContentPost }) {
  return (
    <Link
      to={`/content/${post.id}`}
      className="group flex items-start gap-3 px-4 py-3 hover:bg-accent/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{post.title}</span>
          <Badge variant={CONTENT_STATUS_VARIANTS[post.status] as never} className="text-[11px] py-0 shrink-0">
            {CONTENT_STATUS_LABELS[post.status]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {CONTENT_TYPE_LABELS[post.content_type]} · {CONTENT_PLATFORM_LABELS[post.platform]} ·{' '}
          updated {formatDistanceToNow(parseISO(post.updated_at), { addSuffix: true })}
        </p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 transition-opacity" />
    </Link>
  )
}

export default function ContentDashboardPage() {
  const { contentPosts, loading, createPost, updatePostWithToast } = useContent()
  const [dialogOpen, setDialogOpen] = useState(false)

  const stats = useMemo(() => {
    const ideas = contentPosts.filter((p) => p.status === 'idea').length
    const inProgress = contentPosts.filter((p) =>
      ['script', 'recording', 'editing'].includes(p.status)
    ).length
    const ready = contentPosts.filter((p) => p.status === 'ready').length
    const scheduled = contentPosts.filter((p) => p.status === 'scheduled').length
    const published = contentPosts.filter((p) => p.status === 'published').length
    return { ideas, inProgress, ready, scheduled, published }
  }, [contentPosts])

  const currentWork = useMemo(
    () =>
      contentPosts
        .filter((p) => !['ready', 'scheduled', 'published', 'archived'].includes(p.status))
        .slice(0, 6),
    [contentPosts]
  )

  const upcomingScheduled = useMemo(
    () =>
      contentPosts
        .filter((p) => p.status === 'scheduled' && p.scheduled_at)
        .sort((a, b) => parseISO(a.scheduled_at!).getTime() - parseISO(b.scheduled_at!).getTime())
        .slice(0, 5),
    [contentPosts]
  )

  const recentPublished = useMemo(
    () =>
      contentPosts
        .filter((p) => p.status === 'published')
        .sort((a, b) =>
          parseISO(b.published_at ?? b.updated_at).getTime() -
          parseISO(a.published_at ?? a.updated_at).getTime()
        )
        .slice(0, 5),
    [contentPosts]
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2.5">
            <Clapperboard className="h-6 w-6 text-primary" />
            Content Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your personal content creation workspace</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New content
        </Button>
      </div>

      {/* Summary stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatusStat label="Ideas" count={stats.ideas} />
          <StatusStat label="In Progress" count={stats.inProgress} variant="info" />
          <StatusStat label="Ready" count={stats.ready} variant="success" />
          <StatusStat label="Scheduled" count={stats.scheduled} variant="purple" />
          <StatusStat label="Published" count={stats.published} variant="success" />
        </div>
      )}

      {/* Three columns of cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Work */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Current work</CardTitle>
              <Link to="/content/pipeline" className="text-xs text-primary hover:underline flex items-center gap-1">
                Pipeline <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3 pb-2 px-0">
            {loading ? (
              <div className="px-4 space-y-2 py-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
              </div>
            ) : currentWork.length === 0 ? (
              <p className="text-sm text-muted-foreground px-4 py-4">
                No content in progress.{' '}
                <button onClick={() => setDialogOpen(true)} className="text-primary underline">
                  Create one →
                </button>
              </p>
            ) : (
              <div className="divide-y divide-border">
                {currentWork.map((p) => <ContentCard key={p.id} post={p} />)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming + Published */}
        <div className="space-y-5">
          {/* Upcoming scheduled */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4" /> Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2 px-0">
              {loading ? (
                <div className="px-4 py-2 space-y-2">
                  {[...Array(2)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
                </div>
              ) : upcomingScheduled.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 py-3">Nothing scheduled yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {upcomingScheduled.map((p) => (
                    <Link
                      key={p.id}
                      to={`/content/${p.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/40 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.scheduled_at ? format(parseISO(p.scheduled_at), 'MMM d, yyyy') : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently published */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" /> Published
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2 px-0">
              {loading ? (
                <div className="px-4 py-2 space-y-2">
                  {[...Array(2)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
                </div>
              ) : recentPublished.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 py-3">Nothing published yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {recentPublished.map((p) => (
                    <Link
                      key={p.id}
                      to={`/content/${p.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/40 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {CONTENT_PLATFORM_LABELS[p.platform]}
                          {p.published_at ? ` · ${format(parseISO(p.published_at), 'MMM d')}` : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ContentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} createPost={createPost} updatePostWithToast={updatePostWithToast} />
    </div>
  )
}
