import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
  updatedAt: string;
}

interface BooksState {
  books: Book[];
  currentBook: Book | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: BooksState = {
  books: [],
  currentBook: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    fetchBooksStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBooksSuccess: (state, action: PayloadAction<{ books: Book[]; pagination: any }>) => {
      state.isLoading = false;
      state.books = action.payload.books;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchBooksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCurrentBook: (state, action: PayloadAction<Book | null>) => {
      state.currentBook = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  fetchBooksStart, 
  fetchBooksSuccess, 
  fetchBooksFailure, 
  setCurrentBook, 
  clearError 
} = booksSlice.actions;

export default booksSlice.reducer;