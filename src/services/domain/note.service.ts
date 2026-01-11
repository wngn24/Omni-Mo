import { Injectable, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { Note } from '../../models/entities';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private storage = inject(StorageService);

  async getAllNotes(): Promise<Note[]> {
    return this.storage.notes.getAll();
  }

  async getRecentNotes(limit: number): Promise<Note[]> {
    return this.storage.notes.getRecent(limit);
  }

  async getDailyNote(dateStr: string): Promise<Note | undefined> {
    return this.storage.notes.getDailyNote(dateStr);
  }

  async getNotesByIds(ids: number[]): Promise<Note[]> {
    return this.storage.notes.getByIds(ids);
  }

  async saveNote(note: Partial<Note>): Promise<number | void> {
    // Validation Rule: Don't save empty general notes
    if (note.type === 'general' && !note.title?.trim() && !note.content?.trim()) {
      return;
    }

    const noteToSave = { ...note } as Note;

    if (noteToSave.id) {
      await this.storage.notes.update(noteToSave);
      return noteToSave.id;
    } else {
      // Rule: Default title
      if (!noteToSave.title?.trim()) {
        noteToSave.title = 'Untitled Note';
      }
      return await this.storage.notes.add(noteToSave);
    }
  }

  async deleteNote(id: number): Promise<void> {
    await this.storage.notes.delete(id);
  }
}