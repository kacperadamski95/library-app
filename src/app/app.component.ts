import {Component, computed, inject} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <header>
      <h1>Moja Biblioteka</h1>
      <nav>
        @if (isLoggedIn()) {
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
  // inject lepiej zeby byly private i nie uzywac bezposrednio serwisow w template
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = this.authService.isLoggedIn;
  username = computed(() => this.authService.currentUser()?.username)

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
