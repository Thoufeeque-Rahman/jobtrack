import type {
  OpportunityStatus,
  OpportunityPriority,
  InteractionPlatform,
  InteractionType,
  ContentStatus,
  ContentType,
  ContentPlatform,
} from '@/types/database'

// ─── Opportunity Status ────────────────────────────────────────────────────

export const STATUS_LABELS: Record<OpportunityStatus, string> = {
  discovered: 'Discovered',
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  accepted: 'Accepted',
  withdrawn: 'Withdrawn',
  other: 'Other',
}

export const STATUS_VARIANTS: Record<OpportunityStatus, string> = {
  discovered: 'muted',
  applied: 'info',
  screening: 'info',
  interview: 'purple',
  offer: 'success',
  rejected: 'destructive',
  accepted: 'success',
  withdrawn: 'muted',
  other: 'muted',
}

export const STATUS_ORDER: OpportunityStatus[] = [
  'discovered',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'accepted',
  'withdrawn',
  'other',
]

// ─── Opportunity Priority ──────────────────────────────────────────────────

export const PRIORITY_LABELS: Record<OpportunityPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const PRIORITY_VARIANTS: Record<OpportunityPriority, string> = {
  low: 'muted',
  medium: 'warning',
  high: 'destructive',
}

// ─── Interaction Platform ──────────────────────────────────────────────────

export const PLATFORM_LABELS: Record<InteractionPlatform, string> = {
  linkedin: 'LinkedIn',
  email: 'Email',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  in_person: 'In person',
  other: 'Other',
}

// ─── Interaction Type ──────────────────────────────────────────────────────

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  dm: 'DM',
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  application: 'Application',
  follow_up: 'Follow-up',
  recruiter_contact: 'Recruiter contact',
  offer: 'Offer',
  rejection: 'Rejection',
  other: 'Other',
}

// ─── Content Studio ────────────────────────────────────────────────────────

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  script: 'Script',
  recording: 'Recording',
  editing: 'Editing',
  ready: 'Ready',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
}

export const CONTENT_STATUS_VARIANTS: Record<ContentStatus, string> = {
  idea: 'muted',
  script: 'info',
  recording: 'info',
  editing: 'warning',
  ready: 'success',
  scheduled: 'purple',
  published: 'success',
  archived: 'muted',
}

export const CONTENT_STATUS_ORDER: ContentStatus[] = [
  'idea',
  'script',
  'recording',
  'editing',
  'ready',
  'scheduled',
  'published',
]

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  video: 'Video',
  text: 'Text',
  carousel: 'Carousel',
  image: 'Image',
}

export const CONTENT_PLATFORM_LABELS: Record<ContentPlatform, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  other: 'Other',
}

export interface ChecklistItem {
  key: keyof Pick<
    import('@/types/database').ContentPost,
    | 'checklist_idea_finalized'
    | 'checklist_hook_finalized'
    | 'checklist_script_completed'
    | 'checklist_video_recorded'
    | 'checklist_video_edited'
    | 'checklist_thumbnail_ready'
    | 'checklist_caption_ready'
    | 'checklist_cta_ready'
    | 'checklist_published'
  >
  label: string
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: 'checklist_idea_finalized',   label: 'Idea finalized' },
  { key: 'checklist_hook_finalized',   label: 'Hook finalized' },
  { key: 'checklist_script_completed', label: 'Script completed' },
  { key: 'checklist_video_recorded',   label: 'Video recorded' },
  { key: 'checklist_video_edited',     label: 'Video edited' },
  { key: 'checklist_thumbnail_ready',  label: 'Thumbnail ready' },
  { key: 'checklist_caption_ready',    label: 'Caption ready' },
  { key: 'checklist_cta_ready',        label: 'CTA ready' },
  { key: 'checklist_published',        label: 'Published' },
]
