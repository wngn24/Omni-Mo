import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Day } from '../models/entities';

@Injectable({
  providedIn: 'root'
})
export class DayService {
  private storage = inject(StorageService);
  
  // Request deduplication map
  private ensurePromises = new Map<string, Promise<Day>>();

  async ensureDay(dateStr: string): Promise<Day> {
    // Return existing promise if a request for this date is already in flight
    if (this.ensurePromises.has(dateStr)) {
        return this.ensurePromises.get(dateStr)!;
    }

    const promise = (async () => {
        try {
            // 1. Try to find existing
            const day = await this.storage.days.getByDate(dateStr);
            if (day) return day;
            
            // 2. Try to create
            try {
                const newId = await this.storage.days.add({ date: dateStr, pinnedNoteIds: [] });
                return (await this.storage.days.get(newId))!;
            } catch (err) {
                // 3. If create fails (likely uniqueness constraint race condition), try find again
                const retryDay = await this.storage.days.getByDate(dateStr);
                if (retryDay) return retryDay;
                throw err; // Real error
            }
        } finally {
            this.ensurePromises.delete(dateStr);
        }
    })();

    this.ensurePromises.set(dateStr, promise);
    return promise;
  }

  async updateDay(day: Day): Promise<void> {
    await this.storage.days.update(day);
  }
}