import { Book } from '../../core/models/book.model';

export interface BooksState {
  books: Book[];
  loading: boolean;
}

export const initialBooksState: BooksState = {
  books: [],
  loading: false,
};