import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksService, BooksQuery } from '@/services/booksService';
import { useNotifications } from '@/contexts/NotificationContext';

export const useBooks = (query: BooksQuery = {}) => {
  return useQuery({
    queryKey: ['books', query],
    queryFn: () => booksService.getBooks(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBook = (id: string) => {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => booksService.getBook(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useBorrowBook = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ bookId, borrowDate, dueDate }: { bookId: string; borrowDate?: string; dueDate?: string }) =>
      booksService.borrowBook(bookId, borrowDate, dueDate),
    onSuccess: (data) => {
      // Invalidate and refetch books and borrowings
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['borrowings'] });
      
      // Show success notification
      addNotification({
        title: 'Borrow Request Submitted',
        message: data.message || 'Your borrow request has been submitted successfully!',
        type: 'success',
        timestamp: new Date(),
      });
    },
    onError: (error: any) => {
      // Show error notification
      addNotification({
        title: 'Borrow Request Failed',
        message: error.response?.data?.message || 'Failed to submit borrow request. Please try again.',
        type: 'error',
        timestamp: new Date(),
      });
    },
  });
};

export const useMyBorrowedBooks = () => {
  return useQuery({
    queryKey: ['books', 'my-borrows'],
    queryFn: booksService.getMyBorrowedBooks,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSearchBooks = (query: string) => {
  return useQuery({
    queryKey: ['books', 'search', query],
    queryFn: () => booksService.searchBooks(query),
    enabled: query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};