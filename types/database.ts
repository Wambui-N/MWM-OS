export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ServiceType = "automation" | "web" | "both"
export type MusicSource = "spotify" | "youtube"
export type ClientStage =
  | "lead"
  | "discovery"
  | "proposal_sent"
  | "negotiation"
  | "active"
  | "completed"
  | "lost"
export type ProjectStatus = "active" | "paused" | "completed"
export type ContentStatus = "draft" | "scheduled" | "posted"
export type DayGrade = "A+" | "A" | "B" | "C" | "D"
export type RewardTriggerType =
  | "xp_milestone"
  | "posting_streak"
  | "habit_streak"
  | "weekly_score"
  | "project_closed"
  | "perfect_days"
  | "custom"

export interface UserPrefs {
  id: string
  user_email: string
  work_start_time: string
  pomodoro_work_mins: number
  pomodoro_break_mins: number
  xp: number
  level: number
  streak_days: number
  last_active_date: string | null
  // Gamification columns
  posting_streak: number
  posting_streak_best: number
  posting_streak_freeze_count: number
  last_complete_post_week: string | null
  monthly_revenue_target: number
  momentum_score: number
  last_momentum_update: string | null
  created_at: string
}

export interface Client {
  id: string
  name: string
  company: string | null
  email: string | null
  service_type: ServiceType | null
  stage: ClientStage
  value_ksh: number | null
  source: string | null
  last_contact: string | null
  next_action: string | null
  next_followup: string | null
  notes: string | null
  drive_folder_url: string | null
  created_at: string
  updated_at?: string
}

export interface Project {
  id: string
  client_id: string | null
  name: string
  status: ProjectStatus
  start_date: string | null
  due_date: string | null
  milestones: Json
  drive_folder_url: string | null
  notes: string | null
  created_at: string
}

export interface TickItem { id: string; label: string; done: boolean }
export interface TaskItem { id: string; label: string; duration_mins: number; done: boolean; gcal_event_id?: string }
export interface PlanProjectItem { id: string; label: string; duration_mins: number; client_id?: string; done: boolean; gcal_event_id?: string }

export interface DailyPlan {
  id: string
  plan_date: string
  ticks: TickItem[]
  tasks: TaskItem[]
  projects: PlanProjectItem[]
  schedule_sent_at: string | null
  gcal_synced: boolean
  daily_score: number | null
  daily_grade: DayGrade | null
  is_perfect_day: boolean
  created_at: string
}

export interface DailyIntention {
  id: string
  intention_date: string
  top_win: string | null
  energy_level: number | null
  notes: string | null
  created_at: string
}

export interface ContentPost {
  id: string
  platform: string
  hook: string | null
  body: string | null
  pillar: string | null
  status: ContentStatus
  scheduled_date: string | null
  gcal_event_id: string | null
  posted_at: string | null
  created_at: string
}

export interface PomodoroSession {
  id: string
  session_date: string
  label: string | null
  client_id: string | null
  duration_mins: number
  completed: boolean
  created_at: string
}

export interface SavedStation {
  id: string
  name: string
  source: MusicSource
  url: string
  thumbnail_url: string | null
  is_default: boolean
  sort_order: number
  created_at: string
}

export interface Habit {
  id: string
  name: string
  emoji: string
  active: boolean
  sort_order: number
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  log_date: string
  completed: boolean
  created_at: string
}

export interface Reward {
  id: string
  name: string
  description: string | null
  emoji: string
  trigger_type: RewardTriggerType
  trigger_threshold: number
  trigger_habit_id: string | null
  is_recurring: boolean
  recurrence: "weekly" | "monthly" | null
  is_active: boolean
  claimed_at: string | null
  last_reset_at: string | null
  created_at: string
}

export interface WeeklyReview {
  id: string
  week_start: string
  shipped: string | null
  biggest_win: string | null
  blocker: string | null
  next_priority: string | null
  xp_awarded: boolean
  created_at: string
}

export interface WeeklyChallenge {
  id: string
  week_start: string
  challenge_text: string
  trigger_type: string
  trigger_threshold: number
  current_progress: number
  completed: boolean
  xp_bonus: number
  created_at: string
}

export interface BossBattle {
  id: string
  project_id: string
  label: string
  total_milestones: number
  completed_milestones: number
  is_won: boolean
  won_at: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      user_prefs: { Row: UserPrefs; Insert: Partial<UserPrefs>; Update: Partial<UserPrefs> }
      clients: { Row: Client; Insert: Partial<Client>; Update: Partial<Client> }
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> }
      daily_plans: { Row: DailyPlan; Insert: Partial<DailyPlan>; Update: Partial<DailyPlan> }
      daily_intentions: { Row: DailyIntention; Insert: Partial<DailyIntention>; Update: Partial<DailyIntention> }
      content_posts: { Row: ContentPost; Insert: Partial<ContentPost>; Update: Partial<ContentPost> }
      pomodoro_sessions: { Row: PomodoroSession; Insert: Partial<PomodoroSession>; Update: Partial<PomodoroSession> }
      saved_stations: { Row: SavedStation; Insert: Partial<SavedStation>; Update: Partial<SavedStation> }
      habits: { Row: Habit; Insert: Partial<Habit>; Update: Partial<Habit> }
      habit_logs: { Row: HabitLog; Insert: Partial<HabitLog>; Update: Partial<HabitLog> }
      rewards: { Row: Reward; Insert: Partial<Reward>; Update: Partial<Reward> }
      weekly_reviews: { Row: WeeklyReview; Insert: Partial<WeeklyReview>; Update: Partial<WeeklyReview> }
      weekly_challenges: { Row: WeeklyChallenge; Insert: Partial<WeeklyChallenge>; Update: Partial<WeeklyChallenge> }
      boss_battles: { Row: BossBattle; Insert: Partial<BossBattle>; Update: Partial<BossBattle> }
    }
  }
}
