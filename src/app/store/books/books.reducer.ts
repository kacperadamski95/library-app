import { createReducer, on } from '@ngrx/store';
import { BooksActions } from './books.actions';
import { initialBooksState } from './books.state';

export const booksReducer = createReducer(
  initialBooksState,
  on(BooksActions.loadBooks, (state) => ({ ...state, loading: true })),
  on(BooksActions.loadBooksSuccess, (state, { books }) => ({
    ...state,
    books,
    loading: false,
  })),
  on(BooksActions.addBookSuccess, (state, { book }) => ({
    ...state,
    books: [...state.books, book],
  })),
  on(BooksActions.borrowBookSuccess, BooksActions.returnBookSuccess, (state, { book }) => ({
    ...state,
    books: state.books.map((b) => (b.id === book.id ? book : b)),
  }))
);