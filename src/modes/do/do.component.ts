import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../services/domain/task.service';
import { TimeService } from '../../services/domain/time.service';
import { Task, TimeSession } from '../../models/entities';

@Component({
  selector: 'app-do-shell',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="min-h-screen bg-white p-6 pb-32 animate-fade-in relative transition-all duration-500" 
         [class.bg-stone-100]="isFocusMode() && !isOverlayOpen()">
      
      <!-- FOCUS MODE OVERLAY (Zen Mode) -->
      @if (isFocusMode() && isOverlayOpen()) {
        <div class="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col animate-fade-in">
          
          <!-- Focus Header -->
          <div class="p-6 pt-12 flex justify-between items-start">
             <!-- Minimize Button -->
             <button (click)="minimizeOverlay()" class="text-stone-400 hover:text-stone-900 transition-colors p-2 flex items-center gap-2 group">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
               </svg>
               <span class="text-xs font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Minimize</span>
             </button>

             <div class="text-xs font-medium tracking-widest uppercase text-stone-400 pt-2">Focus Mode</div>
             
             <!-- Stop Button -->
             <button (click)="stopFocus()" class="text-red-300 hover:text-red-500 transition-colors p-2" title="Stop Session">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>

          <!-- Main Focus Content -->
          <div class="flex-1 flex flex-col items-center justify-center p-6 text-center">
            
            <!-- Timer Circle -->
            <div class="relative w-72 h-72 mb-12 rounded-full flex items-center justify-center shadow-sm bg-stone-50"
                 [style.background]="progressStyle()">
               <!-- Inner Circle (Mask) -->
               <div class="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                 <!-- Time -->
                 <div class="flex flex-col items-center">
                    <div class="text-7xl font-light text-stone-900 tabular-nums tracking-tighter">
                      {{ formattedTime() }}
                    </div>
                    @if (focusTask()?.timeEstimate) {
                      <div class="text-xs font-medium text-stone-400 uppercase tracking-widest mt-2">
                         / {{ focusTask()?.timeEstimate }} min
                      </div>
                    }
                 </div>
               </div>
            </div>

            <!-- Task Info -->
            <div class="mb-12 max-w-xs mx-auto">
              @if (focusTask()) {
                <p class="text-stone-400 text-xs font-bold uppercase tracking-widest mb-3">Currently Focusing On</p>
                <h2 class="text-2xl font-serif text-stone-900 leading-tight line-clamp-3">{{ focusTask()?.title }}</h2>
              } @else {
                 <h2 class="text-2xl font-serif text-stone-900">Free Focus Session</h2>
                 <p class="text-stone-400 text-sm mt-2">Stay in the flow</p>
              }
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-6">
               @if (timerStatus() === 'running') {
                  <button (click)="pauseTimer()" class="w-20 h-20 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
               } @else {
                  <button (click)="startTimer()" class="w-20 h-20 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                  </button>
               }
            </div>

          </div>
        </div>
      }

      <!-- DASHBOARD HEADER -->
      <!-- We blur this if the overlay is open, otherwise it stays sharp but interacts with focus mode -->
      <header class="mb-8 pt-8 flex flex-col gap-6 transition-all duration-300" 
              [class.blur-sm]="isFocusMode() && isOverlayOpen()">
        
        <div class="flex justify-between items-end">
          <div>
            <h1 class="text-3xl font-light text-stone-900 tracking-tight">Do.</h1>
            <p class="text-stone-500 text-sm mt-1">{{ today | date:'EEEE, MMM d' }}</p>
          </div>
          
          <div class="flex items-center gap-2">
            @if (isFocusMode()) {
              <!-- Active Session Controls -->
              <div class="flex bg-stone-900 text-white rounded-full p-1 shadow-lg animate-fade-in">
                <button (click)="expandOverlay()" class="px-4 py-1.5 rounded-full hover:bg-stone-800 text-sm font-medium flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {{ formattedTime() }}
                </button>
                <div class="w-px bg-stone-700 my-1"></div>
                <button (click)="stopFocus()" class="px-3 py-1.5 hover:text-red-300 transition-colors" title="Stop">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                   </svg>
                </button>
              </div>
            } @else {
              <!-- Start Button -->
              <button 
                (click)="startFocus(undefined, $event)"
                class="bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-stone-800 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
                Focus
              </button>
            }
          </div>
        </div>

        <!-- View Toggle -->
        <div class="self-start flex bg-stone-100 p-1 rounded-lg">
          <button 
            (click)="viewMode.set('tasks')"
            class="px-3 py-1 text-xs font-medium rounded-md transition-all"
            [class.bg-white]="viewMode() === 'tasks'"
            [class.shadow-sm]="viewMode() === 'tasks'"
            [class.text-stone-900]="viewMode() === 'tasks'"
            [class.text-stone-500]="viewMode() !== 'tasks'">
            All Tasks
          </button>
          <button 
            (click)="viewMode.set('priority')"
            class="px-3 py-1 text-xs font-medium rounded-md transition-all"
            [class.bg-white]="viewMode() === 'priority'"
            [class.shadow-sm]="viewMode() === 'priority'"
            [class.text-stone-900]="viewMode() === 'priority'"
            [class.text-stone-500]="viewMode() !== 'priority'">
            Priority
          </button>
          <button 
            (click)="viewMode.set('log')"
            class="px-3 py-1 text-xs font-medium rounded-md transition-all"
            [class.bg-white]="viewMode() === 'log'"
            [class.shadow-sm]="viewMode() === 'log'"
            [class.text-stone-900]="viewMode() === 'log'"
            [class.text-stone-500]="viewMode() !== 'log'">
            Log
          </button>
        </div>
      </header>

      @if (viewMode() === 'tasks') {
        <!-- TASK LIST -->
        <!-- When overlay is open, blur the list. When closed (but focus active), don't blur list, but use item styles -->
        <div class="space-y-3 mb-24 animate-fade-in transition-all duration-300"
             [class.blur-sm]="isFocusMode() && isOverlayOpen()">
          @for (task of tasks(); track task.id) {
            <ng-container *ngTemplateOutlet="taskItem; context: { $implicit: task }"></ng-container>
          } @empty {
            <div class="text-center py-12">
              <p class="text-stone-400 text-sm">No tasks for today. Enjoy the calm.</p>
            </div>
          }
        </div>
      } 
      
      @if (viewMode() === 'priority') {
        <!-- PRIORITY LIST -->
        <div class="space-y-8 mb-24 animate-fade-in transition-all duration-300"
             [class.blur-sm]="isFocusMode() && isOverlayOpen()">
            @for (group of priorityGroups(); track group.label) {
              <section>
                <div class="flex items-center gap-2 mb-3">
                  <div [class]="'w-2 h-2 rounded-full ' + group.color"></div>
                  <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest">{{ group.label }}</h3>
                  <span class="text-xs text-stone-300">{{ group.list.length }}</span>
                </div>
                
                <div class="space-y-3">
                  @for (task of group.list; track task.id) {
                    <ng-container *ngTemplateOutlet="taskItem; context: { $implicit: task }"></ng-container>
                  }
                </div>
              </section>
            } @empty {
              <div class="text-center py-12">
                  <p class="text-stone-400 text-sm">No tasks found.</p>
              </div>
            }
        </div>
      }

      @if (viewMode() === 'log') {
        <!-- LOG VIEW -->
        <div class="space-y-4 mb-24 animate-fade-in" [class.blur-sm]="isFocusMode() && isOverlayOpen()">
            @for (session of recentSessions(); track session.id) {
              <div class="bg-white border border-stone-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div class="text-sm font-medium text-stone-900">
                    {{ getTaskTitle(session.taskId) }}
                  </div>
                  <div class="text-xs text-stone-400 mt-1">
                    {{ session.startTime | date:'shortTime' }}
                  </div>
                </div>
                <div class="text-sm font-mono text-stone-600 font-medium">
                  {{ session.durationSeconds / 60 | number:'1.0-0' }}m
                </div>
              </div>
            } @empty {
              <div class="text-center py-12">
                <p class="text-stone-400 text-sm">No focus sessions recorded yet.</p>
              </div>
            }
        </div>
      }

      <!-- FAB -->
      <button 
        (click)="openAddTask($event)"
        class="fixed bottom-24 right-6 w-14 h-14 bg-stone-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-stone-800 hover:scale-105 transition-all z-20"
        [class.hidden]="isFocusMode()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <!-- DETAILS MODAL (Read-Only) -->
      @if (viewDetailsTask()) {
        <div class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-stone-900/20 backdrop-blur-sm animate-fade-in"
             (click)="closeDetails()">
          
          <div class="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up flex flex-col max-h-[85vh]"
               (click)="$event.stopPropagation()">
            
            <!-- Details Header -->
            <div class="p-6 pb-4 border-b border-stone-100 flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-serif text-stone-900 leading-tight">{{ viewDetailsTask()?.title }}</h2>
                <div class="text-xs text-stone-400 mt-1 uppercase tracking-wide">Task Details</div>
              </div>
              <button (click)="closeDetails()" class="text-stone-400 hover:text-stone-900 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-6 overflow-y-auto">
              <!-- Stats Grid -->
              <div class="grid grid-cols-3 gap-4 mb-8">
                <div class="bg-stone-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                   <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Priority</span>
                   <span class="text-sm font-medium capitalize" 
                        [class.text-amber-600]="viewDetailsTask()?.priority === 'high'"
                        [class.text-stone-700]="viewDetailsTask()?.priority !== 'high'">
                     {{ viewDetailsTask()?.priority }}
                   </span>
                </div>
                <div class="bg-stone-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                   <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Energy</span>
                   <span class="text-sm font-medium capitalize text-stone-700">
                     {{ viewDetailsTask()?.energy }}
                   </span>
                </div>
                <div class="bg-stone-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                   <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Est. Time</span>
                   <span class="text-sm font-medium text-stone-700">
                     {{ viewDetailsTask()?.timeEstimate }}m
                   </span>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-8">
                <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Description</h3>
                <p class="text-stone-600 leading-relaxed text-sm whitespace-pre-wrap">
                  {{ viewDetailsTask()?.description || 'No additional details.' }}
                </p>
              </div>

              <!-- Focus History -->
              <div>
                 <h3 class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                   <span>History</span>
                   <span class="text-stone-300 font-normal">{{ viewDetailsSessions().length }} sessions</span>
                 </h3>
                 
                 <div class="space-y-2">
                   @for (session of viewDetailsSessions(); track session.id) {
                     <div class="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                       <span class="text-sm text-stone-500">{{ session.startTime | date:'MMM d, h:mm a' }}</span>
                       <span class="text-sm font-mono text-stone-800 font-medium">{{ session.durationSeconds / 60 | number:'1.0-0' }}m</span>
                     </div>
                   } @empty {
                     <p class="text-sm text-stone-300 italic">No focus sessions recorded yet.</p>
                   }
                 </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="p-6 border-t border-stone-100 flex gap-4">
              <button 
                (click)="editTask(viewDetailsTask()!)"
                class="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors">
                Edit
              </button>
              <button 
                (click)="startFocus(viewDetailsTask()!)"
                class="flex-1 py-3 px-4 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 shadow-lg shadow-stone-900/10 transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
                Focus Now
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ADD/EDIT MODAL -->
      @if (isEditing()) {
        <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-stone-900/20 backdrop-blur-sm animate-fade-in"
             (click)="onBackdropClick($event)">
          
          <div class="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up"
               (click)="$event.stopPropagation()">
            
            <h2 class="text-lg font-medium text-stone-900 mb-6">
              {{ editingTask() ? 'Edit Task' : 'New Task' }}
            </h2>

            <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
              <div class="space-y-4">
                
                <!-- Title -->
                <div>
                  <input 
                    type="text" 
                    formControlName="title"
                    placeholder="What needs doing?"
                    class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900 placeholder-stone-400"
                    autofocus
                  >
                </div>

                <!-- Description -->
                <div>
                  <textarea 
                    formControlName="description"
                    placeholder="Add details (optional)..."
                    rows="2"
                    class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-stone-400 text-sm text-stone-900 placeholder-stone-400 resize-none"
                  ></textarea>
                </div>

                <!-- Priority & Energy Grid -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Priority -->
                  <div>
                    <label class="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Priority</label>
                    <div class="flex bg-stone-50 rounded-lg p-1">
                      @for (p of ['low', 'medium', 'high']; track p) {
                        <button 
                          type="button"
                          (click)="setPriority(p)"
                          class="flex-1 text-xs font-medium py-2 rounded-md capitalize transition-all"
                          [class.bg-white]="taskForm.get('priority')?.value === p"
                          [class.shadow-sm]="taskForm.get('priority')?.value === p"
                          [class.text-stone-900]="taskForm.get('priority')?.value === p"
                          [class.text-stone-400]="taskForm.get('priority')?.value !== p">
                          {{ p }}
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Energy -->
                  <div>
                    <label class="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Energy</label>
                    <div class="flex bg-stone-50 rounded-lg p-1">
                      @for (e of ['low', 'medium', 'deep']; track e) {
                        <button 
                          type="button"
                          (click)="setEnergy(e)"
                          class="flex-1 text-xs font-medium py-2 rounded-md capitalize transition-all"
                          [class.bg-white]="taskForm.get('energy')?.value === e"
                          [class.shadow-sm]="taskForm.get('energy')?.value === e"
                          [class.text-stone-900]="taskForm.get('energy')?.value === e"
                          [class.text-stone-400]="taskForm.get('energy')?.value !== e">
                          {{ e }}
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <!-- Time Estimate -->
                <div>
                   <label class="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Est. Minutes</label>
                   <input 
                    type="number" 
                    formControlName="timeEstimate"
                    class="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-900"
                   >
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-between items-center mt-8 pt-4 border-t border-stone-100">
                <button 
                  type="button" 
                  (click)="cancelEdit()"
                  class="text-stone-500 font-medium hover:text-stone-800 px-4 py-2">
                  Cancel
                </button>
                
                <div class="flex gap-3">
                  @if (editingTask()) {
                    <button 
                      type="button"
                      (click)="deleteTask()" 
                      class="text-red-400 font-medium hover:text-red-600 px-4 py-2">
                      Delete
                    </button>
                  }
                  
                  <button 
                    type="submit"
                    [disabled]="taskForm.invalid"
                    class="bg-stone-900 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-stone-900/20 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ editingTask() ? 'Save' : 'Add Task' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- TEMPLATES -->
      <ng-template #taskItem let-task>
        <div 
          class="group relative bg-white border rounded-xl p-4 shadow-sm transition-all duration-300 flex items-start gap-4"
          [class.opacity-60]="task.isCompleted && celebratingTaskId() !== task.id"
          [class.bg-emerald-50]="(isFocusMode() && focusTask()?.id === task.id) || celebratingTaskId() === task.id"
          [class.border-emerald-200]="celebratingTaskId() === task.id"
          [class.border-emerald-300]="isFocusMode() && focusTask()?.id === task.id"
          [class.scale-105]="(isFocusMode() && focusTask()?.id === task.id) || celebratingTaskId() === task.id"
          [class.shadow-xl]="isFocusMode() && focusTask()?.id === task.id"
          [class.z-20]="isFocusMode() && focusTask()?.id === task.id"
          [class.border-stone-100]="(!isFocusMode() || focusTask()?.id !== task.id) && celebratingTaskId() !== task.id"
          [class.opacity-40]="isFocusMode() && focusTask()?.id !== task.id"
          [class.blur-[1px]]="isFocusMode() && focusTask()?.id !== task.id"
          [class.grayscale]="isFocusMode() && focusTask()?.id !== task.id"
          [class.hover:shadow-md]="!isFocusMode()"
          >
          
          <!-- Checkbox -->
          <button 
            (click)="toggleComplete(task, $event)"
            class="mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 shrink-0"
            [class.border-stone-300]="!task.isCompleted && celebratingTaskId() !== task.id"
            [class.border-emerald-500]="task.isCompleted || celebratingTaskId() === task.id"
            [class.bg-emerald-500]="task.isCompleted || celebratingTaskId() === task.id"
            [class.animate-pop]="celebratingTaskId() === task.id"
            [disabled]="isFocusMode() && focusTask()?.id !== task.id">
            @if (task.isCompleted || celebratingTaskId() === task.id) {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            }
          </button>

          <!-- Content -->
          <div class="flex-1 min-w-0 cursor-pointer" (click)="!isFocusMode() ? openDetails(task) : null">
            <h3 class="font-medium text-stone-900 truncate" [class.line-through]="task.isCompleted">{{ task.title }}</h3>
            
            <div class="flex items-center gap-3 mt-1.5">
              <!-- Priority Badge -->
              @if (task.priority === 'high') {
                <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider">High</span>
              }

              <!-- Energy -->
              <span class="text-[10px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                </svg>
                {{ task.energy }}
              </span>

              <!-- Time Estimate -->
              @if (task.timeEstimate) {
                <span class="text-[10px] text-stone-400 font-medium uppercase tracking-wider flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                  {{ task.timeEstimate }}m
                </span>
              }
              
               <!-- Focus Indicator -->
               @if (isFocusMode() && focusTask()?.id === task.id) {
                 <span class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse ml-auto">
                   <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                   Focusing
                 </span>
               }
            </div>
          </div>

          <!-- Start Focus Button (On hover/active) -->
          @if (!task.isCompleted && !isFocusMode()) {
            <button 
              (click)="startFocus(task, $event)"
              class="p-2 text-stone-300 hover:text-emerald-600 active:text-emerald-700 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              title="Start Focus Session">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
            </button>
          }
        </div>
      </ng-template>

    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    @keyframes pop { 
      0% { transform: scale(0.8); } 
      40% { transform: scale(1.4); } 
      100% { transform: scale(1); } 
    }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoShellComponent implements OnInit, OnDestroy {
  taskService = inject(TaskService);
  timeService = inject(TimeService);
  fb = inject(FormBuilder);

  today = new Date();
  todayStr = this.formatDate(this.today);

  // UI State
  viewMode = signal<'tasks' | 'priority' | 'log'>('tasks');
  isEditing = signal(false);
  editingTask = signal<Task | null>(null);
  
  // Details View State
  viewDetailsTask = signal<Task | null>(null);
  viewDetailsSessions = signal<TimeSession[]>([]);
  
  // Focus Mode State
  isFocusMode = signal(false);
  isOverlayOpen = signal(false); // Controls if the Zen/Full screen overlay is visible
  focusTask = signal<Task | null>(null);
  timerStatus = signal<'idle' | 'running' | 'paused'>('idle');
  elapsedSeconds = signal(0);
  timerInterval: any;

  // Animation State
  celebratingTaskId = signal<number | null>(null);

  // Data State
  tasks = signal<Task[]>([]);
  recentSessions = signal<TimeSession[]>([]);

  taskForm: FormGroup;

  // Computed Properties
  priorityGroups = computed(() => {
    const t = this.tasks();
    return [
      { label: 'High Priority', color: 'bg-amber-500', list: t.filter(x => x.priority === 'high') },
      { label: 'Medium Priority', color: 'bg-stone-400', list: t.filter(x => x.priority === 'medium') },
      { label: 'Low Priority', color: 'bg-stone-200', list: t.filter(x => x.priority === 'low') }
    ].filter(g => g.list.length > 0);
  });

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['medium'],
      energy: ['medium'],
      timeEstimate: [25]
    });

    effect(() => {
        this.loadTasks();
        this.loadSessions();
    });
  }

  ngOnInit() {
    this.loadTasks();
    this.loadSessions();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  // --- Formatting Helpers ---
  formatDate(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formattedTime = computed(() => {
    const s = this.elapsedSeconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  });

  progressStyle = computed(() => {
    const duration = (this.focusTask()?.timeEstimate || 25) * 60;
    const pct = (this.elapsedSeconds() / duration) * 100;
    const boundedPct = Math.min(pct, 100);
    return `conic-gradient(#1c1917 ${boundedPct}%, #f5f5f4 0)`;
  });

  // --- Data Loading ---
  async loadTasks() {
    const all = await this.taskService.getTasksForDate(this.todayStr);
    this.tasks.set(all);
  }

  async loadSessions() {
    const sessions = await this.timeService.getTodaySessions();
    this.recentSessions.set(sessions.reverse()); 
  }

  getTaskTitle(id?: number): string {
    if (!id) return 'Free Focus';
    const t = this.tasks().find(x => x.id === id);
    return t ? t.title : 'Unknown Task';
  }

  // --- Task CRUD ---
  openAddTask(e?: Event) {
    e?.stopPropagation(); 
    this.editingTask.set(null);
    this.taskForm.reset({
      priority: 'medium',
      energy: 'medium',
      timeEstimate: 25,
      description: ''
    });
    this.isEditing.set(true);
  }

  // This opens the read-only details view
  async openDetails(task: Task) {
    this.viewDetailsTask.set(task);
    if (task.id) {
       const sessions = await this.timeService.getSessionsForTask(task.id);
       this.viewDetailsSessions.set(sessions);
    } else {
       this.viewDetailsSessions.set([]);
    }
  }

  closeDetails() {
    this.viewDetailsTask.set(null);
    this.viewDetailsSessions.set([]);
  }

  // This opens the write-mode edit modal
  editTask(task: Task, e?: Event) {
    e?.stopPropagation();
    // Close details if open
    this.closeDetails();
    
    this.editingTask.set(task);
    this.taskForm.patchValue(task);
    this.isEditing.set(true);
  }

  onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editingTask.set(null);
  }

  setPriority(p: any) {
    this.taskForm.patchValue({ priority: p });
  }

  setEnergy(e: any) {
    this.taskForm.patchValue({ energy: e });
  }

  async saveTask() {
    if (this.taskForm.invalid) return;

    const val = this.taskForm.value;
    const current = this.editingTask();

    if (current && current.id) {
      // Update
      await this.taskService.updateTask({
        ...current,
        ...val
      });
    } else {
      // Create
      await this.taskService.addTask({
        ...val,
        isCompleted: false,
        scheduledDate: this.todayStr
      });
    }
    
    this.cancelEdit();
    await this.loadTasks();
  }

  async toggleComplete(task: Task, e: Event) {
    e.stopPropagation();
    
    // If completing (not un-completing), trigger animation first
    if (!task.isCompleted && task.id) {
        this.celebratingTaskId.set(task.id);
        
        // Delay actual update to show animation in place
        setTimeout(async () => {
            await this.taskService.toggleCompletion(task);
            await this.loadTasks();
            this.celebratingTaskId.set(null);
        }, 600);
    } else {
        await this.taskService.toggleCompletion(task);
        await this.loadTasks();
    }
  }

  async deleteTask() {
    const current = this.editingTask();
    if (current?.id) {
      if (confirm('Delete this task?')) {
        await this.taskService.deleteTask(current.id);
        this.cancelEdit();
        await this.loadTasks();
      }
    }
  }

  // --- Focus Mode Logic ---
  startFocus(task?: Task, e?: Event) {
    e?.stopPropagation();
    // Close Details if open
    this.closeDetails();

    this.focusTask.set(task || null);
    this.isFocusMode.set(true);
    this.isOverlayOpen.set(true); // Open Zen Mode by default
    this.startTimer();
  }

  stopFocus() {
    this.pauseTimer();
    this.timeService.recordSession(this.focusTask()?.id, this.elapsedSeconds())
        .then(() => this.loadSessions());
        
    this.isFocusMode.set(false);
    this.isOverlayOpen.set(false);
    this.elapsedSeconds.set(0);
    this.timerStatus.set('idle');
  }

  minimizeOverlay() {
    this.isOverlayOpen.set(false);
  }

  expandOverlay() {
    this.isOverlayOpen.set(true);
  }

  startTimer() {
    if (this.timerStatus() === 'running') return;
    this.timerStatus.set('running');
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(v => v + 1);
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.timerInterval);
    this.timerStatus.set('paused');
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }
}