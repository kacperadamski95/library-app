// src/app/app.config.ts

import { ApplicationConfig, isDevMode } from '@angular/core'; // Dodajmy isDevMode
import { provideRouter } from '@angular/router';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
// import { provideStoreDevtools } from '@ngrx/store-devtools'; // Dodajmy to!

import { routes } from './app.routes';
import { booksReducer } from './store/books/books.reducer';
import { BooksEffects } from './store/books/books.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Konfiguracja NgRx
    provideStore(), // Inicjalizuje Store
    provideState({ name: 'books', reducer: booksReducer }), // Rejestruje nasz "feature state"
    provideEffects([BooksEffects]), // Używamy standardowego dostawcy
  ],
};
