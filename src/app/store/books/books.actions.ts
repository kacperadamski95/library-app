import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Book } from '../../core/models/book.model';
import {HttpErrorResponse} from '@angular/common/http';

export const BooksActions = createActionGroup({
  source: 'Books', // Źródło akcji
  events: {
    'Load Books': emptyProps(),
    'Load Books Success': props<{ books: Book[] }>(),
    'Load Books Fail': props<{error: HttpErrorResponse}>(),
    'Add Book': props<{ bookData: Omit<Book, 'id'> }>(),
    'Add Book Success': props<{ book: Book }>(),
    'Borrow Book': props<{ bookId: string; userId: string }>(),
    'Borrow Book Success': props<{ book: Book }>(),
    'Return Book': props<{ bookId: string }>(),
    'Return Book Success': props<{ book: Book }>(),
  },
});
