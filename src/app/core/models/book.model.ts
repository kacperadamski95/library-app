export interface Book {
  id: string;
  title: string;
  author: string;
  publicationDate: string;
  shelfLocation: string;
//   ? ponieważ książka nie zawsze jest wypożyczona
  borrowedByUserId?: string | null;
}