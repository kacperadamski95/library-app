import {Component, computed, inject} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AuthStore } from './core/store/auth/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <header>
      <h1>Moja Biblioteka</h1>

      <nav>
        @if (authStore.isLoggedIn()) {
          <p>Witaj, {{ authStore.username() }}!</p>
          <button (click)="logout()">Wyloguj</button>
        }
      </nav>
    </header>

    <main>
      <router-outlet />
    </main>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected readonly authStore = inject(AuthStore);

  logout() {
    this.authStore.logout()
  }
}
