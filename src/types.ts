
export interface Exercise {
  id: string;
  name: string;
  englishName?: string;
  description?: string;
  note?: string;
  level?: string;
  sets?: number | string;
  reps?: string;
  animation?: string;
  explanation?: string;
  rating?: number;
  difficulty?: string;
  time?: string;
  muscles?: string;
  instruction?: string;
  goal?: string;
  icon?: string;
  category?: string;
  tips?: string;
  mistakes?: string;
}

export interface ExerciseCategory {
  title: string;
  items: Exercise[];
}

export interface UserProfile {
  name: string;
  level: string;
  joinedDate: string;
}

export interface RoutineItem extends Exercise {
  addedAt: string;
}

export interface SavedRoutine {
  id: number;
  name: string;
  exercises: RoutineItem[]; 
  createdAt: string;
  completed: boolean;
}

export interface ScheduledWorkout extends SavedRoutine {
  date: string; // YYYY-MM-DD
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
  data: string;
  name: string;
  timestamp: number;
}

export interface PlanDay {
  title: string; 
  type: 'water' | 'dry' | 'rest'; 
  goal: string; 
  items: string[];
}

export interface TacticObject {
  id: string;
  type: 'blue-cap' | 'white-cap' | 'red-cap' | 'ball';
  x: number;
  y: number;
  number?: number;
}

export type TabType = 'planner' | 'tactics' | 'pro-plan' | 'calendar' | 'stats' | 'gallery' | 'contact';
