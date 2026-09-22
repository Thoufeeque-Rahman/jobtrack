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

