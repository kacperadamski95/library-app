import {Component, inject, input, output} from '@angular/core';
import { Book } from '../../../core/models/book.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent {
  // w nowej wersji Angulara lepiej korzystać z inputów  i outputów sygnałowych np:
  booksSignal = input<Book[] | null>(null);
  borrowOutput = output<string>();
  returnOutput = output<string>();

  //@Input() books: Book[] | null = []; // Odbieramy dane od rodzica
  //@Output() borrow = new EventEmitter<string>(); // Emitujemy zdarzenie z ID książki
  //@Output() return = new EventEmitter<string>(); // Emitujemy zdarzenie z ID książki

  // można bez public
  authService = inject(AuthService); // Potrzebny do sprawdzenia ID bieżącego użytkownika

  onBorrowClick(bookId: string) {
    this.borrowOutput.emit(bookId);
  }

  onReturnClick(bookId: string) {
    this.returnOutput.emit(bookId);
  }
}
