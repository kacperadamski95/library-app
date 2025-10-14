import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth-pages/auth/auth.component').then(c => c.AuthComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth-pages/auth/auth.component').then(c => c.AuthComponent),
  },
  {
    path: 'library',
    loadComponent: () => import('./features/library/library/library.component').then(c => c.LibraryComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/library',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/library'
  }
];
