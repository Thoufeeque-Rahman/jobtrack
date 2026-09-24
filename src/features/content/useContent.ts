import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { ContentPost, ContentPostInput, ContentStatus, ContentPlatform, ContentType } from '@/types/database'

const CONTENT_SELECT = `
  id, user_id, title, description, content_type, platform, status,
  idea, hook, script, caption, call_to_action, notes,
  checklist_idea_finalized, checklist_hook_finalized, checklist_script_completed,
  checklist_video_recorded, checklist_video_edited, checklist_thumbnail_ready,
  checklist_caption_ready, checklist_cta_ready, checklist_published,
  recording_url, thumbnail_url, published_url,
  scheduled_at, published_at,
  views, likes, comments, shares,
  created_at, updated_at
`

function asPost(data: unknown): ContentPost { return data as ContentPost }
function asPosts(data: unknown[]): ContentPost[] { return data as ContentPost[] }

export interface ContentFilters {
  searchQuery: string
  statusFilter: ContentStatus | 'all'
  platformFilter: ContentPlatform | 'all'
  typeFilter: ContentType | 'all'
}

export function useContent() {
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ContentFilters>({
    searchQuery: '',
    statusFilter: 'all',
    platformFilter: 'all',
    typeFilter: 'all',
  })

  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('content_posts')
      .select(CONTENT_SELECT)
      .order('updated_at', { ascending: false })

    if (error) {
      setError('Failed to load content posts.')
      console.error(error)
    } else {
      setContentPosts(asPosts(data ?? []))
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchContent() }, [fetchContent])

  const createPost = async (input: ContentPostInput): Promise<ContentPost | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const payload = user ? { ...input, user_id: user.id } : input

    const { data, error } = await supabase
      .from('content_posts')
      .insert(payload)
      .select(CONTENT_SELECT)
      .single()
    if (error) { toast.error('Failed to create content post.'); console.error(error); return null }
    const post = asPost(data)
    setContentPosts((prev) => [post, ...prev])
    toast.success('Content post created.')
    return post
  }

  const updatePost = async (id: string, patch: Partial<ContentPostInput>): Promise<ContentPost | null> => {
    const { data, error } = await supabase
      .from('content_posts')
      .update(patch)
      .eq('id', id)
      .select(CONTENT_SELECT)
      .single()
    if (error) { toast.error('Failed to update content post.'); console.error(error); return null }
    const post = asPost(data)
    setContentPosts((prev) => prev.map((p) => (p.id === id ? post : p)))
    return post
  }

  const updatePostWithToast = async (id: string, patch: Partial<ContentPostInput>): Promise<ContentPost | null> => {
    const result = await updatePost(id, patch)
    if (result) toast.success('Updated.')
    return result
  }

  const deletePost = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('content_posts').delete().eq('id', id)
    if (error) { toast.error('Failed to delete content post.'); console.error(error); return false }
    setContentPosts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Content post deleted.')
    return true
  }

  const updateStatus = async (id: string, status: ContentStatus): Promise<boolean> => {
    const result = await updatePost(id, { status })
    if (result) toast.success(`Moved to ${status}.`)
    return result !== null
  }

  const filteredPosts = useMemo(() => {
    let posts = contentPosts
    const { searchQuery, statusFilter, platformFilter, typeFilter } = filters

    if (statusFilter !== 'all') {
      posts = posts.filter((p) => p.status === statusFilter)
    }
    if (platformFilter !== 'all') {
      posts = posts.filter((p) => p.platform === platformFilter)
    }
    if (typeFilter !== 'all') {
      posts = posts.filter((p) => p.content_type === typeFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      posts = posts.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.idea?.toLowerCase().includes(q) ||
        p.script?.toLowerCase().includes(q) ||
        p.caption?.toLowerCase().includes(q)
      )
    }
    return posts
  }, [contentPosts, filters])

  return {
    contentPosts,
    filteredPosts,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchContent,
    createPost,
    updatePost,
    updatePostWithToast,
    deletePost,
    updateStatus,
  }
}

export function useContentPost(id: string) {
  const [post, setPost] = useState<ContentPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPost = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('content_posts')
      .select(CONTENT_SELECT)
      .eq('id', id)
      .single()
    if (error) { setError('Content post not found.'); console.error(error) }
    else { setPost(data as ContentPost) }
    setLoading(false)
  }, [id])

  useEffect(() => { void fetchPost() }, [fetchPost])

  const update = async (patch: Partial<ContentPostInput>): Promise<ContentPost | null> => {
    const { data, error } = await supabase
      .from('content_posts')
      .update(patch)
      .eq('id', id)
      .select(CONTENT_SELECT)
      .single()
    if (error) { toast.error('Failed to save.'); console.error(error); return null }
    const updated = data as ContentPost
    setPost(updated)
    return updated
  }

  return { post, loading, error, refetch: fetchPost, update }
}

