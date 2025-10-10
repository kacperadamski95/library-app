import { computed, inject } from '@angular/core';
import {patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {map, pipe, switchMap, tap} from 'rxjs';
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
    // TODO: przerobiony store
    // Nie łączymy ngrx signals z Promisami, mamy od tego rxMethod

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


// import { computed, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
// import { rxMethod } from '@ngrx/signals/rxjs-interop';
// import { pipe, switchMap, tap } from 'rxjs';
//
// import { Book } from '../../core/models/book.model';
//
// // Definiuje kształt naszego stanu
// type BooksState = {
//   books: Book[];
//   loading: boolean;
//   error: string | null;
// };
//
// // Definiuje stan początkowy
// const initialState: BooksState = {
//   books: [],
//   loading: false,
//   error: null,
// };
//
// const API_URL = 'http://localhost:3000/books';
//
// // Tworzymy nasz SignalStore
// export const BooksStore = signalStore(
//   { providedIn: 'root' },
//
//   // KROK 1: Definiuje stan (zastępuje books.state.ts i część reducera)
//   withState(initialState),
//
//   // KROK 2: Definiuje wartości obliczone (zastępuje books.selectors.ts)
//   withComputed(({ books }) => ({
//     booksCount: computed(() => books().length),
//   })),
//
//   // KROK 3: Definiuje metody modyfikujące stan (komponenty będą mogły je wywoływać) i komunikujące się z API (zastępuje Actions, Effects i część reducera)
//   withMethods((store, http = inject(HttpClient)) => ({
//
//     // Metoda do ładowania książek (zastępuje loadBooks Effect)
//     loadBooks: rxMethod<void>(
//       pipe(
//         // tap przepuszcza wartość dalej wykonująć podaną funkcję, następnie emituje tę samoą wartośc, która do niego dotarła
//         tap(() => patchState(store, { loading: true })),
//         // Kiedy strumień źródłowy wyemituje nową wartość, switchMap subskrybuje nową obserwowalną wygenerowaną z tej wartości i,
//         // co kluczowe, anuluje subskrypcję poprzedniej, wewnętrznej obserwowalnej
//         switchMap(() => {
//           return http.get<Book[]>(API_URL).pipe(
//             tap({
//               next: (books) => patchState(store, { books }),
//               error: (err) => patchState(store, { error: 'Nie udało się załadować książek.' }),
//               finalize: () => patchState(store, { loading: false })
//             })
//           );
//         })
//       )
//     ),
//
//     // Metoda do dodawania książki (zastępuje addBook Effect)
//     async addBook(bookData: Omit<Book, 'id' | 'borrowedByUserId'>): Promise<void> {
//       patchState(store, { loading: true });
//       const newBook: Omit<Book, 'id'> = {
//         ...bookData,
//         borrowedByUserId: null
//       };
//
//       try {
//         const addedBook = await http.post<Book>(API_URL, newBook).toPromise();
//         patchState(store, (state) => ({
//           books: [...state.books, addedBook!],
//         }));
//       } catch (e) {
//         patchState(store, { error: 'Nie udało się dodać książki.' });
//       } finally {
//         patchState(store, { loading: false });
//       }
//     },
//
//     // Metoda do wypożyczania książki (zastępuje borrowBook Effect)
//     async borrowBook(bookId: string, userId: string): Promise<void> {
//       const updatedData = { borrowedByUserId: userId };
//       try {
//         const updatedBook = await http.patch<Book>(`${API_URL}/${bookId}`, updatedData).toPromise();
//         patchState(store, (state) => ({
//           books: state.books.map(b => b.id === bookId ? updatedBook! : b)
//         }));
//       } catch (e) {
//         patchState(store, { error: 'Nie udało się wypożyczyć książki.' });
//       }
//     },
//
//     // Metoda do zwracania książki (zastępuje returnBook Effect)
//     async returnBook(bookId: string): Promise<void> {
//       const updatedData = { borrowedByUserId: null };
//       try {
//         const updatedBook = await http.patch<Book>(`${API_URL}/${bookId}`, updatedData).toPromise();
//         patchState(store, (state) => ({
//           books: state.books.map(b => b.id === bookId ? updatedBook! : b)
//         }));
//       } catch (e) {
//         patchState(store, { error: 'Nie udało się zwrócić ksiązki' });
//       }
//     }
//   }))
// );
