import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { useContent } from '@/features/content/useContent'
import { ContentFormDialog } from '@/features/content/ContentFormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_ORDER,
  CONTENT_TYPE_LABELS,
  CONTENT_PLATFORM_LABELS,
} from '@/lib/constants'
import type { ContentPost, ContentStatus, ContentPlatform, ContentType } from '@/types/database'

interface KanbanCardProps {
  post: ContentPost
  onStatusChange: (id: string, status: ContentStatus) => void
  onEdit: (post: ContentPost) => void
  onDelete: (id: string) => void
}

function KanbanCard({ post, onStatusChange, onEdit, onDelete }: KanbanCardProps) {
  return (
    <div className="group bg-card border border-border rounded-lg p-3 space-y-2 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/content/${post.id}`} className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-6 w-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-all shrink-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(post)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            {CONTENT_STATUS_ORDER.filter((s) => s !== post.status).map((s) => (
              <DropdownMenuItem key={s} onClick={() => onStatusChange(post.id, s)}>
                Move to {CONTENT_STATUS_LABELS[s]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(post.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {CONTENT_TYPE_LABELS[post.content_type]}
        </Badge>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {CONTENT_PLATFORM_LABELS[post.platform]}
        </Badge>
      </div>

      {post.scheduled_at && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          🗓 {format(parseISO(post.scheduled_at), 'MMM d, yyyy')}
        </p>
      )}

      <p className="text-[11px] text-muted-foreground">
        {formatDistanceToNow(parseISO(post.updated_at), { addSuffix: true })}
      </p>
    </div>
  )
}

interface KanbanColumnProps {
  status: ContentStatus
  posts: ContentPost[]
  onStatusChange: (id: string, status: ContentStatus) => void
  onEdit: (post: ContentPost) => void
  onDelete: (id: string) => void
}

function KanbanColumn({ status, posts, onStatusChange, onEdit, onDelete }: KanbanColumnProps) {
  return (
    <div className="flex flex-col shrink-0 w-64">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {CONTENT_STATUS_LABELS[status]}
        </span>
        <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {posts.length}
        </span>
      </div>
      <div className="space-y-2.5 min-h-16">
        {posts.map((p) => (
          <KanbanCard
            key={p.id}
            post={p}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default function ContentPipelinePage() {
  const { filteredPosts, loading, filters, setFilters, updateStatus, deletePost, createPost, updatePostWithToast } = useContent()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPost, setEditPost] = useState<ContentPost | null>(null)

  const postsByStatus = useMemo(() => {
    const map: Record<ContentStatus, ContentPost[]> = {
      idea: [], script: [], recording: [], editing: [],
      ready: [], scheduled: [], published: [], archived: [],
    }
    for (const post of filteredPosts) {
      map[post.status].push(post)
    }
    return map
  }, [filteredPosts])

  function handleEdit(post: ContentPost) {
    setEditPost(post)
    setDialogOpen(true)
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) setEditPost(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-xl font-semibold">Content Pipeline</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New content
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2.5 px-6 py-3 border-b border-border bg-background/60 shrink-0">
        <div className="relative flex-1 min-w-44 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search content…"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select
          value={filters.platformFilter}
          onValueChange={(v) => setFilters({ ...filters, platformFilter: v as ContentPlatform | 'all' })}
        >
          <SelectTrigger className="h-8 text-sm w-36">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {(Object.keys(CONTENT_PLATFORM_LABELS) as ContentPlatform[]).map((p) => (
              <SelectItem key={p} value={p}>{CONTENT_PLATFORM_LABELS[p]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.typeFilter}
          onValueChange={(v) => setFilters({ ...filters, typeFilter: v as ContentType | 'all' })}
        >
          <SelectTrigger className="h-8 text-sm w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((t) => (
              <SelectItem key={t} value={t}>{CONTENT_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto px-6 py-5">
        {loading ? (
          <div className="flex gap-5">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="shrink-0 w-64 space-y-2.5">
                <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="h-28 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-5 pb-4" style={{ minWidth: 'max-content' }}>
            {CONTENT_STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                posts={postsByStatus[status]}
                onStatusChange={updateStatus}
                onEdit={handleEdit}
                onDelete={deletePost}
              />
            ))}
          </div>
        )}
      </div>

      <ContentFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        editPost={editPost}
        createPost={createPost}
        updatePostWithToast={updatePostWithToast}
      />
    </div>
  )
}
