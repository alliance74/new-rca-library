'use client';

import { Suspense } from 'react';
import StatCard from "@/components/StatCard";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Search, DollarSign, AlertTriangle, CheckCircle, Clock, Eye, X, CreditCard } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMyFines } from '@/hooks/useFines';
import { QueryFinesParams } from '@/services/finesService';
import { useNotifications } from '@/contexts/NotificationContext';
import finesService from '@/services/finesService';

// Loading fallback component
function UserFinesPageFallback() {
  return (
    <div>
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={5} columns={6} />
    </div>
  );
}

// Main data component
function UserFinesPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedFine, setSelectedFine] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPayingFine, setIsPayingFine] = useState<string | null>(null);

  const { addNotification } = useNotifications();

  // Build query parameters
  const queryParams: QueryFinesParams = {
    search: searchQuery || undefined,
    page: currentPage,
    limit: itemsPerPage,
  };

  // API hooks
  const { data: finesData, isLoading: finesLoading, error: finesError } = useMyFines(queryParams);

  const fines = finesData?.fines || [];
  const pagination = finesData?.pagination;

  // Calculate stats from real data
  const totalFines = fines.length;
  const unpaidFines = fines.filter(f => f.status === 'UNPAID').length;
  const totalAmount = fines.reduce((sum, f) => sum + f.amount, 0);
  const unpaidAmount = fines.filter(f => f.status === 'UNPAID').reduce((sum, f) => sum + f.amount, 0);

  const stats = [
    {
      icon: DollarSign,
      label: "Total Fines",
      value: totalFines.toString(),
      change: `${totalAmount.toLocaleString()} RWF total`,
    },
    {
      icon: AlertTriangle,
      label: "Unpaid Fines",
      value: unpaidFines.toString(),
      change: `${unpaidAmount.toLocaleString()} RWF pending`,
    },
    {
      icon: CheckCircle,
      label: "Paid Fines",
      value: (totalFines - unpaidFines).toString(),
      change: `${(totalAmount - unpaidAmount).toLocaleString()} RWF paid`,
    },
    {
      icon: Clock,
      label: "Avg Days Late",
      value: Math.round(fines.reduce((sum, f) => sum + f.daysOverdue, 0) / fines.length || 0).toString(),
      change: "Average across all fines",
    },
  ];

  const handleViewFine = (fine: any) => {
    setSelectedFine(fine);
    setIsViewModalOpen(true);
  };

  const handlePayFine = async (fine: any) => {
    setIsPayingFine(fine.id);
    
    try {
      await finesService.markFineAsPaid(fine.id);
      addNotification({
        title: 'Payment Successful',
        message: `Fine of ${fine.amount.toLocaleString()} RWF has been paid successfully`,
        type: 'success',
        timestamp: new Date(),
      });
      
      // Refresh the fines data
      window.location.reload();
    } catch (error: any) {
      addNotification({
        title: 'Payment Failed',
        message: error.response?.data?.message || 'Failed to process payment',
        type: 'error',
        timestamp: new Date(),
      });
    } finally {
      setIsPayingFine(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const calculateDaysUnpaid = (createdAt: string, status: string) => {
    if (status === 'PAID') return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">My Fines</h1>
          <p className="text-xs sm:text-sm text-gray-600">View your library fines for overdue books and track your payment history.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {finesLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              variant="dark"
            />
          ))
        )}
      </div>

      {/* Fines Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fines by book title or reason"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  style={{ borderRadius: '5px' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={itemsPerPage >= (pagination?.total || 0) ? (pagination?.total || itemsPerPage) : itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 sm:px-4 py-2 text-white rounded-[5px] hover:bg-opacity-90 transition-colors border-none outline-none text-sm"
                style={{ backgroundColor: "#001240" }}
              >
                <option value={5} className="bg-white text-gray-900">5 rows</option>
                <option value={10} className="bg-white text-gray-900">10 rows</option>
                <option value={25} className="bg-white text-gray-900">25 rows</option>
                <option value={pagination?.total || 100} className="bg-white text-gray-900">All rows ({pagination?.total || 0})</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Empty State */}
        {finesLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : fines.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <CheckCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fines found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'You have no library fines. Great job returning books on time!'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {fines.map((fine) => (
                <div key={fine.id} className={`p-4 border-b border-gray-200 last:border-b-0`}>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <img
                        src={fine.book.cover_image || '/assets/book-profile.png'}
                        alt={fine.book.title}
                        className="h-16 w-12 rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/book-profile.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900" title={fine.book.title}>
                        {truncateText(fine.book.title, 40)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1" title={fine.reason}>
                        {truncateText(fine.reason, 50)}
                      </p>
                      <p className="text-sm text-gray-600">Amount: {fine.amount.toLocaleString()} RWF</p>
                      <p className="text-sm text-gray-600">Days late: {fine.daysOverdue}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(fine.status)}`}>
                          {fine.status}
                        </span>
                        <div className="flex items-center gap-2">
                          {fine.status === 'UNPAID' && (
                            <button
                              onClick={() => handlePayFine(fine)}
                              disabled={isPayingFine === fine.id}
                              className="p-2 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ borderRadius: '5px' }}
                              title="Pay Fine"
                            >
                              {isPayingFine === fine.id ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <CreditCard className="h-4 w-4 text-green-600" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleViewFine(fine)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 transition-colors"
                            style={{ borderRadius: '5px' }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </button>
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
                    <TableHead className="text-white min-w-[200px] px-3">Book Title</TableHead>
                    <TableHead className="text-white min-w-[150px] pl-4">Reason</TableHead>
                    <TableHead className="text-white w-24 pl-4">Amount</TableHead>
                    <TableHead className="text-white w-20 pl-4">Days</TableHead>
                    <TableHead className="text-white w-24 pl-4">Status</TableHead>
                    <TableHead className="text-white w-40 pl-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fines.map((fine, index) => (
                    <TableRow key={fine.id} className={`border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <TableCell className="p-2 w-12">
                        <img
                          src={fine.book.cover_image || '/assets/book-profile.png'}
                          alt={fine.book.title}
                          className="h-10 w-8 rounded object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/assets/book-profile.png";
                          }}
                        />
                      </TableCell>
                      <TableCell className="p-3 text-gray-900 min-w-[200px]">
                        <div>
                          <div className="font-medium" title={fine.book.title}>
                            {truncateText(fine.book.title, 30)}
                          </div>
                          <div className="text-sm text-gray-600" title={fine.book.ISBN}>
                            {fine.book.ISBN}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-3 text-gray-900 min-w-[150px] pl-4">
                        <div title={fine.reason}>
                          {truncateText(fine.reason, 25)}
                        </div>
                      </TableCell>
                      <TableCell className="p-3 w-24 pl-4">
                        <span className="font-semibold text-gray-900">
                          {fine.amount.toLocaleString()} RWF
                        </span>
                      </TableCell>
                      <TableCell className="p-3 w-20 pl-4">
                        <span className="text-red-600 font-medium">
                          {fine.daysOverdue}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 w-24 pl-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(fine.status)}`}>
                          {fine.status}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 w-40 pl-4">
                        <div className="flex items-center gap-1">
                          {fine.status === 'UNPAID' && (
                            <button
                              onClick={() => handlePayFine(fine)}
                              disabled={isPayingFine === fine.id}
                              className="p-1.5 bg-green-50 hover:bg-green-100 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ borderRadius: '5px' }}
                              title="Pay Fine"
                            >
                              {isPayingFine === fine.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <CreditCard className="h-3.5 w-3.5 text-green-600 group-hover:text-green-700" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleViewFine(fine)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 transition-colors group"
                            style={{ borderRadius: '5px' }}
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-600 group-hover:text-blue-700" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderRadius: '5px' }}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm transition-colors ${
                        currentPage === pageNum
                          ? 'text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                      style={currentPage === pageNum ? { backgroundColor: "#001240", borderRadius: '5px' } : { borderRadius: '5px' }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderRadius: '5px' }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Fine Modal */}
      {isViewModalOpen && selectedFine && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsViewModalOpen(false)}
          />
          <div className="relative bg-white shadow-lg w-full max-w-2xl mx-4" style={{ borderRadius: '5px' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#001240' }}>
              <h2 className="text-xl font-bold text-white">Fine Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <img
                  src={selectedFine.book.cover_image || '/assets/book-profile.png'}
                  alt={selectedFine.book.title}
                  className="h-32 w-24 rounded object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/book-profile.png";
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedFine.book.title}</h3>
                  <p className="text-gray-600 mb-2">ISBN: {selectedFine.book.ISBN}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fine Amount</label>
                      <p className="text-lg font-semibold text-red-600">{selectedFine.amount.toLocaleString()} RWF</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedFine.status)}`}>
                        {selectedFine.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <p className="text-gray-900">{selectedFine.reason}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days Overdue</label>
                  <p className="text-red-600 font-medium">{selectedFine.daysOverdue} days</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Borrowed Date</label>
                  <p className="text-gray-900">{selectedFine.borrow ? formatDate(selectedFine.borrow.borrowDate) : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days Unpaid</label>
                  <p className={`font-medium ${selectedFine.status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateDaysUnpaid(selectedFine.createdAt, selectedFine.status)} days
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fine Created</label>
                  <p className="text-gray-900">{formatDate(selectedFine.createdAt)}</p>
                </div>
                {selectedFine.paidAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid Date</label>
                    <p className="text-green-600">{formatDate(selectedFine.paidAt)}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors"
                  style={{ borderRadius: '5px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserFinesPage() {
  return (
    <Suspense fallback={<UserFinesPageFallback />}>
      <UserFinesPageContent />
    </Suspense>
  );
}