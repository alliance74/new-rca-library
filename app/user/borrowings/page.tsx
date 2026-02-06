'use client';

import StatCard from "@/components/StatCard";
import ViewModal from "@/components/ViewModal";
import ReturnConfirmModal from "@/components/ReturnConfirmModal";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Search, CheckCircle, BookOpen, Calendar, Clock, Eye, RotateCcw, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useBorrowings, useReturnBook } from "@/hooks/useBorrowings";
import { useGlobalNotification } from '@/hooks/useGlobalNotification';
import ExpandableText from '@/components/ExpandableText';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

export default function BorrowingsPage() {
  const { showSuccess, showError } = useGlobalNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBookForReturn, setSelectedBookForReturn] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'RETURNED' | 'OVERDUE' | 'REJECTED' | 'RETURN_REQUESTED'>('ALL');

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API hooks
  const { data: borrowingsData, isLoading: borrowingsLoading, error: borrowingsError } = useBorrowings({
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const returnBookMutation = useReturnBook();

  // Update current page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  const borrowings = borrowingsData ? [...borrowingsData.currentBorrows, ...borrowingsData.borrowHistory] : [];
  const totalBorrowings = borrowings.length;

  // Since the API doesn't support pagination for user borrowings, we'll handle it client-side
  const totalPages = Math.ceil(totalBorrowings / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Filter borrowings by search query and status (client-side)
  const filteredBorrowings = useMemo(() => {
    let filtered = borrowings;
    
    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(borrowing => borrowing.status === statusFilter);
    }
    
    // Filter by search query
    if (debouncedSearchQuery) {
      filtered = filtered.filter(borrowing =>
        borrowing.book.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        borrowing.book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [borrowings, debouncedSearchQuery, statusFilter]);

  // Client-side pagination
  const paginatedBorrowings = filteredBorrowings.slice(startIndex, endIndex);

  // Calculate stats from real data with proper logic (focused on borrowings page context)
  const stats = useMemo(() => {
    if (!borrowingsData) {
      return [
        { icon: CheckCircle, label: "Returned", value: "0", change: "No data" },
        { icon: BookOpen, label: "Active borrows", value: "0", change: "No data" },
        { icon: Calendar, label: "Due soon", value: "0", change: "No data" },
        { icon: Clock, label: "Overdue", value: "0", change: "No data" },
      ];
    }

    const stats = borrowingsData.statistics;
    
    // Calculate due soon (approved books due within 3 days)
    const dueSoon = borrowingsData.currentBorrows.filter(b => {
      if (b.status !== 'APPROVED' || !b.dueDate) return false;
      const dueDate = new Date(b.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    }).length;

    return [
      {
        icon: CheckCircle,
        label: "Returned",
        value: stats.returned.toString(),
        change: stats.returned > 0 ? `Total returned books` : "No returns yet",
      },
      {
        icon: BookOpen,
        label: "Active borrows",
        value: stats.currentlyBorrowed.toString(),
        change: stats.currentlyBorrowed > 0 ? "Currently borrowed" : "No active borrows",
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
        value: stats.overdue.toString(),
        change: stats.overdue > 0 ? "Needs attention" : "All up to date",
      },
    ];
  }, [borrowingsData]);

  // Helper function to calculate days remaining
  const getDaysRemaining = (dueDate: string | undefined, status: string) => {
    if (status === 'RETURNED' || status === 'REJECTED') return 'Returned';
    if (status === 'RETURN_REQUESTED') return 'Return pending';
    if (status === 'OVERDUE') return 'Overdue';
    if (status === 'PENDING') return 'Pending approval';
    if (!dueDate) return 'No due date';
    
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleView = (borrowingId: string) => {
    const borrowing = borrowings.find(b => b.id === borrowingId);
    if (borrowing) {
      // Type assertion to access additional properties that might exist
      const book = borrowing.book as any;
      
      const bookDetails: BookDetails = {
        id: book.id,
        title: book.title,
        ISBN: book.ISBN || 'N/A',
        author: book.author,
        genre: book.genre || 'N/A',
        publisher: book.publisher || 'N/A',
        publicationYear: book.publicationYear || undefined,
        edition: book.edition || 'N/A',
        description: book.description || 'No description available',
        totalCopies: book.totalCopies || 0,
        availableCopies: book.availableCopies || 0,
        cover_image: book.cover_image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSelectedBook(bookDetails);
      setIsModalOpen(true);
    }
  };

  const handleReturn = (borrowingId: string) => {
    const borrowing = borrowings.find(b => b.id === borrowingId);
    if (borrowing) {
      setSelectedBookForReturn({
        id: borrowing.id,
        title: borrowing.book.title,
        cover: borrowing.book.cover_image,
      });
      setIsReturnModalOpen(true);
    }
  };

  const handleConfirmReturn = async () => {
    if (selectedBookForReturn) {
      try {
        await returnBookMutation.mutateAsync(selectedBookForReturn.id);
        showSuccess('Return Request Submitted', 'Your return request has been submitted successfully and is pending librarian approval.');
      } catch (error) {
        console.error('Error submitting return request:', error);
        showError('Return Request Failed', 'Failed to submit return request. Please try again.');
      }
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    const maxPages = Math.ceil(filteredBorrowings.length / itemsPerPage);
    if (currentPage < maxPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Loading state
  if (borrowingsLoading) {
    return (
      <div>
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>

        {/* Table Skeleton */}
        <TableSkeleton rows={10} columns={8} />
      </div>
    );
  }

  // Error state
  if (borrowingsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading borrowings</p>
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

      {/* Borrowings Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search borrowings"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="RETURN_REQUESTED">Return Requested</option>
                <option value="RETURNED">Returned</option>
                <option value="OVERDUE">Overdue</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors border-none outline-none"
                style={{ backgroundColor: "#001240" }}
              >
                <option value={5}>Show 5</option>
                <option value={10}>Show 10</option>
                <option value={25}>Show 25</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Empty State */}
        {filteredBorrowings.length === 0 && !borrowingsLoading && (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowings found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'You haven\'t borrowed any books yet'}
            </p>
          </div>
        )}

        {/* Desktop Table View */}
        {filteredBorrowings.length > 0 && (
          <div className="hidden lg:block">
            <div className="bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[800px]">
                  <TableHeader style={{ backgroundColor: "#001240" }} className="text-white rounded-none">
                    <TableRow className="hover:bg-opacity-90 rounded-none" style={{ backgroundColor: "#001240" }}>
                      <TableHead className="text-white">Cover</TableHead>
                      <TableHead className="text-white">Book Title</TableHead>
                      <TableHead className="text-white">Author</TableHead>
                      <TableHead className="text-white">Borrow Date</TableHead>
                      <TableHead className="text-white">Due Date</TableHead>
                      <TableHead className="text-white">Days Left</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBorrowings.map((borrowing, index) => (
                        <TableRow key={borrowing.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <TableCell className="p-2">
                            <img
                              src={borrowing.book.cover_image || '/assets/book-profile.png'}
                              alt={borrowing.book.title}
                              className="h-8 w-6 rounded object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/assets/book-profile.png";
                              }}
                            />
                          </TableCell>
                          <TableCell className="p-2 text-gray-900">
                            <div className="max-w-[200px] truncate" title={borrowing.book.title}>
                              {borrowing.book.title}
                            </div>
                          </TableCell>
                          <TableCell className="p-2 text-gray-900">
                            <div className="max-w-[150px] truncate" title={borrowing.book.author}>
                              {borrowing.book.author}
                            </div>
                          </TableCell>
                          <TableCell className="p-2 text-gray-900 text-xs">{formatDate(borrowing.borrowDate)}</TableCell>
                          <TableCell className="p-2 text-gray-900 text-xs">
                            {borrowing.dueDate ? formatDate(borrowing.dueDate) : 'Not set'}
                          </TableCell>
                          <TableCell className="p-2 text-gray-900 text-xs">
                            <span className={`${
                              borrowing.status === 'OVERDUE' ? 'text-red-600' : 
                              borrowing.status === 'RETURNED' || borrowing.status === 'REJECTED' ? 'text-green-600' : 
                              borrowing.status === 'RETURN_REQUESTED' ? 'text-blue-600' :
                              borrowing.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-900'
                            }`}>
                              {getDaysRemaining(borrowing.dueDate, borrowing.status)}
                            </span>
                          </TableCell>
                          <TableCell className="p-2">
                            <span
                              className={`px-1 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                borrowing.status === 'APPROVED' ? 'text-white' :
                                borrowing.status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                                borrowing.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                borrowing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                borrowing.status === 'RETURN_REQUESTED' ? 'bg-blue-100 text-blue-800' :
                                borrowing.status === 'REJECTED' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                              }`}
                              style={borrowing.status === 'APPROVED' ? { backgroundColor: "#001240" } : {}}
                            >
                              {borrowing.status === 'APPROVED' ? 'Active' : 
                               borrowing.status === 'RETURNED' ? 'Returned' : 
                               borrowing.status === 'OVERDUE' ? 'Overdue' :
                               borrowing.status === 'PENDING' ? 'Pending' :
                               borrowing.status === 'RETURN_REQUESTED' ? 'Return Pending' :
                               borrowing.status === 'REJECTED' ? 'Rejected' : borrowing.status}
                            </span>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex items-center gap-1">
                              {(borrowing.status === 'APPROVED' || borrowing.status === 'OVERDUE') && (
                                <button
                                  onClick={() => handleReturn(borrowing.id)}
                                  className="p-1 text-white rounded transition-colors"
                                  style={{ backgroundColor: "#001240" }}
                                  aria-label="Request Return"
                                  title="Request to Return Book"
                                  disabled={returnBookMutation.isPending}
                                >
                                  {returnBookMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-3 w-3" />
                                  )}
                                </button>
                              )}
                              {borrowing.status === 'RETURN_REQUESTED' && (
                                <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded whitespace-nowrap">
                                  Pending
                                </span>
                              )}
                              <button
                                onClick={() => handleView(borrowing.id)}
                                className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                aria-label="View"
                              >
                                <Eye className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              
                {/* Desktop Pagination */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredBorrowings.length)} of {filteredBorrowings.length} results
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
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
                            style={currentPage === pageNum ? { backgroundColor: '#001240' } : {}}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        )}

        {/* Mobile Card View */}
        {filteredBorrowings.length > 0 && (
          <div className="block lg:hidden">
            <div className="space-y-4 p-4">
              {paginatedBorrowings.map((borrowing) => (
                <div key={borrowing.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <img
                        src={borrowing.book.cover_image || '/assets/book-profile.png'}
                        alt={borrowing.book.title}
                        className="h-12 w-9 rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/book-profile.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <ExpandableText 
                        text={borrowing.book.title} 
                        maxLength={50} 
                        className="font-medium text-gray-900"
                      />
                      <p className="text-sm text-gray-600">{borrowing.book.author}</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Borrowed:</span>
                          <span>{formatDate(borrowing.borrowDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due:</span>
                          <span>{borrowing.dueDate ? formatDate(borrowing.dueDate) : 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Days left:</span>
                          <span className={`${
                            borrowing.status === 'OVERDUE' ? 'text-red-600' : 
                            borrowing.status === 'RETURNED' || borrowing.status === 'REJECTED' ? 'text-green-600' : 
                            borrowing.status === 'PENDING' ? 'text-yellow-600' : 'text-orange-600'
                          }`}>
                            {getDaysRemaining(borrowing.dueDate, borrowing.status)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            borrowing.status === 'APPROVED' ? 'text-white' :
                            borrowing.status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                            borrowing.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                            borrowing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            borrowing.status === 'RETURN_REQUESTED' ? 'bg-blue-100 text-blue-800' :
                            borrowing.status === 'REJECTED' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                          }`}
                          style={borrowing.status === 'APPROVED' ? { backgroundColor: "#001240" } : {}}
                        >
                          {borrowing.status === 'APPROVED' ? 'Active' : 
                           borrowing.status === 'RETURNED' ? 'Returned' : 
                           borrowing.status === 'OVERDUE' ? 'Overdue' :
                           borrowing.status === 'PENDING' ? 'Pending' :
                           borrowing.status === 'RETURN_REQUESTED' ? 'Return Pending' :
                           borrowing.status === 'REJECTED' ? 'Rejected' : borrowing.status}
                        </span>
                        <div className="flex items-center gap-2">
                          {(borrowing.status === 'APPROVED' || borrowing.status === 'OVERDUE') && (
                            <button
                              onClick={() => handleReturn(borrowing.id)}
                              className="p-2 text-white rounded transition-colors"
                              style={{ backgroundColor: "#001240" }}
                              aria-label="Request Return"
                              title="Request to Return Book"
                              disabled={returnBookMutation.isPending}
                            >
                              {returnBookMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {borrowing.status === 'RETURN_REQUESTED' && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Return Pending
                            </span>
                          )}
                          <button
                            onClick={() => handleView(borrowing.id)}
                            className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                            aria-label="View"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mobile Pagination */}
            <div className="p-4">
              <div className="flex flex-col gap-3">
                <div className="text-center text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBorrowings.length)} of {filteredBorrowings.length} results
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-1 text-sm text-white rounded" style={{ backgroundColor: '#001240' }}>
                    {currentPage} of {totalPages}
                  </span>
                  
                  <button 
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <ViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="book"
        data={selectedBook}
      />

      {/* Return Confirmation Modal */}
      <ReturnConfirmModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onConfirm={handleConfirmReturn}
        book={selectedBookForReturn}
      />
    </div>
  );
}