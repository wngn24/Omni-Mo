import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DayService } from '../../services/day.service';
import { HabitService } from '../../services/domain/habit.service';
import { AiService } from '../../services/ai.service';
import { Day, PlanItem, Habit } from '../../models/entities';

@Component({
  selector: 'app-live-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="min-h-screen bg-stone-50 p-6 pb-32 animate-fade-in">
      
      <!-- Header -->
      <header class="mb-12 pt-8">
        <h1 class="text-3xl font-light text-emerald-950 tracking-tight">Live.</h1>
        <p class="text-emerald-800/60 text-sm mt-1">{{ today | date:'EEEE, MMM d' }}</p>
      </header>

      <!-- Morning Intention Section -->
      <section class="mb-16">
        <label class="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
          Daily Intention
        </label>
        
        <div class="relative group">
          @if (isEditingIntention() || !intention()) {
            <textarea
              [ngModel]="intention()"
              (ngModelChange)="intention.set($event)"
              (blur)="saveIntention()"
              (keydown.enter)="$event.preventDefault(); saveIntention()"
              placeholder="What is your main intention today?"
              class="w-full bg-transparent text-2xl md:text-3xl font-serif text-emerald-900 placeholder-emerald-900/20 border-b border-transparent focus:border-emerald-200 focus:outline-none resize-y overflow-auto transition-all min-h-[5rem]"
              rows="3"
              autofocus
            ></textarea>
          } @else {
            <div 
              (click)="isEditingIntention.set(true)" 
              class="text-2xl md:text-3xl font-serif text-emerald-900 cursor-pointer hover:opacity-80 transition-opacity leading-tight break-words whitespace-pre-wrap">
              "{{ intention() }}"
            </div>
            <div class="absolute -left-6 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          }
        </div>
      </section>

      <!-- AI Advice Section (New) -->
      @if (aiAdvice()) {
        <section class="mb-12 animate-fade-in">
          <div class="bg-gradient-to-br from-emerald-50 to-stone-100 border border-emerald-100/50 rounded-xl p-5 relative">
            <button (click)="aiAdvice.set('')" class="absolute top-3 right-3 text-emerald-900/20 hover:text-emerald-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div class="flex gap-3">
              <div class="shrink-0 pt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <p class="text-emerald-900 text-sm leading-relaxed font-medium opacity-90 italic">
                "{{ aiAdvice() }}"
              </p>
            </div>
          </div>
        </section>
      }

      <!-- Daily Plan Section -->
      <section class="mb-16">
        <div class="flex justify-between items-end mb-6">
          <label class="block text-xs font-bold text-stone-400 uppercase tracking-widest">
            Daily Plan
          </label>
          
          <div class="flex items-center gap-3">
             <!-- AI Trigger -->
             <button 
               (click)="askAi()"
               [disabled]="isThinking()"
               class="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1 disabled:opacity-50">
               @if(isThinking()) {
                 <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
               } @else {
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                  </svg>
               }
               {{ isThinking() ? 'Reflecting...' : 'Assistant' }}
             </button>

             <span class="text-xs font-medium" 
              [class.text-stone-400]="planItems().length < 5"
              [class.text-amber-500]="planItems().length >= 5">
              {{ planItems().length }}/5
            </span>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Existing Items -->
          @for (item of planItems(); track item.id) {
            <div class="group flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-stone-100 shadow-sm transition-all hover:shadow-md hover:border-emerald-100">
              
              <button 
                (click)="togglePlanItem(item)"
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                [class.border-stone-200]="!item.isCompleted"
                [class.border-emerald-500]="item.isCompleted"
                [class.bg-emerald-500]="item.isCompleted">
                @if (item.isCompleted) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                }
              </button>

              <span class="flex-1 text-stone-700 font-medium transition-all duration-300" 
                    [class.line-through]="item.isCompleted" 
                    [class.text-stone-400]="item.isCompleted">
                {{ item.text }}
              </span>

              <button 
                (click)="removePlanItem(item.id)"
                class="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }

          <!-- Add Input -->
          @if (planItems().length < 5) {
            <div class="relative">
              <input
                type="text"
                [ngModel]="newItemText()"
                (ngModelChange)="newItemText.set($event)"
                (keydown.enter)="addPlanItem()"
                placeholder="Add a highlight..."
                class="w-full bg-stone-100/50 border border-transparent text-stone-800 placeholder-stone-400 rounded-xl px-4 py-3 focus:bg-white focus:border-emerald-200 focus:outline-none transition-all"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <kbd class="hidden sm:inline-block px-2 py-0.5 text-[10px] font-sans text-stone-400 bg-stone-200 rounded">Enter</kbd>
                <button 
                  (click)="addPlanItem()"
                  [disabled]="!newItemText().trim()"
                  class="sm:hidden text-emerald-600 disabled:opacity-30 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          } @else {
            <p class="text-center text-xs text-stone-400 italic mt-4">
              Keep it simple. 5 items max to maintain flow.
            </p>
          }
        </div>
      </section>

      <!-- Habits Section -->
      <section>
        <div class="flex justify-between items-end mb-6">
          <label class="block text-xs font-bold text-stone-400 uppercase tracking-widest">
            Daily Rhythm
          </label>
          <button 
            (click)="isAddingHabit.set(!isAddingHabit())"
            class="text-emerald-700 hover:text-emerald-900 transition-colors p-1"
            title="Add Habit">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               @if (isAddingHabit()) {
                 <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
               } @else {
                 <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
               }
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <!-- Add Habit Form -->
          @if (isAddingHabit()) {
            <div class="mb-4 animate-fade-in space-y-2">
              <input 
                type="text" 
                [ngModel]="newHabitTitle()"
                (ngModelChange)="newHabitTitle.set($event)"
                placeholder="Name a new habit..."
                class="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                autofocus
              >
              <div class="flex gap-2">
                <select [ngModel]="newHabitRoutine()" (ngModelChange)="newHabitRoutine.set($event)" class="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 focus:outline-none focus:border-emerald-200">
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="anytime">Anytime</option>
                </select>
                <button (click)="addHabit()" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Add</button>
              </div>
            </div>
          }

          <!-- Group Habits by Routine -->
          @for (group of habitGroups(); track group.name) {
             @if (group.habits.length > 0) {
                <div class="mb-6 last:mb-0">
                  <h3 class="text-xs font-bold text-emerald-800/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                    {{ group.name }}
                    @if (group.allDone) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    }
                  </h3>
                  <div class="space-y-3">
                    @for (habit of group.habits; track habit.id) {
                      <div class="group relative bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                        
                        <!-- Habit Info & Grid -->
                        <div class="flex-1 min-w-0 pr-4">
                          <div class="flex justify-between items-start">
                             <h3 class="font-medium text-stone-800 truncate">{{ habit.title }}</h3>
                          </div>
                          
                          <!-- Weekly Overview (7 days) -->
                          <div class="flex gap-1.5 mt-2.5">
                            @for (date of pastWeek(); track date) {
                              <div 
                                class="w-2.5 h-2.5 rounded-full transition-colors duration-300"
                                [class.bg-emerald-400]="isHabitDone(habit, date)"
                                [class.bg-stone-200]="!isHabitDone(habit, date)"
                                [title]="date | date:'MMM d'">
                              </div>
                            }
                          </div>
                        </div>

                        <!-- Today Toggle -->
                        <button 
                          (click)="toggleHabitToday(habit)"
                          class="shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                          [class.border-stone-200]="!isHabitDone(habit, todayStr)"
                          [class.border-emerald-500]="isHabitDone(habit, todayStr)"
                          [class.bg-emerald-500]="isHabitDone(habit, todayStr)">
                           @if (isHabitDone(habit, todayStr)) {
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                           }
                        </button>

                        <!-- Delete (Hover) -->
                        <button 
                          (click)="deleteHabit(habit)"
                          class="absolute -top-2 -right-2 bg-stone-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 shadow-sm border border-stone-200"
                          title="Delete Habit">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                </div>
             }
          }
        </div>
      </section>

    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out;
    }
    .font-serif {
      font-family: 'Times New Roman', serif;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveShellComponent implements OnInit {
  dayService = inject(DayService);
  habitService = inject(HabitService);
  aiService = inject(AiService);
  
  today = new Date();
  todayStr = this.getTodayStr();
  
  currentDay = signal<Day | null>(null);
  
  // Intention State
  intention = signal('');
  isEditingIntention = signal(false);

  // Plan State
  planItems = signal<PlanItem[]>([]);
  newItemText = signal('');

  // AI State
  isThinking = signal(false);
  aiAdvice = signal('');

  // Habit State
  habits = signal<Habit[]>([]);
  isAddingHabit = signal(false);
  newHabitTitle = signal('');
  newHabitRoutine = signal<'morning' | 'evening' | 'anytime'>('anytime');

  // Computed
  pastWeek = computed(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(this.formatDate(d));
    }
    return dates;
  });

  habitGroups = computed(() => {
    const all = this.habits();
    const groups = [
      { name: 'Morning Rhythm', key: 'morning', habits: [] as Habit[], allDone: false },
      { name: 'Daily Habits', key: 'anytime', habits: [] as Habit[], allDone: false },
      { name: 'Evening Rhythm', key: 'evening', habits: [] as Habit[], allDone: false }
    ];

    all.forEach(h => {
      const g = groups.find(x => x.key === (h.routine || 'anytime'));
      if (g) g.habits.push(h);
    });

    // Check completion
    groups.forEach(g => {
       if (g.habits.length > 0) {
         g.allDone = g.habits.every(h => this.isHabitDone(h, this.todayStr));
       }
    });

    return groups.filter(g => g.habits.length > 0);
  });

  constructor() {
    effect(() => {
        this.loadDay();
        this.loadHabits();
    });
  }

  ngOnInit() {
    this.loadDay();
    this.loadHabits();
  }

  // --- Helpers ---

  getTodayStr() {
    return this.formatDate(new Date());
  }

  formatDate(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- AI Logic ---

  async askAi() {
    this.isThinking.set(true);
    this.aiAdvice.set('');
    try {
      const advice = await this.aiService.getDailyAssistantAdvice();
      this.aiAdvice.set(advice);
    } finally {
      this.isThinking.set(false);
    }
  }

  // --- Day/Plan/Intention Logic ---

  async loadDay() {
    try {
      const day = await this.dayService.ensureDay(this.todayStr);
      if (day) {
        this.currentDay.set(day);
        this.intention.set(day.intention || '');
        this.planItems.set(day.plan || []);
      }
    } catch (err) {
      console.error('Failed to load day', err);
    }
  }

  async saveIntention() {
    const text = this.intention().trim();
    if (!text && !this.currentDay()) {
        this.isEditingIntention.set(false);
        return;
    }
    await this.updateDay({ intention: text });
    this.isEditingIntention.set(false);
  }

  editIntention() {
    this.isEditingIntention.set(true);
  }

  async addPlanItem() {
    const text = this.newItemText().trim();
    if (!text) return;
    if (this.planItems().length >= 5) return;

    const newItem: PlanItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: text,
      isCompleted: false
    };

    const newPlan = [...this.planItems(), newItem];
    this.planItems.set(newPlan);
    this.newItemText.set('');
    
    await this.updateDay({ plan: newPlan });
  }

  async togglePlanItem(item: PlanItem) {
    const newPlan = this.planItems().map(i => 
      i.id === item.id ? { ...i, isCompleted: !i.isCompleted } : i
    );
    this.planItems.set(newPlan);
    await this.updateDay({ plan: newPlan });
  }

  async removePlanItem(id: string) {
    const newPlan = this.planItems().filter(i => i.id !== id);
    this.planItems.set(newPlan);
    await this.updateDay({ plan: newPlan });
  }

  async updateDay(changes: Partial<Day>) {
    const current = this.currentDay();
    if (current && current.id) {
      const updated: Day = { ...current, ...changes };
      await this.dayService.updateDay(updated);
      this.currentDay.set(updated);
    }
  }

  // --- Habit Logic ---

  async loadHabits() {
    const all = await this.habitService.getAllHabits();
    this.habits.set(all);
  }

  async addHabit() {
    const title = this.newHabitTitle().trim();
    if (!title) return;

    await this.habitService.addHabit(title, this.newHabitRoutine());
    this.newHabitTitle.set('');
    this.isAddingHabit.set(false);
    await this.loadHabits();
  }

  async deleteHabit(habit: Habit) {
    if (!habit.id) return;
    if (confirm(`Delete habit "${habit.title}"?`)) {
      await this.habitService.deleteHabit(habit.id);
      await this.loadHabits();
    }
  }

  isHabitDone(habit: Habit, dateStr: string): boolean {
    return habit.completedDates?.includes(dateStr) ?? false;
  }

  async toggleHabitToday(habit: Habit) {
    await this.habitService.toggleHabitForDate(habit, this.todayStr);
    await this.loadHabits();
  }
}