import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookListComponent } from '../book-list/book-list.component';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

import { BooksStore } from '../../../store/books/books.store';

@Component({
  selector: 'app-library',
  imports: [ReactiveFormsModule, BookListComponent, CommonModule],
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
<!--          Aktualizacja szablonu do bezpośredniego użycia sygnałów ze store-->
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
  // Wstrzykujemy nowy BooksStore zamiast starego Store
  store = inject(BooksStore);

  private authService = inject(AuthService);
  private fb = inject(NonNullableFormBuilder);

  newBookFormGroup = this.createFormGroup();

  ngOnInit(): void {
    this.init();
  }

  onAddBookSubmit(): void {
    const bookData = this.newBookFormGroup.getRawValue();

    // Zamiast dispatch(action), wywołujemy metodę na store
    this.store.addBook(bookData);

    this.newBookFormGroup.reset();
  }

  onBorrowBook(bookId: string): void {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.store.borrowBook(bookId, userId);
    }
  }

  onReturnBook(bookId: string): void {
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
    this.store.loadBooks();
  }

  private init(): void {
    this.loadBooks();
  }
}
