'use client';

import { X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ExpandableText from './ExpandableText';

interface BookData {
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

interface RequestBorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookData | null;
  onConfirm: (borrowDate: string, expectedReturnDate: string) => Promise<void>;
  isLoading?: boolean;
}

export default function RequestBorrowModal({ isOpen, onClose, book, onConfirm, isLoading = false }: RequestBorrowModalProps) {
  const [borrowDate, setBorrowDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Set default dates only on client side
      if (typeof window !== 'undefined') {
        // Set default borrow date to today
        const today = new Date().toISOString().split('T')[0];
        setBorrowDate(today);
        // Set default return date to 14 days from today (2 weeks)
        const returnDateDefault = new Date();
        returnDateDefault.setDate(returnDateDefault.getDate() + 14);
        setReturnDate(returnDateDefault.toISOString().split('T')[0]);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !book) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    // Convert dates to ISO format for backend
    const borrowDateISO = new Date(borrowDate).toISOString();
    const dueDateISO = new Date(returnDate).toISOString();
    
    console.log('Book request confirmed:', {
      bookId: book.id,
      borrowDate: borrowDateISO,
      dueDate: dueDateISO,
    });
    // Call the onConfirm callback with ISO formatted dates
    await onConfirm(borrowDateISO, dueDateISO);
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="text-white p-6 rounded-t-2xl" style={{ backgroundColor: '#001240' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Request to borrow</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Book Image */}
            <div className="shrink-0 flex flex-col items-center lg:items-start">
              <img
                src={book.cover_image || '/assets/book-profile.png'}
                alt={book.title}
                className="w-32 h-44 lg:w-48 lg:h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/assets/book-profile.png';
                }}
              />
              
              {/* Availability Status */}
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Not Available'}
                </span>
              </div>
            </div>

            {/* Book Details and Form */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Book Information */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 break-words leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 break-words">by {book.author}</p>
                </div>
                
                {book.description && (
                  <div>
                    <p className="text-sm text-gray-700 break-words leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="break-all">ISBN: {book.ISBN}</span>
                  {book.genre && <span className="break-words">Genre: {book.genre}</span>}
                </div>
              </div>

              {/* Borrow Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borrow Date:
                </label>
                <input
                  type="date"
                  value={borrowDate}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Borrow date is automatically set to today
                </p>
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Return Date:
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={borrowDate} // Can't return before borrow date
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select when you plan to return the book (must be after borrow date)
                </p>
              </div>

              {/* Confirm Button */}
              <div className="pt-4">
                <button
                  onClick={handleConfirm}
                  disabled={!borrowDate || !returnDate || borrowDate >= returnDate || isLoading}
                  className="w-full py-3 text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#001240' }}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? 'Submitting Request...' : 'Confirm Request'}
                </button>
                {borrowDate >= returnDate && borrowDate && returnDate && !isLoading && (
                  <p className="text-red-500 text-sm mt-2">
                    Return date must be after borrow date
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}