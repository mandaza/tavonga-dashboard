export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone?: string
  role?: 'support_worker' | 'practitioner' | 'family' | 'super_admin'
  is_admin: boolean
  approved: boolean
  is_active_carer: boolean
  is_carer: boolean
  created_at: string
  updated_at?: string
  profile_image?: string
  address?: string
  emergency_contact?: string
  emergency_phone?: string
  date_of_birth?: string
  hire_date?: string
}

export interface Behavior {
  id: string
  user: User
  date: string
  time: string
  location: 'home' | 'school' | 'community' | 'therapy' | 'transport' | 'other'
  specific_location?: string
  activity_before?: string
  behavior_type: 'aggression' | 'self_injury' | 'property_damage' | 'elopement' | 'non_compliance' | 'disruption' | 'other'
  behaviors?: string[]
  warning_signs?: string[]
  duration_minutes?: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  harm_to_self: boolean
  harm_to_others: boolean
  property_damage: boolean
  damage_description?: string
  intervention_used: string
  intervention_effective?: boolean
  intervention_notes?: string
  follow_up_required: boolean
  follow_up_notes?: string
  photos?: string[]
  videos?: string[]
  notes?: string
  triggers_identified?: string[]
  is_critical: boolean
  requires_immediate_attention: boolean
  media?: any[]
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  name: string
  description: string
  category: 'daily_living' | 'social' | 'educational' | 'recreational' | 'therapeutic' | 'other'
  difficulty: 'easy' | 'medium' | 'hard'
  instructions: string
  prerequisites?: string
  estimated_duration?: number // in minutes
  primary_goal?: { id: string; name: string }
  related_goals: { id: string; name: string }[]
  all_goals: { id: string; name: string }[]
  goal_contribution_weight: number
  image_url?: string
  video_url?: string
  is_active: boolean
  created_by: User
  completion_rate: number
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  activity: Activity
  assigned_user: User
  created_by: User
  scheduled_date: string
  scheduled_time: string
  estimated_duration?: number
  actual_start_time?: string
  actual_end_time?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly'
  recurrence_end_date?: string
  parent_schedule?: string
  notes?: string
  preparation_notes?: string
  completion_notes?: string
  location?: string
  special_requirements?: string
  send_reminder?: boolean
  reminder_minutes_before?: number
  reminder_sent?: boolean
  completed: boolean
  completion_percentage: number
  difficulty_rating?: number
  satisfaction_rating?: number
  is_overdue: boolean
  is_today: boolean
  is_upcoming: boolean
  scheduled_datetime: string
  actual_duration_minutes?: number
  time_until_scheduled?: string
  created_at: string
  updated_at?: string
}

export interface Goal {
  id: string
  name: string
  description: string
  category?: string
  target_date?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_carers: User[]
  created_by: User
  progress_percentage: number
  calculated_progress: number
  notes?: string
  required_activities_count: number
  completion_threshold: number
  primary_activities: Activity[]
  related_activities: Activity[]
  all_activities: Activity[]
  completed_activities_count: number
  total_activities_count: number
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export interface Shift {
  id: string
  carer: User
  date: string
  shift_type: 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day' | 'custom'
  start_time: string
  end_time: string
  break_duration: number
  clock_in?: string
  clock_out?: string
  clock_in_location?: string
  clock_out_location?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  assigned_by?: User
  location?: string
  client_name?: string
  client_address?: string
  notes?: string
  special_instructions?: string
  emergency_contact?: string
  performance_rating?: number
  supervisor_notes?: string
  duration_hours?: number
  is_late: boolean
  is_early_leave: boolean
  is_current_shift: boolean
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export interface DailyPlan {
  id: string
  date: string
  activities: {
    activityId: string
    activityName: string
    startTime: string
    endTime: string
    assignedCarer?: string
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  }[]
}

export interface DashboardStats {
  totalCarers: number
  activeCarers: number
  totalShifts: number
  completedShifts: number
  totalBehaviors: number
  behaviorsThisWeek: number
  totalActivities: number
  activitiesThisWeek: number
}

// Client types
export interface Client {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  preferred_name?: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: string
  phone?: string
  email?: string
  diagnosis: string
  secondary_diagnoses?: string
  allergies?: string
  medications?: string
  medical_notes?: string
  care_level: 'low' | 'medium' | 'high' | 'critical'
  interests?: string
  likes?: string
  dislikes?: string
  communication_preferences?: string
  behavioral_triggers?: string[]
  calming_strategies?: string[]
  profile_picture?: string
  additional_photos?: string[]
  client_id: string
  is_active: boolean
  notes?: string
  primary_support_worker?: User
  support_team?: User[]
  case_manager?: User
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  client: string
  contact_type: 'emergency' | 'family' | 'guardian' | 'gp' | 'specialist' | 'therapist' | 'social_worker' | 'advocate' | 'friend' | 'other'
  first_name: string
  last_name: string
  relationship?: 'parent' | 'sibling' | 'guardian' | 'grandparent' | 'aunt_uncle' | 'cousin' | 'friend' | 'doctor' | 'therapist' | 'social_worker' | 'advocate' | 'other'
  relationship_description?: string
  phone_primary?: string
  phone_secondary?: string
  email?: string
  address?: string
  practice_name?: string
  specialty?: string
  license_number?: string
  is_primary_contact: boolean
  can_pick_up: boolean
  can_receive_updates: boolean
  emergency_only: boolean
  preferred_contact_method: 'phone' | 'email' | 'text'
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
  }[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  results: T[]
  count: number
  next: string | null
  previous: string | null
} 