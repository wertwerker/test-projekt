// Database Types for Supabase Tables
// Auto-generated types based on database schema

export interface Profile {
  id: string // UUID from auth.users
  email: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

// Type for inserting a new profile (all fields optional except id and email)
export interface ProfileInsert {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
}

// Type for updating a profile (all fields optional)
export interface ProfileUpdate {
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
    }
  }
}
