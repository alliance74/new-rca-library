import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowingsService, BorrowingsQuery, UserBorrowsResponse } from '@/services/borrowingsService';

export const useBorrowings = (query: BorrowingsQuery = {}) => {
  return useQuery({
    queryKey: ['borrowings', query],
    queryFn: () => borrowingsService.getBorrowings(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useBorrowing = (id: string) => {
  return useQuery({
    queryKey: ['borrowings', id],
    queryFn: () => borrowingsService.getBorrowing(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: borrowingsService.returnBook,
    onSuccess: () => {
      // Invalidate and refetch borrowings and books
      queryClient.invalidateQueries({ queryKey: ['borrowings'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

// Admin hooks
export const useAllBorrowings = (query: BorrowingsQuery = {}) => {
  return useQuery({
    queryKey: ['admin', 'borrowings', query],
    queryFn: () => borrowingsService.getAllBorrowings(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminReturnBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: borrowingsService.adminReturnBook,
    onSuccess: () => {
      // Invalidate and refetch admin borrowings and books
      queryClient.invalidateQueries({ queryKey: ['admin', 'borrowings'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useAdminRejectReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: borrowingsService.adminRejectReturn,
    onSuccess: () => {
      // Invalidate and refetch admin borrowings and books
      queryClient.invalidateQueries({ queryKey: ['admin', 'borrowings'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};