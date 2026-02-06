'use client';

import { X } from 'lucide-react';

interface DeleteBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void>;
  isLoading?: boolean;
}

export default function DeleteBookModal({ isOpen, onClose, onConfirm, isLoading = false }: DeleteBookModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur background */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#001240' }}>
          <h2 className="text-lg font-bold text-white">Delete Book</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 relative">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-gray-600 font-medium">Deleting book...</p>
              </div>
            </div>
          )}

          <p className="text-gray-700 text-center mb-8">
            Are you sure you want to delete this book? This action cannot be undone and will remove the book from the library catalog.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={async () => {
                if (onConfirm) {
                  await onConfirm();
                }
              }}
              disabled={isLoading}
              className="text-white px-8 py-2 rounded hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: '#001240' }}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <img 
                    src="/assets/logo.png" 
                    alt="Loading" 
                    className="w-4 h-4 object-contain"
                  />
                  Deleting...
                </div>
              ) : (
                'Delete'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="bg-white border-2 border-gray-300 text-gray-900 px-8 py-2 rounded hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
