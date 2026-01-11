import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModeSwitcherComponent } from './components/mode-switcher/mode-switcher.component';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModeSwitcherComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private storage = inject(StorageService);

  ngOnInit() {
    // Initial data layer check or global initialization can happen here
    console.log('App Initialized. Storage Layer Ready Signal:', this.storage.isReady());
  }
}