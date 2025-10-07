// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { BooksStore } from './store/books/books.store'
import {provideHttpClient} from '@angular/common/http';

import { provideSignalStore } from '@ngrx/signals'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideSignalStore(BooksStore)
  ],
};
