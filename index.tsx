import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, Routes } from '@angular/router';
import { AppComponent } from './src/app.component';
import { DoShellComponent } from './src/modes/do/do.component';
import { LiveShellComponent } from './src/modes/live/live.component';
import { ThinkShellComponent } from './src/modes/think/think.component';

const routes: Routes = [
  { path: '', redirectTo: 'do', pathMatch: 'full' },
  { path: 'do', component: DoShellComponent },
  { path: 'live', component: LiveShellComponent },
  { path: 'think', component: ThinkShellComponent },
  { path: '**', redirectTo: 'do' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
