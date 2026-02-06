'use client';

import { X, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BorrowingData {
  id: string;
  title: string;
  cover?: string;
}

interface ReturnConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  book: BorrowingData | null;
}

export default function ReturnConfirmModal({ isOpen, onClose, onConfirm, book }: ReturnConfirmModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsSuccess(false);
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

  const handleConfirm = () => {
    setIsSuccess(true);
    onConfirm();
    
    // Auto close after 2 seconds
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
    }, 2000);
  };

  const handleCancel = () => {
    onClose();
    setIsSuccess(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {!isSuccess ? (
          // Confirmation Screen
          <>
            {/* Header */}
            <div className="text-white p-6 rounded-t-2xl" style={{ backgroundColor: '#001240' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Request Return</h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-20 mx-auto bg-amber-100 rounded-lg flex items-center justify-center text-2xl mb-4">
                    📖
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to request to return this book? The librarian will need to approve your return request.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 px-4 text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                    style={{ backgroundColor: '#001240' }}
                  >
                    Request Return
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Success Screen
          <>
            {/* Header */}
            <div className="bg-green-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Return Request Submitted</h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Success Content */}
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Request Submitted Successfully!
                </h3>
                <p className="text-gray-600 mb-4 break-words">
                  Your return request for "{book.title}" has been submitted and is pending librarian approval.
                </p>
                <p className="text-sm text-gray-500">
                  This modal will close automatically...
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}