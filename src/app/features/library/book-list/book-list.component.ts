import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../../core/models/book.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule], // Potrzebny do ngIf, ngFor itp. w starym stylu
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent {
  @Input() books: Book[] | null = []; // Odbieramy dane od rodzica
  
  @Output() borrow = new EventEmitter<string>(); // Emitujemy zdarzenie z ID książki
  @Output() return = new EventEmitter<string>(); // Emitujemy zdarzenie z ID książki
  
  public authService = inject(AuthService); // Potrzebny do sprawdzenia ID bieżącego użytkownika

  onBorrowClick(bookId: string) {
    this.borrow.emit(bookId);
  }

  onReturnClick(bookId: string) {
    this.return.emit(bookId);
  }
}