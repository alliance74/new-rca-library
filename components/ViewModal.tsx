'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import ExpandableText from './ExpandableText';

interface BookDetails {
  id: string;
  title: string;
  ISBN: string;
  author: string;
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

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  gender: string;
  status: string;
  avatar?: string;
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'book' | 'user';
  data: BookDetails | UserDetails | null;
}

export default function ViewModal({ isOpen, onClose, type, data }: ViewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderBookDetails = (book: BookDetails) => (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Book details</h2>
      <div className="flex gap-6">
        <div className="shrink-0">
          <img
            src={book.cover_image || "/assets/book.png"}
            alt={book.title}
            className="w-32 h-40 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = '/assets/book.png';
            }}
          />
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${book.availableCopies > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {book.availableCopies > 0 ? 'Available' : 'Not Available'}
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Book Title</label>
              <ExpandableText 
                text={book.title} 
                maxLength={50} 
                className="text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">ISBN</label>
              <p className="text-gray-900 font-medium">{book.ISBN || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Author</label>
              <p className="text-gray-900 font-medium">{book.author}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Genre</label>
              <p className="text-gray-900 font-medium">{book.genre || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Publisher</label>
              <p className="text-gray-900 font-medium">{book.publisher || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Publication Year</label>
              <p className="text-gray-900 font-medium">{book.publicationYear || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Edition</label>
              <p className="text-gray-900 font-medium">{book.edition || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Stock</label>
              <p className="text-gray-900 font-medium">{book.availableCopies}/{book.totalCopies}</p>
            </div>
          </div>
          {book.description && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <ExpandableText 
                text={book.description} 
                maxLength={150} 
                className="text-gray-900 text-sm leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderUserDetails = (user: UserDetails) => (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">User details</h2>
      <div className="flex gap-6">
        <div className="shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-gray-600">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <p className="text-gray-900 font-medium">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
            <p className="text-gray-900 font-medium">{user.gender}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <p className="text-gray-900 font-medium">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
            <p className="text-gray-900 font-medium">{user.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <p className="text-gray-900 font-medium">{user.phone}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close button - positioned absolutely in top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="p-6">
          {type === 'book' ? renderBookDetails(data as BookDetails) : renderUserDetails(data as UserDetails)}
        </div>
      </div>
    </div>
  );
}