import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-mode-switcher',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-lg border border-stone-200 rounded-full px-2 py-2 flex items-center gap-1 z-50 transition-all duration-300 hover:shadow-xl">
      
      <!-- DO Mode -->
      <a routerLink="/do" 
         routerLinkActive="bg-stone-900 text-white shadow-sm" 
         class="px-6 py-2 rounded-full text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all duration-200 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        DO
      </a>

      <!-- LIVE Mode -->
      <a routerLink="/live" 
         routerLinkActive="bg-stone-900 text-white shadow-sm"
         class="px-6 py-2 rounded-full text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all duration-200 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
        LIVE
      </a>

      <!-- THINK Mode -->
      <a routerLink="/think" 
         routerLinkActive="bg-stone-900 text-white shadow-sm"
         class="px-6 py-2 rounded-full text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all duration-200 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
        THINK
      </a>

    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModeSwitcherComponent {}