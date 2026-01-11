import { DatabaseService } from './database.service';
import { BaseEntity, Task, TimeSession, Habit, Note, Day } from '../models/entities';

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected db: DatabaseService, protected storeName: string) {}

  async getAll(): Promise<T[]> {
    return this.db.getAll<T>(this.storeName);
  }

  async get(id: number): Promise<T | undefined> {
    return this.db.get<T>(this.storeName, id);
  }

  async add(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    // Safe cast for IDB insertion
    const entity = { ...item, createdAt: now, updatedAt: now } as unknown as T;
    return this.db.add(this.storeName, entity);
  }

  async update(item: T): Promise<void> {
    const entity = { ...item, updatedAt: new Date() };
    return this.db.put(this.storeName, entity);
  }

  async delete(id: number): Promise<void> {
    return this.db.delete(this.storeName, id);
  }
}

export class TaskRepository extends BaseRepository<Task> {
  constructor(db: DatabaseService) { super(db, 'tasks'); }

  async getByDate(date: string): Promise<Task[]> {
    return this.db.getByIndex(this.storeName, 'scheduledDate', date);
  }
}

export class TimeSessionRepository extends BaseRepository<TimeSession> {
  constructor(db: DatabaseService) { super(db, 'time_sessions'); }

  async getTodaySessions(): Promise<TimeSession[]> {
    return this.getSessionsByDate(new Date());
  }

  async getSessionsByDate(date: Date | string): Promise<TimeSession[]> {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    const range = IDBKeyRange.bound(start, end);
    return this.db.getByRange(this.storeName, 'startTime', range);
  }
}

export class HabitRepository extends BaseRepository<Habit> {
  constructor(db: DatabaseService) { super(db, 'habits'); }
}

export class NoteRepository extends BaseRepository<Note> {
  constructor(db: DatabaseService) { super(db, 'notes'); }

  async getDailyNote(dateStr: string): Promise<Note | undefined> {
    const all = await this.getAll();
    return all.find(n => n.type === 'daily' && n.date === dateStr);
  }

  async getRecent(limit: number): Promise<Note[]> {
    const all = await this.getAll();
    return all
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  async getByIds(ids: number[]): Promise<Note[]> {
    if (!ids || ids.length === 0) return [];
    // IndexedDB doesn't have a batch get, so we do Promise.all
    const promises = ids.map(id => this.get(id));
    const results = await Promise.all(promises);
    return results.filter((n): n is Note => !!n);
  }
}

export class DayRepository extends BaseRepository<Day> {
  constructor(db: DatabaseService) { super(db, 'days'); }
  
  async getByDate(date: string): Promise<Day | undefined> {
    const results = await this.db.getByIndex<Day>(this.storeName, 'date', date);
    return results[0];
  }
}