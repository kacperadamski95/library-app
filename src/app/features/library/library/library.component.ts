import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { BookListComponent } from '../book-list/book-list.component';
import { BooksActions } from '../../../store/books/books.actions';
import { selectAllBooks, selectBooksLoading } from '../../../store/books/books.selectors';
import { Book } from '../../../core/models/book.model';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [FormsModule, BookListComponent, CommonModule], // Importujemy FormsModule i komponent dziecka
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent implements OnInit {
  private store = inject(Store);
  private authService = inject(AuthService);

  // Pobieramy dane ze store za pomocą selektorów ($ - oznacza, że jest strumieniem danych)
  books$ = this.store.select(selectAllBooks);
  loading$ = this.store.select(selectBooksLoading);
  
  // Dane dla nowego formularza książki
  newBook = {
    title: '',
    author: '',
    publicationDate: '',
    shelfLocation: ''
  };

  ngOnInit(): void {
    // Przy inicjalizacji komponentu, wysyłamy akcję, aby załadować książki
    this.store.dispatch(BooksActions.loadBooks());
  }

  onAddBookSubmit(): void {
    // Prosta walidacja
    if (!this.newBook.title || !this.newBook.author) {
      alert('Tytuł i autor są wymagani!');
      return;
    }
    
    // Wysyłamy akcję dodania książki z danymi z formularza
    this.store.dispatch(BooksActions.addBook({ bookData: this.newBook }));

    // Resetujemy formularz
    this.newBook = { title: '', author: '', publicationDate: '', shelfLocation: '' };
  }

  onBorrowBook(bookId: string): void {
    const currentUserId = this.authService.currentUser()?.id;
    if (currentUserId) {
      this.store.dispatch(BooksActions.borrowBook({ bookId, userId: currentUserId }));
    }
  }

  onReturnBook(bookId: string): void {
    this.store.dispatch(BooksActions.returnBook({ bookId }));
  }
}