import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../services/domain/note.service';
import { Note } from '../../models/entities';

@Component({
  selector: 'app-think-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="min-h-screen bg-[#FDFCF8] p-6 pb-24 animate-fade-in relative">
      
      @if (viewMode() === 'list') {
        <!-- LIST VIEW -->
        <header class="mb-8 pt-8 flex justify-between items-end">
          <div>
            <h1 class="text-3xl font-light text-stone-900 tracking-tight serif">Think.</h1>
            <p class="text-stone-500 text-sm mt-1">Notes & Knowledge</p>
          </div>
        </header>

        <!-- Search -->
        <div class="mb-6 relative">
          <input 
            type="text" 
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search notes..." 
            class="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-1 focus:ring-stone-300 transition-all placeholder-stone-400"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-3.5 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="columns-2 md:columns-3 gap-4 space-y-4">
          
          <!-- Daily Note CTA (Only if not searching) -->
          @if (!searchQuery()) {
            <div (click)="openDailyNote()" 
                 class="break-inside-avoid bg-stone-900 text-white p-5 rounded-xl shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-200 group">
              <div class="flex items-center gap-2 mb-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Daily Note</span>
              </div>
              <div class="font-serif text-xl font-light">
                {{ today | date:'MMMM d' }}
              </div>
              <div class="mt-2 text-stone-400 text-sm group-hover:text-white transition-colors">
                Tap to capture today's thoughts
              </div>
            </div>
          }

          <!-- Note Cards -->
          @for (note of filteredNotes(); track note.id) {
            <div (click)="openNote(note)" 
                 class="break-inside-avoid bg-white p-5 rounded-xl shadow-sm border border-stone-100 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-stone-200">
              
              <!-- Tags -->
              @if (note.tags.length > 0) {
                <div class="flex flex-wrap gap-1 mb-3">
                  @for (tag of note.tags; track tag) {
                    <span class="text-[10px] uppercase font-bold text-stone-400 tracking-wide">#{{tag}}</span>
                  }
                </div>
              }

              <h3 class="font-medium text-stone-800 mb-2 leading-tight" [class.font-serif]="note.type === 'daily'">
                {{ note.title }}
              </h3>
              
              <p class="text-stone-500 text-sm line-clamp-4 font-mono leading-relaxed opacity-80">
                {{ note.content || 'Empty note...' }}
              </p>
              
              <div class="mt-4 text-[10px] text-stone-300">
                {{ note.updatedAt | date:'shortDate' }}
              </div>
            </div>
          }
        </div>

        <!-- Empty State -->
        @if (filteredNotes().length === 0 && searchQuery()) {
           <div class="text-center py-12 text-stone-400">
             No notes found for "{{ searchQuery() }}"
           </div>
        }

        <!-- FAB -->
        <button (click)="createNewNote()" 
                class="fixed bottom-24 right-6 w-14 h-14 bg-stone-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-stone-800 hover:scale-105 transition-all z-20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>

      } @else {
        <!-- EDITOR VIEW -->
        <div class="fixed inset-0 z-[100] bg-[#FDFCF8] flex flex-col animate-slide-up">
          
          <!-- Toolbar -->
          <div class="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-10">
            <button (click)="closeEditor()" class="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium">Back</span>
            </button>

            <div class="flex gap-4">
              <button (click)="deleteNote()" class="text-stone-400 hover:text-red-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content Area -->
          <div class="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full scroll-smooth">
            
            <!-- Metadata -->
            <div class="mb-6 space-y-4">
               @if (currentNote().type === 'daily') {
                 <div class="text-xs font-bold text-stone-400 uppercase tracking-widest">
                   Daily Note • {{ currentNote().date | date:'longDate' }}
                 </div>
               }
               
               <!-- Title Input -->
               <input 
                 type="text" 
                 [ngModel]="currentNote().title"
                 (ngModelChange)="updateCurrentNote('title', $event)"
                 placeholder="Note Title"
                 class="w-full bg-transparent text-3xl font-serif text-stone-900 placeholder-stone-300 border-none focus:outline-none focus:ring-0 p-0"
               >

               <!-- Tag Input -->
               <div class="flex items-center flex-wrap gap-2">
                 @for (tag of currentNote().tags; track tag) {
                   <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-600">
                     #{{ tag }}
                     <button (click)="removeTag(tag)" class="ml-1 text-stone-400 hover:text-red-500">×</button>
                   </span>
                 }
                 <input 
                   type="text" 
                   [ngModel]="tagInput()"
                   (ngModelChange)="tagInput.set($event)"
                   (keydown.enter)="addTag()"
                   (keydown.space)="addTag()"
                   placeholder="+ Add tag"
                   class="bg-transparent text-sm text-stone-500 placeholder-stone-300 focus:outline-none focus:text-stone-800 min-w-[80px]"
                 >
               </div>
            </div>

            <!-- Markdown/Text Editor -->
            <textarea
              [ngModel]="currentNote().content"
              (ngModelChange)="updateCurrentNote('content', $event)"
              placeholder="Start writing... Use [[Wiki Links]] to connect notes."
              class="w-full min-h-[40vh] resize-y bg-transparent text-lg leading-relaxed text-stone-800 placeholder-stone-300 font-mono focus:outline-none mb-12"
            ></textarea>

            <!-- Connections Panel -->
            <div class="mt-8 pt-8 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              
              <!-- Outgoing Links -->
              <div>
                <h4 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Mentions
                </h4>
                <div class="space-y-2">
                  @for (link of outgoingLinks(); track link) {
                    <button (click)="handleLinkClick(link)" 
                            class="block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border border-transparent"
                            [class.bg-emerald-50]="getNoteByTitle(link)"
                            [class.text-emerald-700]="getNoteByTitle(link)"
                            [class.border-emerald-100]="getNoteByTitle(link)"
                            [class.bg-stone-50]="!getNoteByTitle(link)"
                            [class.text-stone-400]="!getNoteByTitle(link)">
                      <span class="opacity-50">[[</span>
                      <span class="font-medium">{{ link }}</span>
                      <span class="opacity-50">]]</span>
                      @if (!getNoteByTitle(link)) {
                        <span class="text-[10px] ml-2 opacity-60">(create)</span>
                      }
                    </button>
                  } @empty {
                    <p class="text-sm text-stone-300 italic">No mentions in this note.</p>
                  }
                </div>
              </div>

              <!-- Backlinks -->
              <div>
                <h4 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Linked By
                </h4>
                <div class="space-y-2">
                  @for (note of backlinks(); track note.id) {
                    <div (click)="openNote(note)" class="cursor-pointer px-3 py-2 rounded-lg bg-white border border-stone-100 hover:border-emerald-200 hover:shadow-sm transition-all group">
                      <div class="text-sm font-medium text-stone-800 group-hover:text-emerald-900">{{ note.title }}</div>
                      <div class="text-xs text-stone-400 truncate mt-1 font-mono bg-stone-50 p-1 rounded">{{ getBacklinkContext(note) }}</div>
                    </div>
                  } @empty {
                    <p class="text-sm text-stone-300 italic">No notes link to this one.</p>
                  }
                </div>
              </div>
            </div>

          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .serif { font-family: 'Times New Roman', serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(100%); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThinkShellComponent implements OnInit {
  noteService = inject(NoteService);

  today = new Date();
  todayStr = this.formatDate(this.today);

  // View State
  viewMode = signal<'list' | 'editor'>('list');
  searchQuery = signal('');
  tagInput = signal('');

  // Data State
  notes = signal<Note[]>([]);
  
  // Editor State
  currentNote = signal<Partial<Note>>({
    title: '',
    content: '',
    tags: [],
    type: 'general'
  });

  filteredNotes = computed(() => {
    const q = this.searchQuery().toLowerCase();
    let all = this.notes();
    
    if (!q) {
      return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return all.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });

  // Connection Logic
  outgoingLinks = computed(() => {
    const content = this.currentNote().content || '';
    const regex = /\[\[(.*?)\]\]/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match[1].trim()) {
        matches.add(match[1].trim());
      }
    }
    return Array.from(matches);
  });

  backlinks = computed(() => {
    const currentTitle = this.currentNote().title?.trim();
    if (!currentTitle) return [];
    
    const searchStr = `[[${currentTitle}]]`.toLowerCase();
    
    return this.notes().filter(n => {
       if (n.id === this.currentNote().id) return false;
       return (n.content || '').toLowerCase().includes(searchStr);
    });
  });

  constructor() {
    effect(() => {
        this.loadNotes();
    });
  }

  ngOnInit() {
    this.loadNotes();
  }

  formatDate(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async loadNotes() {
    const all = await this.noteService.getAllNotes();
    this.notes.set(all);
  }

  getNoteByTitle(title: string) {
    return this.notes().find(n => n.title.toLowerCase() === title.toLowerCase());
  }

  getBacklinkContext(note: Note): string {
    const currentTitle = this.currentNote().title || '';
    if (!currentTitle) return '';
    
    const content = (note.content || '').toLowerCase();
    const searchStr = `[[${currentTitle.toLowerCase()}]]`;
    const idx = content.indexOf(searchStr);
    
    if (idx === -1) return '';
    
    // Extract snippet around the link
    const start = Math.max(0, idx - 20);
    const end = Math.min(note.content.length, idx + searchStr.length + 20);
    return '...' + note.content.substring(start, end) + '...';
  }

  async handleLinkClick(title: string) {
    await this.saveCurrentNote();
    
    const existing = this.getNoteByTitle(title);
    if (existing) {
      this.openNote(existing);
    } else {
      this.currentNote.set({
        title: title,
        content: '',
        tags: [],
        type: 'general'
      });
      // Ensure we are in editor (we are, but good for safety)
      this.viewMode.set('editor');
    }
    
    // Scroll to top of content area
    setTimeout(() => {
      document.querySelector('.overflow-y-auto')?.scrollTo(0,0);
    }, 50);
  }

  // --- Actions ---

  async openDailyNote() {
    const existing = await this.noteService.getDailyNote(this.todayStr);
    
    if (existing) {
      this.openNote(existing);
    } else {
      // Initialize new Daily Note
      this.currentNote.set({
        title: `Daily Note: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        content: '',
        tags: ['daily'],
        type: 'daily',
        date: this.todayStr
      });
      this.viewMode.set('editor');
    }
  }

  createNewNote() {
    this.currentNote.set({
      title: '',
      content: '',
      tags: [],
      type: 'general'
    });
    this.viewMode.set('editor');
  }

  openNote(note: Note) {
    // Clone to avoid mutation of list object directly before save
    this.currentNote.set({ ...note });
    this.viewMode.set('editor');
  }

  closeEditor() {
    this.saveCurrentNote();
    this.viewMode.set('list');
    this.tagInput.set('');
  }

  updateCurrentNote(field: keyof Note, value: any) {
    this.currentNote.update(n => ({ ...n, [field]: value }));
  }

  addTag() {
    const tag = this.tagInput().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && !this.currentNote().tags?.includes(tag)) {
      this.currentNote.update(n => ({ ...n, tags: [...(n.tags || []), tag] }));
    }
    this.tagInput.set('');
  }

  removeTag(tag: string) {
    this.currentNote.update(n => ({ ...n, tags: n.tags?.filter(t => t !== tag) || [] }));
  }

  async saveCurrentNote() {
    const note = this.currentNote();
    const id = await this.noteService.saveNote(note);
    if (id && typeof id === 'number') {
        this.currentNote.update(n => ({ ...n, id }));
    }
    await this.loadNotes();
  }

  async deleteNote() {
    const note = this.currentNote();
    if (!note.id) {
      this.viewMode.set('list');
      return;
    }

    if (confirm('Delete this note?')) {
      await this.noteService.deleteNote(note.id);
      await this.loadNotes();
      this.viewMode.set('list');
    }
  }
}