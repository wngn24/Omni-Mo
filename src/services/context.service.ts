import { Injectable, inject } from '@angular/core';
import { DayService } from './day.service';
import { TaskService } from './domain/task.service';
import { TimeService } from './domain/time.service';
import { HabitService } from './domain/habit.service';
import { NoteService } from './domain/note.service';
import { DayAggregate } from '../models/entities';

@Injectable({ providedIn: 'root' })
export class ContextService {
  private dayService = inject(DayService);
  private taskService = inject(TaskService);
  private timeService = inject(TimeService);
  private habitService = inject(HabitService);
  private noteService = inject(NoteService);

  /**
   * The core Cross-Mode Awareness method.
   * Aggregates state from all domain services into a unified, read-only view.
   */
  async getContext(dateStr: string): Promise<Readonly<DayAggregate>> {
    const day = await this.dayService.ensureDay(dateStr);

    const [tasks, sessions, dailyNote, habits, pinnedNotes] = await Promise.all([
      this.taskService.getTasksForDate(dateStr),
      this.timeService.getSessionsForDate(dateStr),
      this.noteService.getDailyNote(dateStr),
      this.habitService.getAllHabits(),
      this.noteService.getNotesByIds(day.pinnedNoteIds || [])
    ]);

    const habitStatus = habits.map(h => ({
      habit: h,
      isCompleted: h.completedDates?.includes(dateStr) ?? false
    }));

    const notes = [...pinnedNotes];
    if (dailyNote) {
      notes.unshift(dailyNote);
    }

    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60;

    return {
      date: dateStr,
      overview: day,
      tasks,
      sessions,
      notes,
      habits: habitStatus,
      metrics: {
        completionRate,
        totalFocusMinutes,
        mood: day.mood
      }
    };
  }

  async getTodayContext(): Promise<Readonly<DayAggregate>> {
    return this.getContext(this.getTodayStr());
  }

  // AI Helper - Refactored to use the new Context Aggregate
  async getFormattedPrompt(): Promise<string> {
    const ctx = await this.getTodayContext();
    
    // Derived state for AI context
    const recentNotes = await this.noteService.getRecentNotes(5);
    const incompleteTasks = ctx.tasks.filter(t => !t.isCompleted);
    const highPriority = incompleteTasks.filter(t => t.priority === 'high').map(t => t.title);
    const doneHabitsCount = ctx.habits.filter(h => h.isCompleted).length;

    return `
      Current Context:
      - Date: ${ctx.date} (Today)
      - Mood: ${ctx.overview.mood || 'Unknown'}
      - Daily Intention: "${ctx.overview.intention || 'Not set'}"
      - Current Plan: ${ctx.overview.plan && ctx.overview.plan.length > 0 ? ctx.overview.plan.map(p => `[${p.isCompleted ? 'x' : ' '}] ${p.text}`).join(', ') : 'Empty'}
      - Tasks: ${incompleteTasks.length} pending (${highPriority.length} high priority: ${highPriority.join(', ')})
      - Habits: ${doneHabitsCount}/${ctx.habits.length} done today.
      - Focus Today: ${Math.round(ctx.metrics.totalFocusMinutes)} minutes.
      - Recent Thinking: ${recentNotes.map(n => n.title).join(', ')}
    `;
  }

  private getTodayStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}