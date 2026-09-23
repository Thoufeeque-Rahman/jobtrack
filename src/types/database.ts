export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OpportunityStatus =
  | 'discovered'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'accepted'
  | 'withdrawn'
  | 'other'

export type OpportunityPriority = 'low' | 'medium' | 'high'
export type InteractionDirection = 'outgoing' | 'incoming'
export type InteractionPlatform = 'linkedin' | 'email' | 'phone' | 'whatsapp' | 'in_person' | 'other'
export type InteractionType =
  | 'dm'
  | 'email'
  | 'call'
  | 'meeting'
  | 'application'
  | 'follow_up'
  | 'recruiter_contact'
  | 'offer'
  | 'rejection'
  | 'other'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  user_id: string
  name: string
  website: string | null
  industry: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  user_id: string
  company_id: string | null
  title: string
  status: OpportunityStatus
  custom_status: string | null
  priority: OpportunityPriority
  url: string | null
  salary_range: string | null
  location: string | null
  notes: string | null
  next_action: string | null
  follow_up_date: string | null
  applied_at: string | null
  created_at: string
  updated_at: string
  // joined
  company?: Company
}

export interface Contact {
  id: string
  user_id: string
  company_id: string | null
  name: string
  role: string | null
  email: string | null
  linkedin_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  company?: Company
}

export interface Interaction {
  id: string
  user_id: string
  opportunity_id: string
  contact_id: string | null
  platform: InteractionPlatform
  interaction_type: InteractionType
  direction: InteractionDirection
  content: string | null
  notes: string | null
  interacted_at: string
  created_at: string
  updated_at: string
  // joined
  contact?: Contact
}

// Form input types (omit server-generated fields)
export type CompanyInput = Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type OpportunityInput = Omit<Opportunity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'company'>
export type ContactInput = Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'company'>
export type InteractionInput = Omit<Interaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'contact'>

// ─── Content Studio ────────────────────────────────────────────────────────

export type ContentType = 'video' | 'text' | 'carousel' | 'image'
export type ContentPlatform = 'linkedin' | 'instagram' | 'youtube' | 'facebook' | 'other'
export type ContentStatus =
  | 'idea'
  | 'script'
  | 'recording'
  | 'editing'
  | 'ready'
  | 'scheduled'
  | 'published'
  | 'archived'

export interface ContentPost {
  id: string
  user_id: string

  // Core
  title: string
  description: string | null
  content_type: ContentType
  platform: ContentPlatform
  status: ContentStatus

  // Creative content
  idea: string | null
  hook: string | null
  script: string | null
  caption: string | null
  call_to_action: string | null
  notes: string | null

  // Production checklist — explicit boolean columns
  checklist_idea_finalized: boolean
  checklist_hook_finalized: boolean
  checklist_script_completed: boolean
  checklist_video_recorded: boolean
  checklist_video_edited: boolean
  checklist_thumbnail_ready: boolean
  checklist_caption_ready: boolean
  checklist_cta_ready: boolean
  checklist_published: boolean

  // Production assets
  recording_url: string | null
  thumbnail_url: string | null

  // Publishing
  published_url: string | null
  scheduled_at: string | null
  published_at: string | null

  // Manual performance metrics
  views: number
  likes: number
  comments: number
  shares: number

  // Timestamps
  created_at: string
  updated_at: string
}

export type ContentPostInput = Omit<ContentPost, 'id' | 'user_id' | 'created_at' | 'updated_at'>
