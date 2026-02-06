'use client';

import BookLoansTable from "@/components/BookLoansTable";
import ViewBookLoanModal from "@/components/ViewBookLoanModal";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { usePagination } from "@/hooks/usePagination";
import { useGlobalNotification } from '@/hooks/useGlobalNotification';

interface Borrow {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: string;
  dueDate?: string;
  returnDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'OVERDUE' | 'RETURN_REQUESTED';
  user: {
    id: string;
    name: string;
    email: string;
    level?: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    ISBN: string;
    cover_image?: string;
  };
}

interface BorrowDetail {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: string;
  dueDate?: string;
  returnDate?: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    level?: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    ISBN: string;
    cover_image?: string;
  };
}

export default function BookLoansPage() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { showSuccess, showError, showWarning, showInfo } = useGlobalNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingLoan, setViewingLoan] = useState<BorrowDetail | null>(null);
  const [borrowsData, setBorrowsData] = useState<Borrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Loading states for individual actions
  const [loadingActions, setLoadingActions] = useState<{[key: string]: boolean}>({});

  // Fetch borrows on mount
  useEffect(() => {
    const fetchBorrows = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          router.push('/');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const url = statusFilter 
          ? `${apiUrl}/admin/borrows?status=${encodeURIComponent(statusFilter)}`
          : `${apiUrl}/admin/borrows`;
          
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBorrowsData(data.borrows || []);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch borrows:', response.status, errorText);
          setError(`Failed to fetch borrows: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error('Error fetching borrows:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error loading borrows: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBorrows();
  }, [router, statusFilter]);

  // Filter borrows based on search query - backend already sorts by recent activity
  const filteredData = borrowsData
    .filter(borrow =>
      (borrow.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrow.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrow.book.ISBN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrow.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .map(borrow => ({
      id: borrow.id,
      cover: borrow.book.cover_image,
      title: borrow.book.title,
      borrower: borrow.user.name,
      borrowDate: new Date(borrow.borrowDate).toLocaleDateString('en-GB'),
      returnDate: borrow.status === 'RETURNED' 
        ? (borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString('en-GB') : 'Unknown')
        : (borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString('en-GB') : 'No due date set'),
      status: borrow.status === 'PENDING' ? 'Pending' as const :
               borrow.status === 'APPROVED' ? 'Active' as const : 
               borrow.status === 'OVERDUE' ? 'Overdue' as const :
               borrow.status === 'RETURN_REQUESTED' ? 'Return Pending' as const :
               borrow.status === 'RETURNED' ? 'Returned' as const :
               borrow.status === 'REJECTED' ? 'Rejected' as const :
               'Active' as const,
    }));

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  const handleViewLoan = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/borrows/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setViewingLoan(data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching borrow details:', err);
    }
  };

  const handleApprove = async (id: string) => {
    // Set loading state for this specific action
    setLoadingActions(prev => ({ ...prev, [`approve-${id}`]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      // Find the borrow record to check its current status
      const borrowRecord = borrowsData.find(b => b.id === id);
      if (!borrowRecord) {
        showError('Error', 'Borrow record not found');
        return;
      }

      // Check if the borrow is in the correct status for approval
      if (borrowRecord.status !== 'PENDING') {
        showWarning(
          'Cannot Approve', 
          `This borrow request cannot be approved. Current status: ${borrowRecord.status}. Only "Pending" requests can be approved.`
        );
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/borrows/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess('Success', 'Borrow request approved successfully');
        // Refresh borrows list
        const borrowsResponse = await fetch(`${apiUrl}/admin/borrows`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (borrowsResponse.ok) {
          const data = await borrowsResponse.json();
          setBorrowsData(data.borrows || []);
        }
      } else {
        const errorData = await response.json();
        showError('Approval Failed', errorData.message || 'Failed to approve borrow');
      }
    } catch (err) {
      console.error('Error approving borrow:', err);
      showError('Error', 'Error approving borrow');
    } finally {
      // Clear loading state
      setLoadingActions(prev => ({ ...prev, [`approve-${id}`]: false }));
    }
  };

  const handleReturn = async (id: string) => {
    // Set loading state for this specific action
    setLoadingActions(prev => ({ ...prev, [`return-${id}`]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      // Find the borrow record to check its current status
      const borrowRecord = borrowsData.find(b => b.id === id);
      if (!borrowRecord) {
        showError('Error', 'Borrow record not found');
        return;
      }

      // Check if the borrow is in the correct status for return approval
      if (borrowRecord.status !== 'RETURN_REQUESTED') {
        showWarning(
          'Cannot Approve Return', 
          `This book cannot be returned. Current status: ${borrowRecord.status}. Only books with "Return Requested" status can be approved for return.`
        );
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/borrows/${id}/return`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess('Success', 'Book return approved successfully');
        // Refresh borrows list
        const borrowsResponse = await fetch(`${apiUrl}/admin/borrows`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (borrowsResponse.ok) {
          const data = await borrowsResponse.json();
          setBorrowsData(data.borrows || []);
        }
      } else {
        const errorData = await response.json();
        showError('Return Failed', errorData.message || 'Failed to return book');
      }
    } catch (err) {
      console.error('Error returning book:', err);
      showError('Error', 'Error returning book');
    } finally {
      // Clear loading state
      setLoadingActions(prev => ({ ...prev, [`return-${id}`]: false }));
    }
  };

  const handleReject = async (id: string) => {
    // Set loading state for this specific action
    setLoadingActions(prev => ({ ...prev, [`reject-${id}`]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      // Find the borrow record to check its current status
      const borrowRecord = borrowsData.find(b => b.id === id);
      if (!borrowRecord) {
        showError('Error', 'Borrow record not found');
        return;
      }

      // Check if the borrow is in the correct status for rejection
      if (borrowRecord.status !== 'PENDING') {
        showWarning(
          'Cannot Reject', 
          `This borrow request cannot be rejected. Current status: ${borrowRecord.status}. Only "Pending" requests can be rejected.`
        );
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/borrows/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess('Success', 'Borrow request rejected successfully');
        // Refresh borrows list
        const borrowsResponse = await fetch(`${apiUrl}/admin/borrows`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (borrowsResponse.ok) {
          const data = await borrowsResponse.json();
          setBorrowsData(data.borrows || []);
        }
      } else {
        const errorData = await response.json();
        showError('Rejection Failed', errorData.message || 'Failed to reject borrow');
      }
    } catch (err) {
      console.error('Error rejecting borrow:', err);
      showError('Error', 'Error rejecting borrow');
    } finally {
      // Clear loading state
      setLoadingActions(prev => ({ ...prev, [`reject-${id}`]: false }));
    }
  };

  const handleRejectReturn = async (id: string) => {
    // Set loading state for this specific action
    setLoadingActions(prev => ({ ...prev, [`reject-return-${id}`]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      // Find the borrow record to check its current status
      const borrowRecord = borrowsData.find(b => b.id === id);
      if (!borrowRecord) {
        showError('Error', 'Borrow record not found');
        return;
      }

      // Check if the borrow is in the correct status for return rejection
      if (borrowRecord.status !== 'RETURN_REQUESTED') {
        showWarning(
          'Cannot Reject Return', 
          `This return request cannot be rejected. Current status: ${borrowRecord.status}. Only books with "Return Requested" status can be rejected.`
        );
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/borrows/${id}/reject-return`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess('Success', 'Return request rejected successfully');
        // Refresh borrows list
        const borrowsResponse = await fetch(`${apiUrl}/admin/borrows`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (borrowsResponse.ok) {
          const data = await borrowsResponse.json();
          setBorrowsData(data.borrows || []);
        }
      } else {
        const errorData = await response.json();
        showError('Return Rejection Failed', errorData.message || 'Failed to reject return');
      }
    } catch (err) {
      console.error('Error rejecting return:', err);
      showError('Error', 'Error rejecting return');
    } finally {
      // Clear loading state
      setLoadingActions(prev => ({ ...prev, [`reject-return-${id}`]: false }));
    }
  };

  const statusOptions = [
    { value: '', label: 'All status' },
    { value: 'PENDING', label: 'Pending (Borrow)' },
    { value: 'RETURN_REQUESTED', label: 'Pending (Return)' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'RETURNED', label: 'Returned' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="w-full">
      {isLoading && (
        <div className="w-full">
          {/* Header Skeleton */}
          <div className="flex gap-4 mb-6 items-center">
            <div className="w-1/2 flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-200 animate-pulse h-10">
              <Search className="h-5 w-5 text-gray-400" />
              <div className="flex-1 h-4 bg-gray-300 rounded" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-200 animate-pulse h-10 w-32">
                <div className="flex-1 h-4 bg-gray-300 rounded" />
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <TableSkeleton rows={10} columns={7} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="flex gap-4 mb-6 items-center">
            <div className="w-1/2 flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-2 bg-white">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="search by title,author,isbn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
            <div className="flex-1 hidden md:block" />
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full md:w-auto bg-white border-2 border-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium text-sm">
                {statusOptions.find(option => option.value === statusFilter)?.label || 'All status'}
                <ChevronDown className="h-4 w-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ViewBookLoanModal
            isOpen={isViewModalOpen}
            loan={viewingLoan}
            onClose={() => {
              setIsViewModalOpen(false);
              setViewingLoan(null);
            }}
            onApprove={handleApprove}
            onReturn={handleReturn}
            onReject={handleReject}
            onRejectReturn={handleRejectReturn}
            loadingActions={loadingActions}
          />

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <BookLoansTable 
              data={paginatedData as any}
              onView={handleViewLoan}
              onApprove={handleApprove}
              onReturn={handleReturn}
              onReject={handleReject}
              onRejectReturn={handleRejectReturn}
              isLoading={isLoading}
              loadingActions={loadingActions}
            />

            <div className="mt-8 flex items-center justify-between px-8 py-6">
              <p className="text-sm text-gray-600">Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      page === currentPage 
                        ? 'bg-slate-900 text-white' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}>
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
