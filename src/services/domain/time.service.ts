import { Injectable, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { TimeSession } from '../../models/entities';

@Injectable({ providedIn: 'root' })
export class TimeService {
  private storage = inject(StorageService);

  async getTodaySessions(): Promise<TimeSession[]> {
    return this.storage.sessions.getTodaySessions();
  }

  async getSessionsForDate(dateStr: string): Promise<TimeSession[]> {
    return this.storage.sessions.getSessionsByDate(dateStr);
  }

  async getSessionsForTask(taskId: number): Promise<TimeSession[]> {
    const all = await this.storage.sessions.getAll();
    // Filter in memory for MVP. 
    // In a production app with thousands of sessions, we would add an index on taskId.
    return all
      .filter(s => s.taskId === taskId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async recordSession(taskId: number | undefined, durationSeconds: number): Promise<void> {
    // Business Rule: Only record sessions longer than 10 seconds
    if (durationSeconds <= 10) return;

    await this.storage.sessions.add({
      taskId,
      startTime: new Date(Date.now() - durationSeconds * 1000),
      durationSeconds
    });
  }
}