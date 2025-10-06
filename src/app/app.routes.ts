import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    // Używamy dynamicznego importu do leniwego ładowania komponentu
    loadComponent: () => import('./features/auth-pages/auth/auth.component').then(c => c.AuthComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth-pages/auth/auth.component').then(c => c.AuthComponent),
  },
  {
    path: 'library',
    loadComponent: () => import('./features/library/library/library.component').then(c => c.LibraryComponent),
    canActivate: [authGuard], // Tutaj dodajemy naszego strażnika!
  },
  // Domyślne przekierowanie
  {
    path: '',
    redirectTo: '/library',
    pathMatch: 'full'
  },
  // Przekierowanie "dzikich" ścieżek
  {
    path: '**',
    redirectTo: '/library'
  }
];
