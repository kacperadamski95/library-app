import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { StorageService } from '../../core/storage/storage.service';
import { BooksActions } from './books.actions';
import { selectAllBooks } from './books.selectors';
import { Book } from '../../core/models/book.model';

@Injectable()
export class BooksEffects {
  private actions$ = inject(Actions);
  private storageService = inject(StorageService);
  private store = inject(Store);

  loadBooks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.loadBooks),
      // tapresponse do obsłużenia pobieranych danych z backendu jest zalecany - ngrx -
      switchMap(() => {
        const state = this.storageService.loadState();
        const books = state?.books || [];
        return [BooksActions.loadBooksSuccess({ books })];
      })
    )
  );

  saveBooks$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          BooksActions.addBookSuccess,
          BooksActions.borrowBookSuccess,
          BooksActions.returnBookSuccess
        ),
        withLatestFrom(this.store.select(selectAllBooks)),
        tap(([action, books]) => {
          const currentState = this.storageService.loadState() || {};
          this.storageService.saveState({ ...currentState, books });
        })
      ),
    { dispatch: false } // Ten efekt nie wysyła nowej akcji
  );

  addBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BooksActions.addBook),
      map(({ bookData }) => {
        const newBook: Book = {
          ...bookData,
          id: crypto.randomUUID(),
          borrowedByUserId: null
        };
        return BooksActions.addBookSuccess({ book: newBook });
      })
    )
  );

  borrowBook$ = createEffect(() =>
  this.actions$.pipe(
    ofType(BooksActions.borrowBook),
    withLatestFrom(this.store.select(selectAllBooks)),
    map(([{ bookId, userId }, books]) => {
      const bookToUpdate = books.find(b => b.id === bookId);
      if (bookToUpdate) {
        const updatedBook: Book = { ...bookToUpdate, borrowedByUserId: userId };
        return BooksActions.borrowBookSuccess({ book: updatedBook });
      }
      // W prawdziwej aplikacji obsłużylibyśmy błąd, np. nową akcją ...Failure
      return { type: '[Books] Borrow Book No-Op' };
    })
  )
);

returnBook$ = createEffect(() =>
  this.actions$.pipe(
    ofType(BooksActions.returnBook),
    withLatestFrom(this.store.select(selectAllBooks)),
    map(([{ bookId }, books]) => {
      const bookToUpdate = books.find(b => b.id === bookId);
      if (bookToUpdate) {
        const updatedBook: Book = { ...bookToUpdate, borrowedByUserId: null };
        return BooksActions.returnBookSuccess({ book: updatedBook });
      }
      return { type: '[Books] Return Book No-Op' };
    })
  )
);
}
