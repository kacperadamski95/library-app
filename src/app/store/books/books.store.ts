import { computed, inject } from '@angular/core';
import {patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {map, pipe, switchMap, tap } from 'rxjs';
import { Book } from '../../core/models/book.model';
import {BookService} from '../../services/books.service'
import {tapResponse} from '@ngrx/operators';

type BooksState = {
  books: Book[];
  isLoading: boolean;
  error: string | null;
};

const initialState: BooksState = {
  books: [],
  isLoading: false,
  error: null,
};

export const BooksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    service: inject(BookService)
  })),
  withComputed(({ books }) => ({
    booksCount: computed(() => books().length),
  })),
  withMethods((store) => ({

    loadBooks: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => store.service.loadBooks().pipe(
          tapResponse({
            next: (books) => patchState(store, {books}),
            error: () => patchState(store, { error: 'Nie udało się załadować książek.' }),
            finalize: () => patchState(store, { isLoading: false })
          })
        )),
      )
    ),

    addBook: rxMethod<{bookData: Omit<Book, 'id' | 'borrowedByUserId'>}>(
      pipe(
        map(({bookData}) => ({...bookData, borrowedByUserId: null})),
        switchMap((newBook) => store.service.addBook(newBook).pipe(
          tapResponse({
            next: () => patchState(store, ({books}) => ({books: [...books, newBook as Book]})),
            error: () => patchState(store, {error: 'Nie udało się dodać książki.'})
          })
        ))
      )
    ),

    borrowBook: rxMethod<{bookId: string, userId: string}>(
      pipe(
        switchMap(({bookId, userId}) => store.service.borrowBook(bookId, userId).pipe(
          tapResponse({
            next: () => patchState(store, ({books}) => ({books: books.map(b => b.id === bookId ? {...b, borrowedByUserId: userId} : b)})),
            error: () => patchState(store, {error: 'Nie udało się wypożyczyć książki.'})
          })
        ))
      )
    ),

    returnBook: rxMethod<{bookId: string}>(
      pipe(
        switchMap(({bookId}) => store.service.returnBook(bookId).pipe(
          tapResponse({
            next: () => patchState(store, ({books}) => ({books: books.map(b => b.id === bookId ? {...b, borrowedByUserId: null} : b)})),
            error: () => patchState(store, {error: 'Nie udało się zwrócić książki'})
          })
        ))
      )
    ),
  })),
  withHooks({
    onInit({loadBooks}) {
      loadBooks()
    }
  })
);
