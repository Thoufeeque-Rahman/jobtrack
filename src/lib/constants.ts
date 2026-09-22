import type { OpportunityStatus, OpportunityPriority, InteractionPlatform, InteractionType } from '@/types/database'

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
