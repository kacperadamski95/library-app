import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Book} from '../core/models/book.model';
import {HttpClient} from '@angular/common/http';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly http = inject(HttpClient);

  get getBookApiUrl(): string {
    return `${API_URL}/books`;
  }

 loadBooks(): Observable<Book[]> {
   return this.http.get<Book[]>(this.getBookApiUrl);
 }

 addBook(book: Partial<Book>): Observable<void> {
    return this.http.post<void>(this.getBookApiUrl, book);
 }

  borrowBook(bookId: string, userId: string): Observable<Book> {
    return this.http.patch<Book>(`${this.getBookApiUrl}/${bookId}`, { borrowedByUserId: userId });
  }

  returnBook(bookId: string): Observable<Book> {
    return this.http.patch<Book>(`${this.getBookApiUrl}/${bookId}`, { borrowedByUserId: null });
  }
}
