import { Injectable, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { Task } from '../../models/entities';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private storage = inject(StorageService);

  async getTasksForDate(dateStr: string): Promise<Task[]> {
    const tasks = await this.storage.tasks.getByDate(dateStr);
    // Business Rule: Sort by completion (incomplete first), then priority (high to low)
    return tasks.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    });
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.storage.tasks.add(task);
  }

  async updateTask(task: Task): Promise<void> {
    await this.storage.tasks.update(task);
  }

  async deleteTask(id: number): Promise<void> {
    await this.storage.tasks.delete(id);
  }

  async toggleCompletion(task: Task): Promise<void> {
    await this.storage.tasks.update({
      ...task,
      isCompleted: !task.isCompleted
    });
  }
}