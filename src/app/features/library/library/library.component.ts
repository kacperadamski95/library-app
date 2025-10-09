import { Component, inject } from '@angular/core';
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

        @if (isLoading()) {
          <p>Ładowanie książek...</p>
        } @else if (error()) {
          <p class="error-message">{{ error() }}</p>
        } @else {
          <app-book-list
            [booksSignal]="books()"
            (borrowOutput)="onBorrowBook($event)"
            (returnOutput)="onReturnBook($event)">
          </app-book-list>
        }
      </section>
    </div>
  `,
  styleUrl: './library.component.css'
})
export class LibraryComponent {
  private booksStore = inject(BooksStore);
  private authService = inject(AuthService);
  private fb = inject(NonNullableFormBuilder);

  books = this.booksStore.books;
  isLoading = this.booksStore.isLoading;
  error = this.booksStore.error;

  newBookFormGroup = this.createFormGroup();

  onAddBookSubmit(): void {
    const bookData = this.newBookFormGroup.getRawValue();

    this.booksStore.addBook({bookData});

    this.newBookFormGroup.reset();
  }

  onBorrowBook(bookId: string): void {
    // TODO: To do wyniesienia do authStore.
    const userId = this.authService.currentUser()?.id;

    if (userId) {
      this.booksStore.borrowBook({bookId, userId});
    }
  }

  onReturnBook(bookId: string): void {
    this.booksStore.returnBook({bookId});
  }

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
}
