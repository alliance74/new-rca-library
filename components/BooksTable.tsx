'use client';

import { Edit2, Eye, RotateCcw, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Pagination from './Pagination';

export interface BookData {
  id: string;
  cover?: string;
  title: string;
  borrower: string;
  category?: string;
  returnDate: string;
  availability: 'Available' | 'Borrowed';
  stock?: number;
}

interface BooksTableProps {
  data: BookData[];
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onReturn?: (id: string) => void;
  onBorrow?: (id: string) => void;
  onExternal?: (id: string) => void;
  showCategory?: boolean;
  showBorrower?: boolean;
  showReturnDate?: boolean;
  showStock?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
}

export default function BooksTable({ 
  data, 
  onEdit, 
  onView, 
  onReturn, 
  onBorrow,
  onExternal,
  showCategory = true,
  showBorrower = true,
  showReturnDate = true,
  showStock = false,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
}: BooksTableProps) {
  return (
    <div className="w-full min-w-0">
      {/* Desktop View */}
      <div className="hidden md:block w-full min-w-0">
        <Table className="bg-white w-full">
          <TableHeader>
            <TableRow className="text-white font-medium text-sm" style={{ backgroundColor: '#001240' }}>
              <TableHead className="w-16 text-white">Cover</TableHead>
              <TableHead className="text-white">Title</TableHead>
              {showBorrower && <TableHead className="text-white">Author</TableHead>}
              {showCategory && <TableHead className="text-white">Publisher</TableHead>}
              {showReturnDate && <TableHead className="text-white">Added Date</TableHead>}
              {showStock && <TableHead className="text-white">Total Copies</TableHead>}
              <TableHead className="text-white">Availability</TableHead>
              <TableHead className="w-32 text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell className="p-4 w-16">
                      <div className="h-10 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </TableCell>
                    {showBorrower && (
                      <TableCell className="p-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </TableCell>
                    )}
                    {showCategory && (
                      <TableCell className="p-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                      </TableCell>
                    )}
                    {showReturnDate && (
                      <TableCell className="p-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </TableCell>
                    )}
                    {showStock && (
                      <TableCell className="p-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      </TableCell>
                    )}
                    <TableCell className="p-4">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                    </TableCell>
                    <TableCell className="p-4 w-32">
                      <div className="flex items-center gap-1">
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : data.length > 0 ? (
                data.map((book) => (
                  <TableRow key={book.id} className="hover:bg-gray-50">
                    <TableCell className="p-4 w-16">
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="h-10 w-8 object-cover rounded bg-gray-800"
                        />
                      ) : (
                        <img
                          src="/assets/book-profile.png"
                          alt={book.title}
                          className="h-10 w-8 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell className="p-4 text-gray-900">
                      <div className="truncate font-medium" title={book.title}>
                        {book.title}
                      </div>
                    </TableCell>
                    {showBorrower && (
                      <TableCell className="p-4 text-gray-900">
                        <div className="truncate" title={book.borrower}>
                          {book.borrower}
                        </div>
                      </TableCell>
                    )}
                    {showCategory && (
                      <TableCell className="p-4 text-gray-900">
                        <div className="truncate" title={book.category}>
                          {book.category}
                        </div>
                      </TableCell>
                    )}
                    {showReturnDate && (
                      <TableCell className="p-4 text-gray-900">
                        <div>{book.returnDate}</div>
                      </TableCell>
                    )}
                    {showStock && (
                      <TableCell className="p-4 text-gray-900">
                        <div>{book.stock || 'N/A'}</div>
                      </TableCell>
                    )}
                    <TableCell className="p-4">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${
                          book.availability === 'Available'
                            ? 'text-white'
                            : 'bg-white text-gray-900 border border-gray-300'
                        }`}
                        style={book.availability === 'Available' ? { backgroundColor: '#001240' } : {}}
                      >
                        {book.availability}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 w-32">
                      <div className="flex items-center gap-1">
                        {onView && (
                          <button
                            onClick={() => onView(book.id)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            aria-label="View"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                        {onBorrow && book.availability === 'Available' && (
                          <button
                            onClick={() => onBorrow(book.id)}
                            className="px-3 py-1 text-white text-sm rounded hover:bg-opacity-90 transition-colors whitespace-nowrap"
                            style={{ backgroundColor: '#001240' }}
                            aria-label="Borrow"
                          >
                            Borrow
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(book.id)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Edit"
                          >
                            <Edit2 className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                        {onReturn && book.availability === 'Borrowed' && (
                          <button
                            onClick={() => onReturn(book.id)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Return"
                          >
                            <RotateCcw className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                        {onExternal && (
                          <button
                            onClick={() => onExternal(book.id)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            aria-label="External"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // No data state
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-gray-600 font-medium mb-2">No books available</p>
                    <p className="text-sm text-gray-500">Books will appear here when added</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                  <div className="flex items-center gap-2 ml-2 shrink-0">
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
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {showBorrower ? book.borrower : book.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    {onView && (
                      <button
                        onClick={() => onView(book.id)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                    {onBorrow && book.availability === 'Available' && (
                      <button
                        onClick={() => onBorrow(book.id)}
                        className="px-3 py-1 text-white text-sm rounded hover:bg-opacity-90 transition-colors"
                        style={{ backgroundColor: '#001240' }}
                        aria-label="Borrow"
                      >
                        Borrow
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(book.id)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Edit"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {showCategory && (
                    <div>
                      <p className="text-gray-600 text-xs">Publisher</p>
                      <p className="font-medium text-gray-900 line-clamp-1">{book.category}</p>
                    </div>
                  )}
                  {showReturnDate && (
                    <div>
                      <p className="text-gray-600 text-xs">Added Date</p>
                      <p className="font-medium text-gray-900">{book.returnDate}</p>
                    </div>
                  )}
                  {showStock && (
                    <div>
                      <p className="text-gray-600 text-xs">Total Copies</p>
                      <p className="font-medium text-gray-900">{book.stock || 'N/A'}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-gray-600 text-xs mb-1">Availability</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        book.availability === 'Available'
                          ? 'text-white'
                          : 'bg-white text-gray-900 border border-gray-300'
                      }`}
                      style={book.availability === 'Available' ? { backgroundColor: '#001240' } : {}}
                    >
                      {book.availability}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-600 font-medium mb-2">No books available</p>
              <p className="text-sm text-gray-500">Books will appear here when added</p>
            </div>
          )}
        </div>
      
      {/* Only show built-in pagination if pagination props are provided */}
      {currentPage && totalPages && totalItems && itemsPerPage && onPageChange && onItemsPerPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
}
