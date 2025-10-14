import {Component, computed, inject} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { AuthStore } from './store/auth/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <header>
      <h1>Moja Biblioteka</h1>
      <nav>
        @if (authStore.isLoggedIn()) {
          <p>Witaj, {{ username() }}!</p>
          <button (click)="logout()">Wyloguj</button>
        }
      </nav>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly authStore = inject(AuthStore);
  readonly username = computed(() => this.authStore.currentUser()?.username)

  logout() {
    this.authStore.logout()
  }
}
