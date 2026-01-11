import { Injectable, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { Habit } from '../../models/entities';

@Injectable({ providedIn: 'root' })
export class HabitService {
  private storage = inject(StorageService);

  async getAllHabits(): Promise<Habit[]> {
    return this.storage.habits.getAll();
  }

  async addHabit(title: string, routine: 'morning' | 'evening' | 'anytime'): Promise<void> {
    await this.storage.habits.add({
      title,
      frequency: 'daily',
      routine,
      streak: 0,
      completedDates: []
    });
  }

  async deleteHabit(id: number): Promise<void> {
    await this.storage.habits.delete(id);
  }

  async toggleHabitForDate(habit: Habit, dateStr: string): Promise<void> {
    let dates = habit.completedDates || [];
    
    // Toggle logic
    if (dates.includes(dateStr)) {
      dates = dates.filter(d => d !== dateStr);
    } else {
      dates = [...dates, dateStr];
    }
    
    // In a real app, we would recalculate streaks here
    await this.storage.habits.update({ ...habit, completedDates: dates });
  }
}