import {Component, computed, inject} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  // standalone: true,
  // w wersji v20 standalone jest domyślnie ustawiony na true
  imports: [RouterOutlet],
  // male templatki mozna implementowac bezposrednio w komponencie (według własnych upodobań ;) )
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
  //templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // Używamy 'public', aby mieć dostęp do serwisu bezpośrednio w szablonie

  // inject lepiej zeby byly private i nie uzywac bezposrednio serwisow w template
  // jak cos jest public nie musimy tego pisać, ponieważ domyślnie jest ustawiona na public
  //public authService = inject(AuthService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // zamiast bezposrednio uzywac serwisu w template, przypisac wartosc do zmiennej w komponencie
  isLoggedIn = this.authService.isLoggedIn;
  username = computed(() => this.authService.currentUser()?.username)

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
