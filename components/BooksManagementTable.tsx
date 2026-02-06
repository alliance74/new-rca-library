'use client';

import { Eye, Trash2 } from 'lucide-react';

export interface BookManagementData {
  id: string;
  cover?: string;
  title: string;
  isbn: string;
  category: string;
  stock: string;
  status: 'Active' | 'Borrowed';
}

interface BooksManagementTableProps {
  data: BookManagementData[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  isDeletingBook?: boolean;
}

export default function BooksManagementTable({ data, onView, onDelete, isLoading = false, isDeletingBook = false }: BooksManagementTableProps) {
  return (
    <div className="w-full">
      {/* Desktop View - Horizontal Scroll Container */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]"> {/* Minimum width to prevent cramping */}
            {/* Header */}
            <div className="grid grid-cols-[80px_1fr_140px_120px_80px_100px_120px] gap-4 items-center px-6 py-4 text-white font-medium text-sm" style={{ backgroundColor: '#001240' }}>
              <div>Cover</div>
              <div>Book Title</div>
              <div>Author</div>
              <div>Publisher</div>
              <div>Stock</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            
            {/* Content */}
            <div className="bg-white">
              {isLoading ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={`loading-${index}`} className={`grid grid-cols-[80px_1fr_140px_120px_80px_100px_120px] gap-4 items-center px-6 py-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="h-10 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : data.length > 0 ? (
                data.map((book, index) => (
                  <div key={book.id} className={`grid grid-cols-[80px_1fr_140px_120px_80px_100px_120px] gap-4 items-center px-6 py-4 hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="shrink-0">
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="h-10 w-12 object-cover rounded bg-gray-800"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/assets/book-profile.png";
                          }}
                        />
                      ) : (
                        <img
                          src="/assets/book-profile.png"
                          alt={book.title}
                          className="h-10 w-12 object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="min-w-0 truncate">
                      <span className="text-gray-900 font-medium">{book.title}</span>
                    </div>
                    <div className="min-w-0 truncate">
                      <span className="text-gray-900 text-sm">{book.isbn}</span>
                    </div>
                    <div className="min-w-0 truncate">
                      <span className="text-gray-900 text-sm">{book.category}</span>
                    </div>
                    <div className="text-gray-900 text-sm text-center">
                      {book.stock}
                    </div>
                    <div className="shrink-0">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          book.status === 'Active'
                            ? 'text-white'
                            : 'bg-white text-gray-900 border border-gray-300'
                        }`}
                        style={book.status === 'Active' ? { backgroundColor: '#001240' } : {}}
                      >
                        {book.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView?.(book.id)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        aria-label="View"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => onDelete?.(book.id)}
                        className="p-2 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        aria-label="Delete"
                        title="Delete Book"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-600 font-medium mb-2">No books available</p>
                  <p className="text-sm text-gray-500">Add books to see them listed here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`mobile-loading-${index}`} className="bg-white rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="h-12 w-10 bg-gray-200 rounded animate-pulse shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4 mb-1"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
            </div>
          ))
        ) : data.length > 0 ? (
          data.map((book) => (
            <div key={book.id} className="bg-white rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="h-12 w-10 object-cover rounded bg-gray-800 shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/book-profile.png";
                      }}
                    />
                  ) : (
                    <img
                      src="/assets/book-profile.png"
                      alt={book.title}
                      className="h-12 w-10 object-cover rounded shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-gray-600 break-all">{book.isbn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button
                    onClick={() => onView?.(book.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    aria-label="View"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onDelete?.(book.id)}
                    className="p-2 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    aria-label="Delete"
                    title="Delete Book"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 text-xs">Category</p>
                  <p className="font-medium text-gray-900 wrap-break-word">{book.category}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Stock</p>
                  <p className="font-medium text-gray-900">{book.stock}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-xs mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      book.status === 'Active'
                        ? 'text-white'
                        : 'bg-white text-gray-900 border border-gray-300'
                    }`}
                    style={book.status === 'Active' ? { backgroundColor: '#001240' } : {}}
                  >
                    {book.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 font-medium mb-2">No books available</p>
            <p className="text-sm text-gray-500">Add books to see them listed here</p>
          </div>
        )}
      </div>
    </div>
  );
}
