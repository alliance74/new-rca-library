'use client';

import { X } from 'lucide-react';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function DeleteUserModal({ isOpen, onClose, onConfirm }: DeleteUserModalProps) {
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
          <h2 className="text-lg font-bold text-white">Deactivate user</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center mb-8">
            Are you sure you want to deactivate this user? They will no longer have access to the system until reactivated
          </p>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className="text-white px-8 py-2 rounded hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: '#001240' }}>
              Deactivate
            </button>
            <button
              onClick={onClose}
              className="bg-white border-2 border-gray-300 text-gray-900 px-8 py-2 rounded hover:bg-gray-50 transition-colors font-medium"
            >
              cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
