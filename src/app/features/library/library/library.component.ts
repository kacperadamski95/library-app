// import { Component, OnInit, inject } from '@angular/core';
// import {FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
// import { BookListComponent } from '../book-list/book-list.component';
// import { CommonModule } from '@angular/common';
//
// import { AuthService } from '../../../core/auth/auth.service';
// import { BooksStore } from '../../../store/books/books.store'
//
// @Component({
//   selector: 'app-library',
//   standalone: true,
//   imports: [FormsModule, BookListComponent, CommonModule, ReactiveFormsModule],
//   template: `
//     <div class="library-container">
//       <section class="add-book-section">
//         <h3>Dodaj nową książkę</h3>
//         <form [formGroup]="newBookFormGroup" (ngSubmit)="onAddBookSubmit()">
//           <div class="form-grid">
//             <input type="text" formControlName="title" name="title" placeholder="Tytuł">
//             <input type="text" formControlName="author" name="author" placeholder="Autor">
//             <input type="text" formControlName="publicationDate" name="publicationDate" placeholder="Data wydania">
//             <input type="text" formControlName="shelfLocation" name="shelfLocation" placeholder="Lokalizacja na półce">
//           </div>
//           <button [disabled]="newBookFormGroup.invalid" type="submit">Dodaj książkę</button>
//         </form>
//       </section>
//
//       <section class="book-list-section">
//         <h3>Książki w bibliotece</h3>
//         @if (isLoading()) {
//           <p>Ładowanie książek...</p>
//         } @else {
//           <app-book-list
//             [booksSignal]="books()"
//             (borrowOutput)="onBorrowBook($event)"
//             (returnOutput)="onReturnBook($event)">
//           </app-book-list>
//         }
//       </section>
//     </div>
// `,
//   styleUrl: './library.component.css'
// })
// export class LibraryComponent implements OnInit {
//   private store = inject(Store);
//   private authService = inject(AuthService);
//   private  fb = inject(NonNullableFormBuilder);
//
//   // Pobieramy dane ze store za pomocą selektorów ($ - oznacza, że jest strumieniem danych)
//   // z ngrx można zaciągnąć selector typ signal: selectSignal() aby ograniczać operacje na Observable
//   books = this.store.selectSignal(selectAllBooks);
//   isLoading = this.store.selectSignal(selectBooksLoading);
//
//   newBookFormGroup = this.createFormGroup();
//
//   ngOnInit(): void {
//     // Przy inicjalizacji komponentu, wysyłamy akcję, aby załadować książki
//     // co do zasady lepiej nie implementować tutaj czystego kodu, a wywoływać metody
//     // czyli przenieść poniższy dispatch np do metody prywatnej init i ją tutaj wywołać
//     this.init();
//   }
//
//   onAddBookSubmit(): void {
//     const bookData = this.newBookFormGroup.getRawValue();
//
//     // Wysyłamy akcję dodania książki z danymi z formularza
//     this.store.dispatch(BooksActions.addBook({ bookData }));
//
//     // Resetujemy formularz
//     this.newBookFormGroup.reset();
//   }
//
//   onBorrowBook(bookId: string): void {
//     // pierdoła, ale dla lepszych praktyk można pisać rekurencyjnie
//
//     /*const currentUserId = this.authService.currentUser()?.id;
//     if (currentUserId) {
//       this.store.dispatch(BooksActions.borrowBook({ bookId, userId: currentUserId }));
//     }*/
//
//     const userId = this.authService.currentUser()?.id;
//     if (userId) {
//       this.store.dispatch(BooksActions.borrowBook({ bookId, userId }));
//     }
//   }
//
//   onReturnBook(bookId: string): void {
//     this.store.dispatch(BooksActions.returnBook({ bookId }));
//   }
//
//   private createFormGroup(): FormGroup<{
//     title: FormControl<string>,
//     author: FormControl<string>,
//     publicationDate: FormControl<string>,
//     shelfLocation: FormControl<string>,
//   }> {
//     return this.fb.group({
//       title: ['', Validators.required],
//       author: ['', Validators.required],
//       publicationDate: ['', Validators.required],
//       shelfLocation: ['', Validators.required]
//     })
//   }
//
//   private loadBooks(): void {
//     this.store.dispatch(BooksActions.loadBooks());
//   }
//
//   private init(): void {
//     this.loadBooks();
//   }
// }

import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookListComponent } from '../book-list/book-list.component';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

// KROK 1: Zmiana importów - usuwamy stary NgRx, dodajemy nowy BooksStore
import { BooksStore } from '../../../store/books/books.store';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [ReactiveFormsModule, BookListComponent, CommonModule],
  // Szablon jest teraz inline dla przejrzystości, ale możesz go zostawić w osobnym pliku
  template: `
    <div class="library-container">
      <section class="add-book-section">
        <h3>Dodaj nową książkę</h3>
        <form [formGroup]="newBookFormGroup" (ngSubmit)="onAddBookSubmit()">
          <div class="form-grid">
            <input type="text" formControlName="title" placeholder="Tytuł">
            <input type="text" formControlName="author" placeholder="Autor">
            <input type="text" formControlName="publicationDate" placeholder="Data wydania">
            <input type="text" formControlName="shelfLocation" placeholder="Lokalizacja na półce">
          </div>
          <button [disabled]="newBookFormGroup.invalid" type="submit">Dodaj książkę</button>
        </form>
      </section>

      <section class="book-list-section">
        <h3>Książki w bibliotece</h3>
        <!-- KROK 5: Aktualizacja szablonu do bezpośredniego użycia sygnałów ze store -->
        @if (store.loading()) {
          <p>Ładowanie książek...</p>
        } @else if (store.error()) {
          <p class="error-message">{{ store.error() }}</p>
        } @else {
          <app-book-list
            [booksSignal]="store.books()"
            (borrowOutput)="onBorrowBook($event)"
            (returnOutput)="onReturnBook($event)">
          </app-book-list>
        }
      </section>
    </div>
  `,
  styleUrl: './library.component.css'
})
export class LibraryComponent implements OnInit {
  // KROK 2: Wstrzykujemy nowy BooksStore zamiast starego Store
  // Ustawiamy go jako 'public', aby szablon miał do niego dostęp
  public store = inject(BooksStore);

  private authService = inject(AuthService);
  private fb = inject(NonNullableFormBuilder);

  // Formularz reaktywny pozostaje bez zmian - świetna robota!
  newBookFormGroup = this.createFormGroup();

  ngOnInit(): void {
    this.init();
  }

  onAddBookSubmit(): void {
    const bookData = this.newBookFormGroup.getRawValue();

    // KROK 3: Zamiast dispatch(action), wywołujemy metodę na store
    this.store.addBook(bookData);

    this.newBookFormGroup.reset();
  }

  onBorrowBook(bookId: string): void {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      // Wywołujemy metodę na store
      this.store.borrowBook(bookId, userId);
    }
  }

  onReturnBook(bookId: string): void {
    // Wywołujemy metodę na store
    this.store.returnBook(bookId);
  }

  // Metody prywatne pozostają, ale teraz wywołują metody ze store
  private createFormGroup(): FormGroup<{
    title: FormControl<string>;
    author: FormControl<string>;
    publicationDate: FormControl<string>;
    shelfLocation: FormControl<string>;
  }> {
    return this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      publicationDate: ['', Validators.required],
      shelfLocation: ['', Validators.required]
    });
  }

  private loadBooks(): void {
    // KROK 4: Zamiast dispatch(action), wywołujemy metodę na store
    this.store.loadBooks();
  }

  private init(): void {
    this.loadBooks();
  }
}
