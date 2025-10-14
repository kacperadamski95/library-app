import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookListComponent } from '../book-list/book-list.component';
import { CommonModule } from '@angular/common';
import { BooksStore } from '../../../store/books/books.store';
import { AuthStore } from '../../../store/auth/auth.store';

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

        @if (booksStore.isLoading() && booksStore.books().length === 0) {
          <p>Ładowanie książek...</p>
        } @else if (booksStore.error()) {
          <p class="error-message">{{ booksStore.error() }}</p>
        } @else {
          <app-book-list
            [booksSignal]="booksStore.books()"
            [currentUserId]="authStore.currentUser()?.id ?? null"
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
  private fb = inject(NonNullableFormBuilder);
  readonly booksStore = inject(BooksStore);
  readonly authStore = inject(AuthStore)

  ngOnInit() {
    if (this.newBookFormGroup.invalid) {
      return;
    }
    const bookData = this.newBookFormGroup.getRawValue();
    this.booksStore.addBook({ bookData });
    this.newBookFormGroup.reset();
  }

  newBookFormGroup = this.createFormGroup();

  onAddBookSubmit(): void {
    const bookData = this.newBookFormGroup.getRawValue();

    this.booksStore.addBook({bookData});

    this.newBookFormGroup.reset();
  }


  onBorrowBook(bookId: string): void {
    const userId = this.authStore.currentUser()?.id;

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
