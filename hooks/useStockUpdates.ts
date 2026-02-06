'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

interface StockUpdate {
  bookId: string;
  availableCopies: number;
  totalCopies: number;
  isAvailable: boolean;
  timestamp: Date;
}

interface BorrowUpdate {
  borrowId: string;
  status: string;
  bookId: string;
  userId: string;
  timestamp: Date;
}

export const useStockUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to stock updates');
    });

    socket.on('stock-update', (data: StockUpdate) => {
      console.log('Stock update received:', data);
      
      // Invalidate books queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      
      // Update specific book data in cache if available
      queryClient.setQueriesData(
        { queryKey: ['books'] },
        (oldData: any) => {
          if (!oldData?.books) return oldData;
          
          return {
            ...oldData,
            books: oldData.books.map((book: any) => 
              book.id === data.bookId 
                ? { 
                    ...book, 
                    availableCopies: data.availableCopies,
                    totalCopies: data.totalCopies,
                    isAvailable: data.isAvailable,
                  }
                : book
            ),
          };
        }
      );
    });

    socket.on('borrow-update', (data: BorrowUpdate) => {
      console.log('Borrow update received:', data);
      
      // Invalidate borrowings queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['borrowings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'borrowings'] });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from stock updates');
    });

    socket.on('connect_error', (error) => {
      console.error('Stock updates connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
};