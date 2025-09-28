import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BooksState } from './books.state';

// Selektor na cały "feature state" książek
export const selectBooksState = createFeatureSelector<BooksState>('books');

// Selektory na poszczególne części stanu
export const selectAllBooks = createSelector(
  selectBooksState,
  (state) => state.books
);

export const selectBooksLoading = createSelector(
  selectBooksState,
  (state) => state.loading
);