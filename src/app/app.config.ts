import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {provideHttpClient} from '@angular/common/http';

// import { BooksStore } from './store/books/books.store'
// import { provideSignalStore } from '@ngrx/signals'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // zakomentowałem, ponieważ nie istnieje pod taką nazwą, próbowałem to zaktualizować, ale pokazuje mi, że w ngrx/signals proviseSignalsStore nie istnieje
    // mam też export BooksStore provided in root w books.store.ts więc angular raczej wie jak to obsłużyć
    // provideSignalStore(BooksStore)
  ],
};
