import {Component, OnInit, inject, OnDestroy} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink, UrlSegment} from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <h2>{{isLoginView ? 'Logowanie' : 'Rejestracja'}} </h2>
      <form [formGroup]="authFormGroup" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Nazwa użytkownika</label>
          <input id="username" type="text" formControlName="username" name="username">
        </div>
        <div class="form-group">
          <label for="password">Hasło</label>
          <input id="password" type="password" formControlName="password" name="password">
        </div>
        @if (errorMessage) {
          <p class="error-message">{{ errorMessage }}</p>
        }
        <button type="submit" [disabled]="authFormGroup.invalid">
          {{ isLoginView ? 'Zaloguj' : 'Zarejestruj' }}
        </button>
      </form>
      <p>
        {{ isLoginView ? 'Nie masz konta?' : 'Masz już konto?' }}
        <a [routerLink]="isLoginView ? '/register' : '/login'">
          {{ isLoginView ? 'Zarejestruj się' : 'Zaloguj się' }}
        </a>
      </p>
    </div>

  `,
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder)
  private route = inject(ActivatedRoute);
  // zmienna do przechowywania subskrypcji
  private routeSubscription!: Subscription;

  isLoginView = true;
  errorMessage: string | null = null;

  authFormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  })

  ngOnInit() {
    // wprowadzenie subskrypcji do śledzenia url
    this.routeSubscription = this.route.url.subscribe((urlSegments: UrlSegment[]) => {
      const currentUrl = urlSegments[0].path;
      this.isLoginView = currentUrl === 'login';
      // reset formularza i błędu przy przełączeniu widoku
      this.authFormGroup.reset();
      this.errorMessage = null;
    })
  }

  ngOnDestroy() {
    // kończymy subskrypcję gdy komponent jest niszczony
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  onSubmit() {
    this.errorMessage = null;
    if (this.authFormGroup.invalid) {
      return;
    }

    const { username, password } = this.authFormGroup.getRawValue();

    if (this.isLoginView) {
      // --- LOGIKA LOGOWANIA ---
      const success = this.authService.login(username, password);
      if (success) {
        this.router.navigate(['/library']);
      } else {
        this.errorMessage = 'Nieprawidłowa nazwa użytkownika lub hasło.';
      }
    } else {
      // --- LOGIKA REJESTRACJI ---
      const success = this.authService.register(username, password);
      if (success) {
        this.authService.login(username, password); // Automatyczne logowanie po rejestracji
        this.router.navigate(['/library']);
      } else {
        this.errorMessage = 'Użytkownik o tej nazwie już istnieje.';
      }
    }
  }
}
