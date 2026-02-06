import api from '@/lib/api';

export interface Borrowing {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate?: string;
  returnDate?: string;
  status: 'PENDING' | 'APPROVED' | 'RETURNED' | 'OVERDUE' | 'REJECTED' | 'RETURN_REQUESTED';
  book: {
    id: string;
    title: string;
    author: string;
    ISBN: string;
    cover_image?: string;
  };
}

export interface UserBorrowsResponse {
  currentBorrows: Borrowing[];
  borrowHistory: Borrowing[];
  statistics: {
    totalBorrowed: number;
    currentlyBorrowed: number;
    pending: number;
    approved: number;
    overdue: number;
    returned: number;
    rejected: number;
  };
}

export interface BorrowingsResponse {
  borrowings: Borrowing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BorrowingsQuery {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'RETURNED' | 'OVERDUE' | 'REJECTED' | 'RETURN_REQUESTED';
}

export const borrowingsService = {
  // Get user's borrowings
  getBorrowings: async (query: BorrowingsQuery = {}): Promise<UserBorrowsResponse> => {
    const response = await api.get('/books/my/borrows', { params: query });
    return response.data;
  },

  // Return a book (now submits return request)
  returnBook: async (borrowingId: string): Promise<Borrowing> => {
    const response = await api.patch(`/books/borrows/${borrowingId}/return`);
    return response.data;
  },

  // Get borrowing by ID (this endpoint might not exist yet)
  getBorrowing: async (id: string): Promise<Borrowing> => {
    const response = await api.get(`/books/borrows/${id}`);
    return response.data;
  },

  // Admin: Get all borrowings
  getAllBorrowings: async (query: BorrowingsQuery = {}): Promise<BorrowingsResponse> => {
    const response = await api.get('/admin/borrows', { params: query });
    return response.data;
  },

  // Admin: Approve return request
  adminReturnBook: async (borrowingId: string): Promise<Borrowing> => {
    const response = await api.patch(`/admin/borrows/${borrowingId}/return`);
    return response.data;
  },

  // Admin: Reject return request
  adminRejectReturn: async (borrowingId: string): Promise<Borrowing> => {
    const response = await api.patch(`/admin/borrows/${borrowingId}/reject-return`);
    return response.data;
  },
};