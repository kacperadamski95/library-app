import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Sprawdzamy sygnał isLoggedIn z serwisu
  if (authService.isLoggedIn()) {
    return true; // Użytkownik jest zalogowany, może wejść na stronę
  }

  // Użytkownik nie jest zalogowany, przekierowujemy go do strony logowania
  return router.parseUrl('/login');
};