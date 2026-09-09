export type SessionType = 'study' | 'break';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  weekly_goal_hours: number;
  daily_goal_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  weight_percentage: number;
  target_hours_weekly: number;
  current_topic: string | null;
  grade_progress_percentage: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string | null;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  session_type: SessionType;
  efficiency_rate: number;
  notes: string | null;
  created_at: string;
  subject?: Subject;
}

export interface DailyStudyRecord {
  id: string;
  user_id: string;
  subject_id: string;
  date: string; // YYYY-MM-DD
  learning_note: string | null;
  anki_completed: boolean;
  anki_cards_count: number;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface DailyMetrics {
  totalStudySecondsToday: number;
  totalBreakSecondsToday: number;
  targetMinutesToday: number;
  completedBlocksCount: number;
  activeSubjectsToday: number;
  totalActiveSubjects: number;
  ankiCardsToday: number;
  efficiencyToday: number;
  weeklyHours: number;
  weeklyGoalHours: number;
  streakDays: number;
}
