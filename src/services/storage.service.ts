import { Injectable, inject } from '@angular/core';
import { DatabaseService } from './database.service';
import { TaskRepository, TimeSessionRepository, HabitRepository, NoteRepository, DayRepository } from './repositories';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private db = inject(DatabaseService);

  readonly tasks = new TaskRepository(this.db);
  readonly sessions = new TimeSessionRepository(this.db);
  readonly habits = new HabitRepository(this.db);
  readonly notes = new NoteRepository(this.db);
  readonly days = new DayRepository(this.db);

  // Expose the ready signal from the underlying DB connection
  get isReady() {
    return this.db.isReady;
  }
}