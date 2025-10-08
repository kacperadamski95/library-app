import {Component, inject, Signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink, UrlSegment} from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import {map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-auth',
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <h2>{{isLoginView() ? 'Logowanie' : 'Rejestracja'}} </h2>
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
          {{ isLoginView() ? 'Zaloguj' : 'Zarejestruj' }}
        </button>
      </form>
      <p>
        {{ isLoginView() ? 'Nie masz konta?' : 'Masz już konto?' }}
        <a [routerLink]="isLoginView() ? '/register' : '/login'">
          {{ isLoginView() ? 'Zarejestruj się' : 'Zaloguj się' }}
        </a>
      </p>
    </div>

  `,
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder)
  private route = inject(ActivatedRoute);


  isLoginView: Signal<boolean> = toSignal(
    this.route.url.pipe(map(segments => segments[0]?.path === 'login')),
    { initialValue: true }
  )

  errorMessage: string | null = null;

  authFormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  })

  async onSubmit() {
    this.errorMessage = null;
    if (this.authFormGroup.invalid) {
      return;
    }
    const { username, password } = this.authFormGroup.getRawValue();
    let success = false;

    try { if (this.isLoginView()) {
      // --- LOGIKA LOGOWANIA ---
      success = await this.authService.login(username, password);
      if (!success) {
        this.errorMessage = 'Nieprawidłowa nazwa użytkownika lub hasło.';
      }
    } else {
      // --- LOGIKA REJESTRACJI ---
      success = await this.authService.register(username, password);
      if (success) {
        // Automatyczne logowanie po udanej rejestracji
        await this.authService.login(username, password);
      } else {
        this.errorMessage = 'Użytkownik o tej nazwie już istnieje.';
      }
    }

    if (success) {
      this.router.navigate(['/library']);
    }
  } catch (error) {
      console.error('Wystąpił  błąd podczas uwierzytelniania.:', error);
      this.errorMessage = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }
}
