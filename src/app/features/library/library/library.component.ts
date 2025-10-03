import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { BookListComponent } from '../book-list/book-list.component';
import { BooksActions } from '../../../store/books/books.actions';
import { selectAllBooks, selectBooksLoading } from '../../../store/books/books.selectors';
import { Book } from '../../../core/models/book.model';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [FormsModule, BookListComponent, CommonModule, ReactiveFormsModule], // Importujemy FormsModule i komponent dziecka
  template: `
    <div class="library-container">
      <section class="add-book-section">
        <h3>Dodaj nową książkę</h3>
        <form [formGroup]="newBookFormGroup" (ngSubmit)="onAddBookSubmit()">
          <div class="form-grid">
            <input type="text" formControlName="title" name="title" placeholder="Tytuł">
            <input type="text" formControlName="author" name="author" placeholder="Autor">
            <input type="text" formControlName="publicationDate" name="publicationDate" placeholder="Data wydania">
            <input type="text" formControlName="shelfLocation" name="shelfLocation" placeholder="Lokalizacja na półce">
          </div>
          <button [disabled]="newBookFormGroup.invalid" type="submit">Dodaj książkę</button>
        </form>
      </section>

      <section class="book-list-section">
        <h3>Książki w bibliotece</h3>
        @if (isLoading()) {
          <p>Ładowanie książek...</p>
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
export class LibraryComponent implements OnInit {
  private store = inject(Store);
  private authService = inject(AuthService);
  private  fb = inject(NonNullableFormBuilder);

  // Pobieramy dane ze store za pomocą selektorów ($ - oznacza, że jest strumieniem danych)
  // z ngrx można zaciągnąć selector typ signal: selectSignal() aby ograniczać operacje na Observable
  books = this.store.selectSignal(selectAllBooks);
  isLoading = this.store.selectSignal(selectBooksLoading);

  // zdecydowanie lepiej w takiej sytuacji korzystać z formularzy reaktywnych
  // Dane dla nowego formularza książki
  // newBook = {
  //   title: '',
  //   author: '',
  //   publicationDate: '',
  //   shelfLocation: ''
  // };

  newBookFormGroup = this.createFormGroup();

  ngOnInit(): void {
    // Przy inicjalizacji komponentu, wysyłamy akcję, aby załadować książki
    // co do zasady lepiej nie implementować tutaj czystego kodu, a wywoływać metody
    // czyli przenieść poniższy dispatch np do metody prywatnej init i ją tutaj wywołać
    this.init();
  }

  onAddBookSubmit(): void {
    // Prosta walidacja
   /* if (!this.newBook.title || !this.newBook.author) {
      alert('Tytuł i autor są wymagani!');
      return;
    }*/
    const bookData = this.newBookFormGroup.getRawValue();

    // if (!bookData.title || !bookData.author) {
    //
    //   // lepiej zablokować przycisk aby użytkownik nie mógł wykonać akcji niż wyświetlać jakąś informacje przy tak prostym formularzu, jeżeli formularz jest złożony to wtedy można przez kliknięcie podświetlić wymagane pola
    //   alert('Tytuł i autor są wymagani!');
    //   return;
    // }

    // Wysyłamy akcję dodania książki z danymi z formularza
    this.store.dispatch(BooksActions.addBook({ bookData }));

    // Resetujemy formularz
    //this.newBook = { title: '', author: '', publicationDate: '', shelfLocation: '' };
    this.newBookFormGroup.reset();
  }

  onBorrowBook(bookId: string): void {
    // pierdoła, ale dla lepszych praktyk można pisać rekurencyjnie

    /*const currentUserId = this.authService.currentUser()?.id;
    if (currentUserId) {
      this.store.dispatch(BooksActions.borrowBook({ bookId, userId: currentUserId }));
    }*/

    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.store.dispatch(BooksActions.borrowBook({ bookId, userId }));
    }
  }

  onReturnBook(bookId: string): void {
    this.store.dispatch(BooksActions.returnBook({ bookId }));
  }

  private createFormGroup(): FormGroup<{
    title: FormControl<string>,
    author: FormControl<string>,
    publicationDate: FormControl<string>,
    shelfLocation: FormControl<string>,
  }> {
    return this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      publicationDate: ['', Validators.required],
      shelfLocation: ['', Validators.required]
    })
  }

  private loadBooks(): void {
    this.store.dispatch(BooksActions.loadBooks());
  }

  private init(): void {
    this.loadBooks();
  }
}
