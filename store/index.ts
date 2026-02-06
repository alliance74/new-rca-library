import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import booksSlice from './slices/booksSlice';
import borrowingsSlice from './slices/borrowingsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    books: booksSlice,
    borrowings: borrowingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;