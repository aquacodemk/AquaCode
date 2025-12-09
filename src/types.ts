
export interface Exercise {
  id: string;
  name: string;
  instruction: string;
  goal: string;
  icon: string;
  category: string; // Used for filtering
  tips?: string; // Proper form/execution tips
  mistakes?: string; // Common mistakes to avoid
}

export interface ExerciseCategory {
  title: string;
  items: Exercise[];
}

export interface RoutineItem {
  id: string;
  name: string;
  addedAt: string; // ISO date string
}

export interface SavedRoutine {
  id: number;
  name: string;
  exercises: RoutineItem[];
  createdAt: string;
  completed: boolean;
}

export interface ScheduledWorkout extends SavedRoutine {
  date: string; // YYYY-MM-DD format
}

export interface DailyStats {
  total: number;
  streak: number;
  lastDate: string | null;
  level: string;
  calories: number;
}

export interface GalleryImage {
  id: number;
  data: string; // Base64
  name: string;
  timestamp: number;
}

export type TabType = 'planner' | 'pro-plan' | 'calendar' | 'stats' | 'gallery' | 'contact';
