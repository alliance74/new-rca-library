import api from '@/lib/api';

export interface Book {
  id: string;
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  cover_image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BooksResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BooksQuery {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  author?: string;
}

export const booksService = {
  // Get all books with pagination and filters
  getBooks: async (query: BooksQuery = {}): Promise<BooksResponse> => {
    const response = await api.get('/books', { params: query });
    return response.data;
  },

  // Get single book by ID
  getBook: async (id: string): Promise<Book> => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  // Borrow a book
  borrowBook: async (bookId: string, borrowDate?: string, dueDate?: string): Promise<any> => {
    const requestData: any = {};
    if (borrowDate) requestData.borrowDate = borrowDate;
    if (dueDate) requestData.dueDate = dueDate;

    console.log('Borrowing book with data:', { bookId, requestData });
    try {
      const response = await api.post(`/books/${bookId}/borrow`, requestData);
      console.log('Borrow book success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Borrow book error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        }
      });
      throw error;
    }
  },

  // Get user's borrowed books
  getMyBorrowedBooks: async (): Promise<any[]> => {
    const response = await api.get('/books/my/borrows');
    return response.data;
  },

  // Search books
  searchBooks: async (query: string): Promise<Book[]> => {
    const response = await api.get('/books', {
      params: { search: query, limit: 20 }
    });
    return response.data.books;
  },
};