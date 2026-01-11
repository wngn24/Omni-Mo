export interface BaseEntity {
  id?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  isCompleted: boolean;
  scheduledDate: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  energy: 'low' | 'medium' | 'deep';
  timeEstimate?: number; // Minutes
}

export interface TimeSession extends BaseEntity {
  taskId?: number;
  startTime: Date;
  endTime?: Date;
  durationSeconds: number;
}

export interface Habit extends BaseEntity {
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  routine?: 'morning' | 'evening' | 'anytime';
  streak: number;
  completedDates: string[]; // ISO Date strings YYYY-MM-DD
}

export interface Note extends BaseEntity {
  title: string;
  content: string;
  tags: string[];
  type: 'general' | 'daily';
  date?: string; // YYYY-MM-DD for daily notes
}

export interface PlanItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Day extends BaseEntity {
  date: string; // YYYY-MM-DD unique index
  summary?: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'awful';
  intention?: string;
  plan?: PlanItem[];
  
  // Explicit References (IDs)
  pinnedNoteIds?: number[];
}

// Core Domain Model: Aggregated View of a Day
export interface DayAggregate {
  date: string;
  overview: Day; // The persistent Day entity
  
  // Related Entities
  tasks: Task[];
  sessions: TimeSession[];
  notes: Note[]; // Includes Daily Note + Pinned Notes
  habits: {
    habit: Habit;
    isCompleted: boolean;
  }[];
  
  // Metrics (Derived)
  metrics: {
    completionRate: number;
    totalFocusMinutes: number;
    mood?: string;
  };
}