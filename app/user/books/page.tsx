'use client';

import { Suspense } from 'react';
import StatCard from "@/components/StatCard";
import ViewModal from "@/components/ViewModal";
import RequestBorrowModal from "@/components/RequestBorrowModal";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Search, Filter, Grid, BookOpen, Calendar, Clock, Eye, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useBooks, useBorrowBook } from "@/hooks/useBooks";
import { useBorrowings } from "@/hooks/useBorrowings";
import { useGlobalNotification } from '@/hooks/useGlobalNotification';

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

// Loading fallback component
function BooksPageFallback() {
  return (
    <div>
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={10} columns={7} />
    </div>
  );
}

// Main data component
function BooksPageContent() {
  const { showSuccess, showError } = useGlobalNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedBookForRequest, setSelectedBookForRequest] = useState<BookData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    availability: 'all', // 'all', 'available', 'borrowed'
    genre: 'all',
  });

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API hooks - fetch all data for client-side pagination
  const { data: booksData, isLoading: booksLoading, error: booksError } = useBooks({
    page: 1,
    limit: 1000, // Fetch all books for client-side pagination
    search: undefined, // Handle search client-side
  });

  const { data: borrowingsData } = useBorrowings();
  const borrowBookMutation = useBorrowBook();

  const books = booksData?.books || [];

  // Client-side filtering and pagination
  const filteredBooks = books.filter(book => {
    // Search filter
    const matchesSearch = book.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      book.ISBN.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    
    // Availability filter
    const matchesAvailability = filters.availability === 'all' || 
      (filters.availability === 'available' && book.availableCopies > 0) ||
      (filters.availability === 'borrowed' && book.availableCopies === 0);
    
    // Genre filter
    const matchesGenre = filters.genre === 'all' || book.genre === filters.genre;
    
    return matchesSearch && matchesAvailability && matchesGenre;
  });

  // Get unique genres for filter dropdown
  const uniqueGenres = [...new Set(books.map(book => book.genre))].sort();

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, debouncedSearchQuery]);

  // Calculate stats from real data with proper logic (focused on books page context)
  const borrowedBooks = borrowingsData?.statistics?.currentlyBorrowed || 0;
  
  // Calculate due soon properly (approved books due within 3 days)
  const dueSoon = borrowingsData?.currentBorrows?.filter((b: any) => {
    if (b.status !== 'APPROVED' || !b.dueDate) return false;
    const dueDate = new Date(b.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }).length || 0;
  
  // Calculate overdue properly
  const overdue = borrowingsData?.currentBorrows?.filter((b: any) => {
    if (b.status !== 'APPROVED' || !b.dueDate) return false;
    const dueDate = new Date(b.dueDate);
    const today = new Date();
    return dueDate < today;
  }).length || 0;

  const stats = [
    {
      icon: Grid,
      label: "Books available",
      value: books.filter(book => book.availableCopies > 0).length.toString(),
      change: "Total books in catalog",
    },
    {
      icon: BookOpen,
      label: "My borrowed books",
      value: borrowedBooks.toString(),
      change: borrowedBooks > 0 ? "Currently active" : "No active borrows",
    },
    {
      icon: Calendar,
      label: "Due soon",
      value: dueSoon.toString(),
      change: dueSoon > 0 ? "Within 3 days" : "None due soon",
    },
    {
      icon: Clock,
      label: "Overdue",
      value: overdue.toString(),
      change: overdue > 0 ? "Needs attention" : "All up to date",
    },
  ];

  const handleView = (id: string) => {
    const book = books.find(b => b.id === id);
    if (book) {
      setSelectedBook(book);
      setIsModalOpen(true);
    }
  };

  const handleExternal = (id: string) => {
    const book = books.find(b => b.id === id);
    if (book) {
      setSelectedBookForRequest(book);
      setIsRequestModalOpen(true);
    }
  };

  const handleConfirmBorrow = async (borrowDate: string, dueDate: string) => {
    if (selectedBookForRequest) {
      try {
        console.log('Submitting borrow request:', { bookId: selectedBookForRequest.id, borrowDate, dueDate });
        await borrowBookMutation.mutateAsync({
          bookId: selectedBookForRequest.id,
          borrowDate,
          dueDate,
        });
        // Success is handled by the mutation's onSuccess callback
        setIsRequestModalOpen(false);
        setSelectedBookForRequest(null);
      } catch (error: any) {
        // Error is already handled by the mutation's onError callback
        // Just log for debugging
        console.error('Error borrowing book:', error);
        console.error('Error response:', error.response?.data);
        // Don't show additional error toast here since mutation already handles it
      }
    }
  };

  // Loading state
  if (booksLoading) {
    return <BooksPageFallback />;
  }

  // Error state
  if (booksError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading books</p>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            variant="dark"
          />
        ))}
      </div>

      {/* Books Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-[5px] transition-colors ${
                  showFilters 
                    ? 'text-white border-transparent' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                style={showFilters ? { backgroundColor: '#001240' } : {}}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <select
                value={itemsPerPage >= filteredBooks.length ? filteredBooks.length : itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 sm:px-4 py-2 text-white rounded-[5px] hover:bg-opacity-90 transition-colors border-none outline-none text-sm"
                style={{ backgroundColor: "#001240" }}
              >
                <option value={5} className="bg-white text-gray-900">5 rows</option>
                <option value={10} className="bg-white text-gray-900">10 rows</option>
                <option value={25} className="bg-white text-gray-900">25 rows</option>
                <option value={50} className="bg-white text-gray-900">50 rows</option>
                <option value={filteredBooks.length} className="bg-white text-gray-900">All rows ({filteredBooks.length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Books</option>
                  <option value="available">Available Only</option>
                  <option value="borrowed">Borrowed Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Genres</option>
                  {uniqueGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ availability: 'all', genre: 'all' });
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'No books are currently available'}
            </p>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {paginatedBooks.map((book) => (
            <div key={book.id} className="p-4 border-b border-gray-200 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="h-16 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-16 w-12 rounded flex items-center justify-center" style={{ backgroundColor: "#8B4513" }}>
                      <span className="text-xs text-white">📖</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{book.author}</p>
                  <p className="text-sm text-gray-600">{book.genre}</p>
                  <p className="text-sm text-gray-600">Available: {book.availableCopies}/{book.totalCopies}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        book.availableCopies > 0
                          ? 'text-white'
                          : 'bg-red-100 text-red-800'
                      }`}
                      style={book.availableCopies > 0 ? { backgroundColor: "#001240" } : {}}
                    >
                      {book.availableCopies > 0 ? 'Available' : 'Borrowed'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(book.id)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        aria-label="View Details"
                        title="View Book Details"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </button>
                      {book.availableCopies > 0 && (
                        <button
                          onClick={() => handleExternal(book.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors flex items-center gap-1"
                          title="Request to Borrow"
                          disabled={borrowBookMutation.isPending}
                        >
                          <img src="/assets/hand.png" alt="Request" className="h-3 w-3" />
                          {borrowBookMutation.isPending ? 'Requesting...' : 'Request'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <Table className="bg-white min-w-full">
            <TableHeader style={{ backgroundColor: "#001240" }} className="text-white">
              <TableRow className="border-0 hover:bg-opacity-90" style={{ backgroundColor: "#001240" }}>
                <TableHead className="text-white w-12 px-2">Cover</TableHead>
                <TableHead className="text-white min-w-[180px] px-3">Book Title</TableHead>
                <TableHead className="text-white min-w-[130px] pl-4">Author</TableHead>
                <TableHead className="text-white w-20 pl-4">Genre</TableHead>
                <TableHead className="text-white w-20 pl-4">Availability</TableHead>
                <TableHead className="text-white w-16 pl-4">Stock</TableHead>
                <TableHead className="text-white w-20 pl-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBooks.map((book, index) => (
                <TableRow key={book.id} className={`border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <TableCell className="p-2 w-12">
                    <img
                      src={book.cover_image || '/assets/book-profile.png'}
                      alt={book.title}
                      className="h-10 w-8 rounded object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/assets/book-profile.png";
                      }}
                    />
                  </TableCell>
                  <TableCell className="p-3 text-gray-900 min-w-[180px]">
                    <div className="max-w-[180px] truncate" title={book.title}>
                      {book.title}
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-gray-900 min-w-[130px] pl-4">
                    <div className="max-w-[130px] truncate" title={book.author}>
                      {book.author}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 text-gray-900 w-20 pl-4">
                    <div className="max-w-[70px] text-xs truncate" title={book.genre}>
                      {book.genre}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 w-20 pl-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        book.availableCopies > 0
                          ? 'text-white'
                          : 'bg-red-100 text-red-800'
                      }`}
                      style={book.availableCopies > 0 ? { backgroundColor: "#001240" } : {}}
                    >
                      {book.availableCopies > 0 ? 'Available' : 'Borrowed'}
                    </span>
                  </TableCell>
                  <TableCell className="p-2 text-gray-900 w-16 text-center text-sm pl-4">{book.availableCopies}/{book.totalCopies}</TableCell>
                  <TableCell className="p-2 w-20 pl-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(book.id)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded transition-colors group"
                        aria-label="View Details"
                        title="View Book Details"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600 group-hover:text-blue-700" />
                      </button>
                      {book.availableCopies > 0 && (
                        <button
                          onClick={() => handleExternal(book.id)}
                          className="p-1.5 bg-green-50 hover:bg-green-100 rounded transition-colors group"
                          aria-label="Request to Borrow"
                          title="Request to Borrow This Book"
                          disabled={borrowBookMutation.isPending}
                        >
                          {borrowBookMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 text-green-600 animate-spin" />
                          ) : (
                            <img src="/assets/hand.png" alt="Request" className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200">
          <div className="hidden sm:flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBooks.length)} of {filteredBooks.length} results
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      currentPage === pageNum
                        ? 'text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                    style={currentPage === pageNum ? { backgroundColor: "#001240" } : {}}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          <div className="flex sm:hidden flex-col gap-3">
            <div className="text-center text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({filteredBooks.length} total)
            </div>
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-white rounded" style={{ backgroundColor: "#001240" }}>
                {currentPage}
              </span>
              <button 
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <ViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="book"
        data={selectedBook}
      />

      {/* Request Borrow Modal */}
      <RequestBorrowModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        book={selectedBookForRequest}
        onConfirm={handleConfirmBorrow}
        isLoading={borrowBookMutation.isPending}
      />
    </div>
  );
}

export default function UserBooksPage() {
  return (
    <Suspense fallback={<BooksPageFallback />}>
      <BooksPageContent />
    </Suspense>
  );
}