import api from '@/lib/api';

export interface DashboardStats {
  totalBorrowed: number;
  currentlyBorrowed: number;
  pending: number;
  approved: number;
  overdue: number;
  returned: number;
  rejected: number;
}

export interface BorrowRecord {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: string;
  dueDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'OVERDUE';
  returnDate?: string;
  book: {
    id: string;
    title: string;
    author: string;
    ISBN: string;
    cover_image?: string;
  };
}

export interface UserBorrowsResponse {
  currentBorrows: BorrowRecord[];
  borrowHistory: BorrowRecord[];
  statistics: DashboardStats;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  ISBN: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  description?: string;
  cover_image?: string;
  isAvailable: boolean;
  remaining_copies: number;
  borrowed: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BooksResponse {
  books: Book[];
  total: number;
}

export const dashboardService = {
  // Get user's borrow history and statistics
  getUserBorrows: async (): Promise<UserBorrowsResponse> => {
    try {
      const response = await api.get('/books/my/borrows');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get user borrows:', error);
      throw error;
    }
  },

  // Get all books
  getAllBooks: async (): Promise<BooksResponse> => {
    try {
      const response = await api.get('/books');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get books:', error);
      throw error;
    }
  },

  // Request to borrow a book
  borrowBook: async (bookId: string): Promise<{ message: string; borrow: BorrowRecord }> => {
    try {
      const response = await api.post(`/books/${bookId}/borrow`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to borrow book:', error);
      throw error;
    }
  },

  // Get book details
  getBookById: async (bookId: string): Promise<Book> => {
    try {
      const response = await api.get(`/books/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get book details:', error);
      throw error;
    }
  },
};