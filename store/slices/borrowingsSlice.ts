import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Borrowing {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  book: {
    id: string;
    title: string;
    author: string;
    coverImage?: string;
  };
}

interface BorrowingsState {
  borrowings: Borrowing[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: BorrowingsState = {
  borrowings: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const borrowingsSlice = createSlice({
  name: 'borrowings',
  initialState,
  reducers: {
    fetchBorrowingsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBorrowingsSuccess: (state, action: PayloadAction<{ borrowings: Borrowing[]; pagination: any }>) => {
      state.isLoading = false;
      state.borrowings = action.payload.borrowings;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchBorrowingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    borrowBookStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    borrowBookSuccess: (state, action: PayloadAction<Borrowing>) => {
      state.isLoading = false;
      state.borrowings.unshift(action.payload);
      state.error = null;
    },
    borrowBookFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    returnBookSuccess: (state, action: PayloadAction<string>) => {
      const borrowingIndex = state.borrowings.findIndex(b => b.id === action.payload);
      if (borrowingIndex !== -1) {
        state.borrowings[borrowingIndex].status = 'RETURNED';
        state.borrowings[borrowingIndex].returnDate = new Date().toISOString();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  fetchBorrowingsStart, 
  fetchBorrowingsSuccess, 
  fetchBorrowingsFailure,
  borrowBookStart,
  borrowBookSuccess,
  borrowBookFailure,
  returnBookSuccess,
  clearError 
} = borrowingsSlice.actions;

export default borrowingsSlice.reducer;